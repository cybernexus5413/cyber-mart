import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Plus,
  Server,
  Sliders,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  AdminUser,
  Machine,
  PaymentGatewayConfig,
  ProductSlot,
  SaleTransaction,
} from '../../types/vending';
import { AdminDashboard } from './AdminDashboard';

interface SuperAdminDashboardProps {
  user: AdminUser;
  machines: Machine[];
  activeMachineId: string;
  admins: AdminUser[];
  transactions: SaleTransaction[];
  onBackToKiosk: () => void;
  onSwitchActiveMachine: (machineId: string) => void;
  onAddMachine: (payload: {
    id: string;
    name: string;
    location: string;
    assignedAdminId: string;
  }) => void;
  onUpdateMachine: (
    machineId: string,
    updates: Partial<Pick<Machine, 'name' | 'location' | 'status' | 'assignedAdminId'>>
  ) => void;
  onUpsertAdmin: (admin: AdminUser) => void;
  onDeleteAdmin: (adminId: string) => void;
  onSavePaymentConfig: (machineId: string, config: PaymentGatewayConfig) => void;
  onUpdateSlot: (machineId: string, slotCode: string, updates: Partial<ProductSlot>) => void;
  onFillAllToTen: (machineId: string) => void;
  onRemoteDispense: (slot: ProductSlot, machineId: string) => void;
  onUpdatePromo: (
    machineId: string,
    promo: { promoImageUrl?: string; promoTitle?: string; promoSubtitle?: string }
  ) => void;
}

type SuperTab = 'fleet' | 'admins' | 'payments' | 'operations';

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  user,
  machines,
  activeMachineId,
  admins,
  transactions,
  onBackToKiosk,
  onSwitchActiveMachine,
  onAddMachine,
  onUpdateMachine,
  onUpsertAdmin,
  onDeleteAdmin,
  onSavePaymentConfig,
  onUpdateSlot,
  onFillAllToTen,
  onRemoteDispense,
  onUpdatePromo,
}) => {
  const [activeTab, setActiveTab] = useState<SuperTab>('fleet');
  const [selectedMachineId, setSelectedMachineId] = useState<string>(activeMachineId);
  const [showAddMachine, setShowAddMachine] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [savedNotice, setSavedNotice] = useState<string>('');

  const [newMachineId, setNewMachineId] = useState('');
  const [newMachineName, setNewMachineName] = useState('');
  const [newMachineLocation, setNewMachineLocation] = useState('');
  const [newMachineAdminId, setNewMachineAdminId] = useState(admins[0]?.id ?? 'adm-1');

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [adminRole, setAdminRole] = useState<'admin' | 'superadmin'>('admin');

  const selectedMachine =
    machines.find((m) => m.id === selectedMachineId) ?? machines[0];

  const [paymentDraft, setPaymentDraft] = useState<PaymentGatewayConfig>(
    selectedMachine.paymentConfig
  );

  useEffect(() => {
    setPaymentDraft(selectedMachine.paymentConfig);
  }, [selectedMachine.id, selectedMachine.paymentConfig]);

  const showToast = (msg: string) => {
    setSavedNotice(msg);
    window.setTimeout(() => setSavedNotice(''), 2800);
  };

  const handleCreateMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachineId.trim() || !newMachineName.trim()) return;
    onAddMachine({
      id: newMachineId,
      name: newMachineName,
      location: newMachineLocation || 'Malaysia Retail Site',
      assignedAdminId: newMachineAdminId,
    });
    setNewMachineId('');
    setNewMachineName('');
    setNewMachineLocation('');
    setShowAddMachine(false);
    showToast('New vending machine added to fleet.');
  };

  const openNewAdminModal = () => {
    setEditingAdmin(null);
    setAdminName('');
    setAdminEmail('');
    setAdminPin('');
    setAdminRole('admin');
    setShowAdminModal(true);
  };

  const openEditAdminModal = (adm: AdminUser) => {
    setEditingAdmin(adm);
    setAdminName(adm.name);
    setAdminEmail(adm.email);
    setAdminPin(adm.pin);
    setAdminRole(adm.role);
    setShowAdminModal(true);
  };

  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(adminPin)) return;
    onUpsertAdmin({
      id: editingAdmin ? editingAdmin.id : `adm-${Date.now()}`,
      name: adminName.trim(),
      email: adminEmail.trim(),
      pin: adminPin,
      role: adminRole,
    });
    setShowAdminModal(false);
    showToast('Admin account saved.');
  };

  const handleSaveGateways = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePaymentConfig(selectedMachine.id, paymentDraft);
    showToast(`Payment Gateway API credentials saved & applied to ${selectedMachine.id}.`);
  };

  const tabs: Array<{ id: SuperTab; label: string; shortLabel: string; icon: React.ReactNode }> = [
    { id: 'fleet', label: 'Fleet Machines', shortLabel: 'Fleet', icon: <Server className="w-5 h-5" /> },
    { id: 'admins', label: 'Admin Users', shortLabel: 'Admins', icon: <Users className="w-5 h-5" /> },
    { id: 'payments', label: 'Payment APIs', shortLabel: 'Payments', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'operations', label: 'Operations', shortLabel: 'Ops', icon: <Sliders className="w-5 h-5" /> },
  ];

  const inputClass =
    'w-full rounded-xl border border-cyan-400/35 bg-[#0D0726]/80 px-3 py-2.5 text-xs text-white placeholder:text-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-400';

  return (
    <div className="min-h-screen cyber-bg text-white pb-24 md:pb-10 relative">
      <div className="pointer-events-none fixed inset-0 cyber-grid-overlay opacity-75" />

      <header className="sticky top-0 z-30 bg-[#120A33]/90 backdrop-blur-xl border-b border-cyan-400/50 shadow-[0_4px_24px_rgba(0,240,255,0.18)]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBackToKiosk}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-cyan-300/60 px-3 py-2 text-xs font-bold text-white whitespace-nowrap shrink-0 min-h-[40px]"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-300" />
              <span>Kiosk</span>
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-base sm:text-lg font-bold text-cyan-200 truncate">
                CYBER MART SuperAdmin
              </h1>
              <p className="text-[11px] text-cyan-100/70 truncate">
                {user.name} · {machines.length} Fleet Machine(s)
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/15">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-400 to-pink-500 text-slate-950 shadow-[0_0_16px_rgba(0,240,255,0.45)]'
                    : 'text-cyan-100 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 pt-5 space-y-5">
        {savedNotice && (
          <div className="rounded-2xl bg-emerald-400/20 border border-emerald-300/70 shadow-[0_0_18px_rgba(52,211,153,0.3)] px-4 py-3 text-xs sm:text-sm font-bold text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedNotice}</span>
          </div>
        )}

        {/* TAB 1: FLEET MANAGEMENT */}
        {activeTab === 'fleet' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  Multi-Machine Fleet Management
                </h2>
                <p className="text-xs text-cyan-200/75">
                  Switch active kiosk terminal, assign admins, or add new machines
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMachine(true)}
                className="cyber-btn-pink rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white inline-flex items-center gap-2 whitespace-nowrap min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Machine</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {machines.map((m) => {
                const isActiveKiosk = m.id === activeMachineId;
                const totalStock = m.slots.reduce((s, sl) => s + sl.stock, 0);

                return (
                  <div
                    key={m.id}
                    className={`cyber-glass-panel rounded-3xl p-5 space-y-4 transition-all ${
                      isActiveKiosk
                        ? 'border-2 border-pink-400 shadow-[0_0_28px_rgba(255,60,172,0.35)]'
                        : 'border border-cyan-400/35'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs font-mono-tabular font-bold text-cyan-300">
                          <span>{m.id}</span>
                          {isActiveKiosk && (
                            <span className="text-pink-300 font-sans">· Active Kiosk</span>
                          )}
                        </div>
                        <h3 className="font-display text-lg font-bold text-white mt-0.5 truncate">
                          {m.name}
                        </h3>
                        <p className="text-xs text-cyan-100/75 truncate">{m.location}</p>
                      </div>

                      <select
                        value={m.status}
                        onChange={(e) =>
                          onUpdateMachine(m.id, {
                            status: e.target.value as 'online' | 'maintenance',
                          })
                        }
                        aria-label={`Status for ${m.name}`}
                        className={`rounded-xl px-2.5 py-1.5 text-xs font-bold border ${
                          m.status === 'online'
                            ? 'bg-emerald-400/20 text-emerald-200 border-emerald-400/50'
                            : 'bg-amber-400/20 text-amber-200 border-amber-400/50'
                        }`}
                      >
                        <option value="online">Online</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                      <div>
                        <label className="block text-cyan-200/75 mb-1">Assigned Admin</label>
                        <select
                          value={m.assignedAdminId}
                          onChange={(e) =>
                            onUpdateMachine(m.id, { assignedAdminId: e.target.value })
                          }
                          className="w-full rounded-xl border border-cyan-400/35 bg-[#0D0726]/80 px-2.5 py-2 text-xs font-semibold text-white"
                        >
                          {admins
                            .filter((a) => a.role === 'admin')
                            .map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name} (PIN {a.pin})
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-cyan-200/75 mb-1">Inventory Fill</p>
                        <p className="font-mono-tabular text-sm font-bold text-white py-2">
                          {totalStock} / 300 units
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSwitchActiveMachine(m.id);
                          setSelectedMachineId(m.id);
                          showToast(`Switched active Kiosk terminal to ${m.id}`);
                        }}
                        disabled={isActiveKiosk}
                        className="flex-1 rounded-xl cyber-btn-mint disabled:opacity-75 text-slate-950 py-2.5 px-3 text-xs font-bold transition-colors min-h-[40px]"
                      >
                        {isActiveKiosk ? 'Currently Active on Kiosk' : 'Set as Active Kiosk'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMachineId(m.id);
                          setActiveTab('payments');
                        }}
                        className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white py-2.5 px-3 text-xs font-bold min-h-[40px]"
                      >
                        API Keys
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMachineId(m.id);
                          setActiveTab('operations');
                        }}
                        className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white py-2.5 px-3 text-xs font-bold min-h-[40px]"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ADMIN USER MANAGEMENT */}
        {activeTab === 'admins' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  Admin &amp; Staff PIN Management
                </h2>
                <p className="text-xs text-cyan-200/75">
                  Create staff PINs and assign them to specific vending machines
                </p>
              </div>
              <button
                type="button"
                onClick={openNewAdminModal}
                className="cyber-btn-pink rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white inline-flex items-center gap-2 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Staff User</span>
              </button>
            </div>

            <div className="cyber-glass-panel rounded-3xl divide-y divide-white/10 overflow-hidden">
              {admins.map((adm) => {
                const assignedMachines = machines.filter(
                  (m) => m.assignedAdminId === adm.id
                );
                return (
                  <div
                    key={adm.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{adm.name}</span>
                        <span className="text-xs font-semibold text-pink-300 uppercase">
                          · {adm.role}
                        </span>
                      </div>
                      <p className="text-xs text-cyan-100/75 mt-0.5">
                        {adm.email} · PIN:{' '}
                        <span className="font-mono-tabular font-bold text-cyan-300">
                          {adm.pin}
                        </span>
                      </p>
                      <p className="text-[11px] text-cyan-200/60 mt-1">
                        {adm.role === 'superadmin'
                          ? 'Full access to all fleet machines'
                          : assignedMachines.length > 0
                            ? `Assigned: ${assignedMachines.map((m) => m.id).join(', ')}`
                            : 'No machines assigned yet'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditAdminModal(adm)}
                        className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-2 text-xs font-bold text-white min-h-[40px]"
                      >
                        Edit PIN / Info
                      </button>
                      {adm.id !== 'super-1' && adm.id !== user.id && (
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteAdmin(adm.id);
                            showToast(`Removed user ${adm.name}.`);
                          }}
                          className="rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/50 p-2.5 text-rose-300 min-h-[40px] min-w-[40px] flex items-center justify-center"
                          aria-label={`Delete ${adm.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT GATEWAY API SLOTS (EMPTY & READY PER MACHINE) */}
        {activeTab === 'payments' && (
          <form onSubmit={handleSaveGateways} className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  Payment Gateway API Slots
                </h2>
                <p className="text-xs text-cyan-200/75">
                  Configure live Malaysian QR credentials independently per machine
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="gateway-machine-select" className="text-xs font-bold text-cyan-200 whitespace-nowrap">
                  Target Machine:
                </label>
                <select
                  id="gateway-machine-select"
                  value={selectedMachine.id}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                  className="rounded-xl border border-cyan-400/40 bg-[#0D0726]/80 px-3 py-2.5 text-xs font-bold text-white"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} — {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* DuitNow QR */}
              <div className="cyber-glass-panel rounded-3xl p-5 space-y-3 border-pink-400/50">
                <div className="pb-3 border-b border-white/10">
                  <span className="inline-block rounded-lg bg-pink-500 text-white text-[11px] font-bold px-2.5 py-1 shadow-[0_0_12px_rgba(255,60,172,0.5)]">
                    DuitNow QR
                  </span>
                  <p className="mt-1.5 text-xs text-cyan-100/75">
                    PayNet / Acquirer DuitNow Merchant API
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-200 mb-1">Merchant ID</label>
                  <input
                    type="text"
                    value={paymentDraft.duitnow.merchantId}
                    onChange={(e) =>
                      setPaymentDraft((p) => ({
                        ...p,
                        duitnow: { ...p.duitnow, merchantId: e.target.value },
                      }))
                    }
                    placeholder="Enter DuitNow Merchant ID"
                    className={`${inputClass} font-mono-tabular`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-200 mb-1">API Key</label>
                  <input
                    type="text"
                    value={paymentDraft.duitnow.apiKey}
                    onChange={(e) =>
                      setPaymentDraft((p) => ({
                        ...p,
                        duitnow: { ...p.duitnow, apiKey: e.target.value },
                      }))
                    }
                    placeholder="Enter DuitNow API Key"
                    className={`${inputClass} font-mono-tabular`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-200 mb-1">Secret Key</label>
                  <input
                    type="password"
                    value={paymentDraft.duitnow.secretKey}
                    onChange={(e) =>
                      setPaymentDraft((p) => ({
                        ...p,
                        duitnow: { ...p.duitnow, secretKey: e.target.value },
                      }))
                    }
                    placeholder="Enter DuitNow Secret Key"
                    className={`${inputClass} font-mono-tabular`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-200 mb-1">Callback Webhook URL</label>
                  <input
                    type="url"
                    value={paymentDraft.duitnow.webhookUrl}
                    onChange={(e) =>
                      setPaymentDraft((p) => ({
                        ...p,
                        duitnow: { ...p.duitnow, webhookUrl: e.target.value },
                      }))
                    }
                    placeholder="https://api.example.my/duitnow/webhook"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Touch 'n Go eWallet */}
              <div className="cyber-glass-panel rounded-3xl p-5 space-y-3 border-cyan-400/50">
                <div className="pb-3 border-b border-white/10">
                  <span className="inline-block rounded-lg bg-cyan-400 text-slate-950 text-[11px] font-bold px-2.5 py-1 shadow-[0_0_12px_rgba(0,240,255,0.5)]">
                    Touch &apos;n Go eWallet
                  </span>
                  <p className="mt-1.5 text-xs text-cyan-100/75">
                    TNG Digital Partner &amp; QR Gateway
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-200 mb-1">Partner ID</label>
                  <input
                    type="text"
                    value={paymentDraft.tng.partnerId}
                    onChange={(e) =>
                      setPaymentDraft((p) => ({
                        ...p,
                        tng: { ...p.tng, partnerId: e.target.value },
                      }))
                    }
                    placeholder="Enter TnG Partner ID"
                    className={`${inputClass} font-mono-tabular`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-200 mb-1">Client Secret</label>
                  <input
                    type="password"
                    value={paymentDraft.tng.clientSecret}
                    onChange={(e) =>
                      setPaymentDraft((p) => ({
                        ...p,
                        tng: { ...p.tng, clientSecret: e.target.value },
                      }))
                    }
                    placeholder="Enter TnG Client Secret"
                    className={`${inputClass} font-mono-tabular`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-200 mb-1">Merchant Code</label>
                  <input
                    type="text"
                    value={paymentDraft.tng.merchantCode}
                    onChange={(e) =>
                      setPaymentDraft((p) => ({
                        ...p,
                        tng: { ...p.tng, merchantCode: e.target.value },
                      }))
                    }
                    placeholder="Enter TnG Merchant Code"
                    className={`${inputClass} font-mono-tabular`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-200 mb-1">Endpoint URL</label>
                  <input
                    type="url"
                    value={paymentDraft.tng.endpointUrl}
                    onChange={(e) =>
                      setPaymentDraft((p) => ({
                        ...p,
                        tng: { ...p.tng, endpointUrl: e.target.value },
                      }))
                    }
                    placeholder="https://api.tngdigital.com.my/..."
                    className={inputClass}
                  />
                </div>
              </div>

              {/* FPX Gateway */}
              <div className="cyber-glass-panel rounded-3xl p-5 space-y-3 border-emerald-400/50">
                <div className="pb-3 border-b border-white/10">
                  <span className="inline-block rounded-lg bg-emerald-400 text-slate-950 text-[11px] font-bold px-2.5 py-1 shadow-[0_0_12px_rgba(52,211,153,0.5)]">
                    FPX Gateway
                  </span>
                  <p className="mt-1.5 text-xs text-cyan-100/75">
                    Malaysian Online Banking QR Settlement
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-200 mb-1">Seller ID</label>
                  <input
                    type="text"
                    value={paymentDraft.fpx.sellerId}
                    onChange={(e) =>
                      setPaymentDraft((p) => ({
                        ...p,
                        fpx: { ...p.fpx, sellerId: e.target.value },
                      }))
                    }
                    placeholder="Enter FPX Seller ID"
                    className={`${inputClass} font-mono-tabular`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-200 mb-1">Exchange ID</label>
                  <input
                    type="text"
                    value={paymentDraft.fpx.exchangeId}
                    onChange={(e) =>
                      setPaymentDraft((p) => ({
                        ...p,
                        fpx: { ...p.fpx, exchangeId: e.target.value },
                      }))
                    }
                    placeholder="Enter FPX Exchange ID"
                    className={`${inputClass} font-mono-tabular`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-200 mb-1">Checksum Key</label>
                  <input
                    type="password"
                    value={paymentDraft.fpx.checksumKey}
                    onChange={(e) =>
                      setPaymentDraft((p) => ({
                        ...p,
                        fpx: { ...p.fpx, checksumKey: e.target.value },
                      }))
                    }
                    placeholder="Enter FPX Checksum Key"
                    className={`${inputClass} font-mono-tabular`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-200 mb-1">Gateway URL</label>
                  <input
                    type="url"
                    value={paymentDraft.fpx.gatewayUrl}
                    onChange={(e) =>
                      setPaymentDraft((p) => ({
                        ...p,
                        fpx: { ...p.fpx, gatewayUrl: e.target.value },
                      }))
                    }
                    placeholder="https://fpx.paynet.my/..."
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto cyber-btn-mint rounded-2xl px-6 py-3.5 text-sm font-bold text-slate-950"
              >
                Save &amp; Apply to Machine ({selectedMachine.id})
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: OPERATIONS */}
        {activeTab === 'operations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-end gap-2">
              <label htmlFor="ops-machine-select" className="text-xs font-bold text-cyan-200">
                Inspect Machine:
              </label>
              <select
                id="ops-machine-select"
                value={selectedMachine.id}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="rounded-xl border border-cyan-400/40 bg-[#0D0726]/80 px-3 py-2 text-xs font-bold text-white"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} — {m.name}
                  </option>
                ))}
              </select>
            </div>

            <AdminDashboard
              user={user}
              machine={selectedMachine}
              transactions={transactions}
              onBackToKiosk={onBackToKiosk}
              onUpdateSlot={onUpdateSlot}
              onFillAllToTen={onFillAllToTen}
              onRemoteDispense={(slot) => onRemoteDispense(slot, selectedMachine.id)}
              onUpdatePromo={onUpdatePromo}
              embedded
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="SuperAdmin Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#120A33]/95 backdrop-blur-xl border-t border-cyan-400/45 pb-safe text-white"
      >
        <div className="grid grid-cols-4 h-14 items-center">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-0.5 h-full text-[11px] font-bold transition-colors ${
                  active ? 'text-cyan-300' : 'text-slate-300'
                }`}
              >
                {tab.icon}
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Add Machine Modal */}
      {showAddMachine && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#09041D]/85 backdrop-blur-md p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleCreateMachine}
            className="cyber-glass-panel w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 border-2 border-cyan-300 space-y-4 text-white"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-white">
                Register New Vending Machine
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMachine(false)}
                className="p-2 rounded-xl text-cyan-200 hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">Machine ID</label>
              <input
                type="text"
                required
                value={newMachineId}
                onChange={(e) => setNewMachineId(e.target.value)}
                placeholder="e.g. MM24-PG-03"
                className={`${inputClass} font-mono-tabular uppercase`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">Machine Name</label>
              <input
                type="text"
                required
                value={newMachineName}
                onChange={(e) => setNewMachineName(e.target.value)}
                placeholder="e.g. Gurney Plaza Lobby"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">Location Address</label>
              <input
                type="text"
                required
                value={newMachineLocation}
                onChange={(e) => setNewMachineLocation(e.target.value)}
                placeholder="e.g. Penang Island, Ground Floor"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">Assigned Admin</label>
              <select
                value={newMachineAdminId}
                onChange={(e) => setNewMachineAdminId(e.target.value)}
                className={inputClass}
              >
                {admins
                  .filter((a) => a.role === 'admin')
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (PIN {a.pin})
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full cyber-btn-pink rounded-2xl py-3 text-sm font-bold text-white"
            >
              Add Machine (30 Slots Initialized)
            </button>
          </form>
        </div>
      )}

      {/* Add/Edit Admin Modal */}
      {showAdminModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#09041D]/85 backdrop-blur-md p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSaveAdmin}
            className="cyber-glass-panel w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 border-2 border-cyan-300 space-y-4 text-white"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-white">
                {editingAdmin ? 'Edit Staff User' : 'Add Staff User'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="p-2 rounded-xl text-cyan-200 hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="e.g. Farah Nabila"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">Email</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="farah@minimart24.my"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-cyan-200 mb-1">4-Digit PIN</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  pattern="\d{4}"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="4 digits"
                  className={`${inputClass} font-mono-tabular`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-cyan-200 mb-1">Role</label>
                <select
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value as 'admin' | 'superadmin')}
                  className={inputClass}
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">SuperAdmin</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full cyber-btn-pink rounded-2xl py-3 text-sm font-bold text-white"
            >
              Save Staff Account
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
