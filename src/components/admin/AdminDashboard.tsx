import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Camera,
  CheckCircle2,
  Cpu,
  ImagePlus,
  Package,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import {
  AdminUser,
  formatRM,
  hasActivePromo,
  Machine,
  ProductCategory,
  ProductIconKey,
  ProductSlot,
  ROW_LETTERS,
  SaleTransaction,
} from '../../types/vending';
import { ProductIllustration } from '../ProductIllustration';
import { compressImageFileToDataUrl } from '../../utils/imageUpload';
import cyberPromoBannerImg from '../../assets/images/cyber_promo_banner_1794515576657.jpg';

interface AdminDashboardProps {
  user: AdminUser;
  machine: Machine;
  transactions: SaleTransaction[];
  onBackToKiosk: () => void;
  onUpdateSlot: (machineId: string, slotCode: string, updates: Partial<ProductSlot>) => void;
  onFillAllToTen: (machineId: string) => void;
  onRemoteDispense: (slot: ProductSlot) => void;
  onUpdatePromo: (
    machineId: string,
    promo: { promoImageUrl?: string; promoTitle?: string; promoSubtitle?: string }
  ) => void;
  embedded?: boolean;
}

type AdminTab = 'sales' | 'stock' | 'dispense' | 'promo';
type PeriodFilter = 'daily' | 'weekly' | 'monthly';

const ICON_OPTIONS: Array<{ value: ProductIconKey; label: string }> = [
  { value: 'milo', label: 'Chocolate Malt Carton' },
  { value: 'cola', label: 'Soda Can' },
  { value: 'water', label: 'Mineral Water Bottle' },
  { value: 'greentea', label: 'Tea Bottle' },
  { value: 'coffee', label: 'Coffee Can' },
  { value: 'oatmilk', label: 'Oat Milk Carton' },
  { value: 'soda_lemon', label: 'Isotonic Can' },
  { value: 'juice_orange', label: 'Juice Bottle' },
  { value: 'chips_bbq', label: 'BBQ Chips Bag' },
  { value: 'chips_cheese', label: 'Cheese Puff Bag' },
  { value: 'chips_sour', label: 'Sour Cream Chips' },
  { value: 'cracker', label: 'Biscuit / Snack Pack' },
  { value: 'wafer', label: 'Wafer Bar' },
  { value: 'chocolate', label: 'Chocolate Bar' },
  { value: 'pocky', label: 'Biscuit Stick Box' },
  { value: 'gummy', label: 'Gummy Candy Pouch' },
  { value: 'noodle_curry', label: 'Curry Cup Noodle' },
  { value: 'noodle_tomyam', label: 'Tom Yam Cup Noodle' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  machine,
  transactions,
  onBackToKiosk,
  onUpdateSlot,
  onFillAllToTen,
  onRemoteDispense,
  onUpdatePromo,
  embedded = false,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('sales');
  const [period, setPeriod] = useState<PeriodFilter>('monthly');
  const [rowFilter, setRowFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSlot, setEditingSlot] = useState<ProductSlot | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  // Edit Slot Form state
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editPromoPrice, setEditPromoPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editCategory, setEditCategory] = useState<ProductCategory>('snack');
  const [editIconKey, setEditIconKey] = useState<ProductIconKey>('chips_bbq');
  const [editCustomImg, setEditCustomImg] = useState('');
  const [uploadingSlotImg, setUploadingSlotImg] = useState(false);

  // Promo Editor state
  const [promoImgDraft, setPromoImgDraft] = useState(machine.promoImageUrl ?? '');
  const [promoTitleDraft, setPromoTitleDraft] = useState(
    machine.promoTitle ?? 'SPECIAL PROMOTION UPDATES'
  );
  const [promoSubDraft, setPromoSubDraft] = useState(
    machine.promoSubtitle ?? 'Tap any promotion price below to add straight to your cart!'
  );
  const [promoSlotCodeDraft, setPromoSlotCodeDraft] = useState('A1');
  const [promoSlotPriceDraft, setPromoSlotPriceDraft] = useState('2.00');
  const [uploadingPromoImg, setUploadingPromoImg] = useState(false);

  useEffect(() => {
    setPromoImgDraft(machine.promoImageUrl ?? '');
    setPromoTitleDraft(machine.promoTitle ?? 'CYBER SNACK DROPS');
    setPromoSubDraft(machine.promoSubtitle ?? 'Scan DuitNow · TnG · FPX');
  }, [machine.id, machine.promoImageUrl, machine.promoTitle, machine.promoSubtitle]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(''), 2800);
  };

  const openSlotEditor = (slot: ProductSlot) => {
    setEditingSlot(slot);
    setEditName(slot.name);
    setEditPrice(slot.price.toFixed(2));
    setEditPromoPrice(
      typeof slot.promoPrice === 'number' && slot.promoPrice > 0
        ? slot.promoPrice.toFixed(2)
        : ''
    );
    setEditStock(String(slot.stock));
    setEditCategory(slot.category);
    setEditIconKey(slot.iconKey);
    setEditCustomImg(slot.customImageUrl ?? '');
  };

  const handleSlotFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSlotImg(true);
    try {
      const dataUrl = await compressImageFileToDataUrl(file, 320, 320, 0.84);
      setEditCustomImg(dataUrl);
    } catch {
      showToast('Could not process image file. Please try JPG or PNG.');
    } finally {
      setUploadingSlotImg(false);
    }
  };

  const handlePromoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPromoImg(true);
    try {
      const dataUrl = await compressImageFileToDataUrl(file, 720, 540, 0.85);
      setPromoImgDraft(dataUrl);
    } catch {
      showToast('Could not process promotion image. Please try JPG or PNG.');
    } finally {
      setUploadingPromoImg(false);
    }
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;
    const parsedPrice = Math.max(0.1, Number.parseFloat(editPrice) || editingSlot.price);
    const parsedPromoRaw = Number.parseFloat(editPromoPrice);
    const parsedPromo =
      editPromoPrice.trim() !== '' &&
      Number.isFinite(parsedPromoRaw) &&
      parsedPromoRaw > 0 &&
      parsedPromoRaw < parsedPrice
        ? Number(parsedPromoRaw.toFixed(2))
        : undefined;
    const parsedStock = Math.max(0, Math.min(20, Number.parseInt(editStock, 10) || 0));

    onUpdateSlot(machine.id, editingSlot.code, {
      name: editName.trim() || editingSlot.name,
      price: Number(parsedPrice.toFixed(2)),
      promoPrice: parsedPromo,
      stock: parsedStock,
      category: editCategory,
      iconKey: editIconKey,
      customImageUrl: editCustomImg.trim() || undefined,
    });
    showToast(`Slot ${editingSlot.code} updated!`);
    setEditingSlot(null);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePromo(machine.id, {
      promoImageUrl: promoImgDraft.trim() || undefined,
      promoTitle: promoTitleDraft.trim() || 'SPECIAL PROMOTION UPDATES',
      promoSubtitle:
        promoSubDraft.trim() ||
        'Tap any promotion price below to add straight to your cart!',
    });
    showToast(`Promotion banner updated for ${machine.id}!`);
  };

  const handleApplySlotPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const target = machine.slots.find((s) => s.code === promoSlotCodeDraft);
    if (!target) return;
    const parsed = Number.parseFloat(promoSlotPriceDraft);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= target.price) {
      showToast(
        `Promo price must be greater than RM 0.00 and lower than ${formatRM(target.price)}.`
      );
      return;
    }
    onUpdateSlot(machine.id, target.code, {
      promoPrice: Number(parsed.toFixed(2)),
    });
    showToast(`Promo set: ${target.code} ${target.name} now ${formatRM(parsed)}!`);
  };

  const handleResetPromo = () => {
    setPromoImgDraft('');
    setPromoTitleDraft('SPECIAL PROMOTION UPDATES');
    setPromoSubDraft('Tap any promotion price below to add straight to your cart!');
    onUpdatePromo(machine.id, {
      promoImageUrl: undefined,
      promoTitle: undefined,
      promoSubtitle: undefined,
    });
    showToast('Promotion reset to default Cyber Mart artwork.');
  };

  const machineTransactions = useMemo(
    () => transactions.filter((t) => t.machineId === machine.id),
    [transactions, machine.id]
  );

  const periodTransactions = useMemo(() => {
    const now = Date.now();
    const cutoffHours = period === 'daily' ? 24 : period === 'weekly' ? 24 * 7 : 24 * 30;
    const cutoffMs = now - cutoffHours * 3600 * 1000;
    return machineTransactions.filter((t) => new Date(t.timestamp).getTime() >= cutoffMs);
  }, [machineTransactions, period]);

  const metrics = useMemo(() => {
    const completed = periodTransactions.filter((t) => t.status === 'completed');
    const revenue = completed.reduce((s, t) => s + t.total, 0);
    const itemsVended = periodTransactions.reduce(
      (s, t) => s + t.items.reduce((isum, it) => isum + it.qty, 0),
      0
    );
    const duitnow = completed
      .filter((t) => t.paymentMethod === 'duitnow')
      .reduce((s, t) => s + t.total, 0);
    const tng = completed
      .filter((t) => t.paymentMethod === 'tng')
      .reduce((s, t) => s + t.total, 0);
    const fpx = completed
      .filter((t) => t.paymentMethod === 'fpx')
      .reduce((s, t) => s + t.total, 0);

    return {
      revenue,
      itemsVended,
      txCount: completed.length,
      duitnow,
      tng,
      fpx,
    };
  }, [periodTransactions]);

  const filteredSlots = useMemo(() => {
    return machine.slots.filter((slot) => {
      const matchesRow = rowFilter === 'ALL' || slot.code.startsWith(rowFilter);
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        slot.name.toLowerCase().includes(q) ||
        slot.code.toLowerCase().includes(q);
      return matchesRow && matchesSearch;
    });
  }, [machine.slots, rowFilter, searchQuery]);

  const lowStockCount = useMemo(
    () => machine.slots.filter((s) => s.stock <= 2).length,
    [machine.slots]
  );

  const handleFillAll = () => {
    onFillAllToTen(machine.id);
    showToast('All 30 slots restocked to 10 units!');
  };

  const tabs: Array<{ id: AdminTab; label: string; shortLabel: string; icon: React.ReactNode }> = [
    { id: 'sales', label: 'Sales Report', shortLabel: 'Sales', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'stock', label: 'Stock & Pics', shortLabel: 'Stock', icon: <Package className="w-5 h-5" /> },
    { id: 'promo', label: 'Promo Picture', shortLabel: 'Promo', icon: <ImagePlus className="w-5 h-5" /> },
    { id: 'dispense', label: 'Remote Dispense', shortLabel: 'Motor', icon: <Cpu className="w-5 h-5" /> },
  ];

  const inputClass =
    'w-full rounded-xl border border-cyan-400/35 bg-[#0D0726]/80 px-3.5 py-2.5 text-sm text-white placeholder:text-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-400';

  return (
    <div className={embedded ? 'w-full text-white' : 'min-h-screen cyber-bg text-white pb-24 md:pb-10 relative'}>
      {!embedded && <div className="pointer-events-none fixed inset-0 cyber-grid-overlay opacity-75" />}

      {!embedded && (
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
                  CYBER MART · {machine.name}
                </h1>
                <p className="text-[11px] text-cyan-100/70 truncate">
                  {machine.id} · Staff: {user.name}
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
      )}

      {embedded && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-cyan-200">
              Machine Operations · {machine.name}
            </h2>
            <p className="text-xs text-cyan-100/75">
              {machine.id} · {machine.location}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1 bg-white/10 border border-cyan-400/35 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-400 to-pink-500 text-slate-950 shadow-sm'
                    : 'text-cyan-100 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <main className={embedded ? 'relative z-10' : 'relative z-10 max-w-7xl mx-auto px-4 pt-5'}>
        {toastMsg && (
          <div className="mb-4 rounded-2xl bg-emerald-400/20 border border-emerald-300/70 shadow-[0_0_18px_rgba(52,211,153,0.3)] px-4 py-3 text-xs sm:text-sm font-bold text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* TAB 1: SALES REPORT */}
        {activeTab === 'sales' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  Sales &amp; Revenue Report
                </h2>
                <p className="text-xs text-cyan-200/75">
                  Real-time telemetry stored for {machine.id}
                </p>
              </div>
              <div className="inline-flex items-center gap-1 bg-white/10 border border-cyan-400/35 p-1 rounded-xl">
                {(['daily', 'weekly', 'monthly'] as PeriodFilter[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                      period === p
                        ? 'bg-pink-500 text-white shadow-[0_0_12px_rgba(255,60,172,0.6)]'
                        : 'text-cyan-100 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="cyber-glass-panel rounded-2xl p-4">
                <p className="text-xs font-medium text-cyan-200/80">Revenue ({period})</p>
                <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {formatRM(metrics.revenue)}
                </p>
              </div>
              <div className="cyber-glass-panel rounded-2xl p-4">
                <p className="text-xs font-medium text-cyan-200/80">Items Vended</p>
                <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-cyan-300 tabular-nums">
                  {metrics.itemsVended}
                </p>
              </div>
              <div className="cyber-glass-panel rounded-2xl p-4">
                <p className="text-xs font-medium text-cyan-200/80">Completed Orders</p>
                <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-pink-300 tabular-nums">
                  {metrics.txCount}
                </p>
              </div>
              <div className="cyber-glass-panel rounded-2xl p-4">
                <p className="text-xs font-medium text-cyan-200/80">Low / Empty Slots</p>
                <p className={`mt-1 font-display text-2xl sm:text-3xl font-bold tabular-nums ${lowStockCount > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                  {lowStockCount} / 30
                </p>
              </div>
            </div>

            <div className="cyber-glass-panel rounded-2xl p-4 sm:p-5">
              <h3 className="font-display text-base font-bold text-white">
                Payment Gateway Breakdown
              </h3>
              <div className="mt-4 space-y-3.5">
                {[
                  { label: 'DuitNow QR', val: metrics.duitnow, color: 'bg-pink-500 shadow-[0_0_12px_rgba(255,60,172,0.7)]' },
                  { label: "Touch 'n Go eWallet", val: metrics.tng, color: 'bg-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.7)]' },
                  { label: 'FPX Online QR', val: metrics.fpx, color: 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]' },
                ].map((row) => {
                  const pct = metrics.revenue > 0 ? Math.round((row.val / metrics.revenue) * 100) : 0;
                  return (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-cyan-100">{row.label}</span>
                        <span className="font-mono-tabular text-white">
                          {formatRM(row.val)} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.color} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="cyber-glass-panel rounded-2xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-white">
                  Transaction Logs
                </h3>
                <span className="text-xs text-cyan-200/80 tabular-nums">
                  {periodTransactions.length} entries
                </span>
              </div>

              {periodTransactions.length === 0 ? (
                <div className="p-8 text-center text-sm text-cyan-200/70">
                  No transactions recorded in this period yet.
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {periodTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-white/5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-mono-tabular font-bold text-white">
                          <span>{tx.id}</span>
                          <span className="text-white/30">·</span>
                          <span className="text-pink-300 uppercase">{tx.paymentMethod}</span>
                          <span className="text-white/30">·</span>
                          <span className="font-normal text-cyan-200/75">{tx.referenceCode}</span>
                        </div>
                        <p className="mt-0.5 text-cyan-100/80 truncate">
                          {tx.items.map((it) => `${it.code} ${it.name} ×${it.qty}`).join(', ')}
                        </p>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
                        <span className="font-display text-sm font-bold text-emerald-300 tabular-nums">
                          {tx.status === 'remote_dispense' ? 'Remote Test' : formatRM(tx.total)}
                        </span>
                        <span className="text-[11px] text-cyan-200/60 tabular-nums">
                          {new Date(tx.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: STOCK & SLOT PICTURE MANAGEMENT */}
        {activeTab === 'stock' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  30-Slot Stock &amp; Picture Manager
                </h2>
                <p className="text-xs text-cyan-200/75">
                  Tap any slot to edit product name, RM price, stock, or upload a custom photo
                </p>
              </div>
              <button
                type="button"
                onClick={handleFillAll}
                className="cyber-btn-mint rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-950 inline-flex items-center justify-center gap-2 whitespace-nowrap min-h-[44px]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Fill All Slots to 10</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', ...ROW_LETTERS].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRowFilter(r)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap min-h-[40px] border transition-colors ${
                      rowFilter === r
                        ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                        : 'bg-white/10 text-cyan-100 border-white/15 hover:bg-white/20'
                    }`}
                  >
                    {r === 'ALL' ? 'All Rows' : `Row ${r}`}
                  </button>
                ))}
              </div>

              <div className="relative sm:w-64">
                <Search className="w-4 h-4 text-cyan-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search slot or snack..."
                  className="w-full rounded-xl border border-cyan-400/40 bg-[#0D0726]/80 pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-cyan-200/45 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {filteredSlots.map((slot) => (
                <button
                  key={slot.code}
                  type="button"
                  onClick={() => openSlotEditor(slot)}
                  className="cyber-slot-card cyber-slot-interactive rounded-2xl p-3.5 text-left flex items-center sm:flex-col sm:items-stretch gap-3"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono-tabular text-xs font-bold text-cyan-300 bg-cyan-400/15 border border-cyan-300/40 px-2 py-0.5 rounded-md">
                      {slot.code}
                    </span>
                    <span
                      className={`text-xs font-bold tabular-nums ${
                        slot.stock === 0
                          ? 'text-rose-400'
                          : slot.stock <= 3
                            ? 'text-amber-300'
                            : 'text-emerald-300'
                      }`}
                    >
                      {slot.stock} / {slot.maxStock}
                    </span>
                  </div>

                  <div className="flex items-center sm:flex-col gap-3 sm:gap-1.5 flex-1 min-w-0">
                    <ProductIllustration
                      iconKey={slot.iconKey}
                      color={slot.color}
                      name={slot.name}
                      customImageUrl={slot.customImageUrl}
                      className="w-12 h-14 shrink-0"
                    />
                    <div className="min-w-0 w-full sm:text-center">
                      <p className="text-xs font-bold text-white truncate">
                        {slot.name}
                      </p>
                      <div className="flex items-center sm:justify-center gap-1.5 mt-0.5">
                        <p className={`font-display text-sm font-bold tabular-nums ${hasActivePromo(slot) ? 'text-slate-400 line-through text-xs' : 'text-pink-300'}`}>
                          {formatRM(slot.price)}
                        </p>
                        {hasActivePromo(slot) && (
                          <p className="font-display text-sm font-bold text-amber-300 tabular-nums">
                            {formatRM(slot.promoPrice as number)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-cyan-200 pt-1 sm:border-t sm:border-white/10">
                    <SlidersHorizontal className="w-3 h-3 text-cyan-300" />
                    <span>Edit &amp; Photo</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROMOTION PICTURE & BANNER EDITOR */}
        {activeTab === 'promo' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <form
              onSubmit={handleSavePromo}
              className="lg:col-span-7 cyber-glass-panel rounded-3xl p-5 sm:p-6 space-y-4"
            >
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  Update Kiosk Promotion Picture
                </h2>
                <p className="text-xs text-cyan-200/75 mt-0.5">
                  Upload a promotional image from your iPhone/desktop or paste an image URL for {machine.id}.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-200 mb-2">
                  Upload Promotion Image
                </label>
                <label className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 p-4 cursor-pointer text-xs font-bold text-cyan-100 transition-colors">
                  <Upload className="w-4 h-4 text-pink-400" />
                  <span>
                    {uploadingPromoImg
                      ? 'Compressing image...'
                      : 'Choose Photo from iPhone / Computer'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePromoFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-200 mb-1">
                  Or Paste Promotion Image URL
                </label>
                <input
                  type="text"
                  value={promoImgDraft}
                  onChange={(e) => setPromoImgDraft(e.target.value)}
                  placeholder="https://... or uploaded image data"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-200 mb-1">
                  Promotion Headline
                </label>
                <input
                  type="text"
                  value={promoTitleDraft}
                  onChange={(e) => setPromoTitleDraft(e.target.value)}
                  placeholder="e.g. CYBER SNACK DROPS"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-200 mb-1">
                  Promotion Subtitle
                </label>
                <input
                  type="text"
                  value={promoSubDraft}
                  onChange={(e) => setPromoSubDraft(e.target.value)}
                  placeholder="e.g. Buy 2 Cold Drinks, Save RM 1.00!"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleResetPromo}
                  className="sm:w-1/3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 py-3 px-4 text-xs font-bold text-white inline-flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
                <button
                  type="submit"
                  className="sm:w-2/3 rounded-2xl cyber-btn-pink py-3 px-5 text-sm font-bold text-white"
                >
                  Save Promotion Picture
                </button>
              </div>
            </form>

            {/* Live Preview & Promo Prices Manager */}
            <div className="lg:col-span-5 space-y-5">
              <div className="cyber-glass-panel rounded-3xl p-5 space-y-3">
                <p className="text-xs font-bold text-cyan-200">
                  Live Clickable Promotion Modal Preview
                </p>
                <div className="rounded-3xl relative overflow-hidden border-2 border-amber-300 shadow-[0_0_24px_rgba(255,208,21,0.35)] min-h-[200px] flex flex-col justify-between bg-gradient-to-br from-[#24165E] to-[#11316E]">
                  <img
                    src={promoImgDraft || cyberPromoBannerImg}
                    alt="Promo Preview"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-slate-950/20" />
                  <div className="relative z-10 p-3 flex justify-start">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-300 to-orange-400 text-rose-800 font-display text-xs font-extrabold px-3 py-1 shadow">
                      <Sparkles className="w-3 h-3" />
                      <span>SPECIAL PROMOTION</span>
                    </span>
                  </div>
                  <div className="relative z-10 p-3.5 text-white">
                    <h3 className="font-display text-base font-bold text-amber-200">
                      {promoTitleDraft || 'SPECIAL PROMOTION UPDATES'}
                    </h3>
                    <p className="text-xs text-white/90 mt-0.5">
                      {promoSubDraft || 'Tap any promotion price below to add straight to your cart!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Slot Promotion Price Editor */}
              <div className="cyber-glass-panel rounded-3xl p-5 space-y-3.5">
                <div>
                  <h3 className="font-display text-base font-bold text-amber-300">
                    Clickable Promotion Price Updates
                  </h3>
                  <p className="text-[11px] text-cyan-100/75 mt-0.5">
                    Set discounted promo prices on slots. Customers can click them to view inside Special Promotion!
                  </p>
                </div>

                <form onSubmit={handleApplySlotPromo} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-6">
                    <label className="block text-[11px] font-bold text-cyan-200 mb-1">
                      Slot
                    </label>
                    <select
                      value={promoSlotCodeDraft}
                      onChange={(e) => setPromoSlotCodeDraft(e.target.value)}
                      className={inputClass}
                    >
                      {machine.slots.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.code} · {s.name} ({formatRM(s.price)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[11px] font-bold text-cyan-200 mb-1">
                      Promo RM
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      min="0.10"
                      value={promoSlotPriceDraft}
                      onChange={(e) => setPromoSlotPriceDraft(e.target.value)}
                      className={`${inputClass} font-mono-tabular`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="col-span-3 rounded-xl cyber-btn-cyan py-2.5 px-2 text-xs font-bold text-slate-950 min-h-[42px]"
                  >
                    Set
                  </button>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto custom-scroll pr-1">
                  {machine.slots.filter((s) => hasActivePromo(s)).map((slot) => (
                    <div
                      key={slot.code}
                      className="rounded-xl bg-white/5 border border-amber-300/40 px-3 py-2 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">
                          <span className="text-cyan-300 font-mono-tabular mr-1.5">
                            {slot.code}
                          </span>
                          {slot.name}
                        </p>
                        <p className="text-[11px] font-mono-tabular">
                          <span className="line-through text-slate-400 mr-1.5">
                            {formatRM(slot.price)}
                          </span>
                          <span className="text-amber-300 font-bold">
                            {formatRM(slot.promoPrice as number)}
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateSlot(machine.id, slot.code, { promoPrice: undefined });
                          showToast(`Cleared promo price on ${slot.code}.`);
                        }}
                        className="text-[11px] font-bold text-pink-300 hover:text-rose-400 px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MANUAL / REMOTE DISPENSE */}
        {activeTab === 'dispense' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-bold text-white">
                Manual &amp; Remote Motor Dispense
              </h2>
              <p className="text-xs text-cyan-200/75">
                Tap any slot (A1–F5) to trigger <span className="font-mono-tabular text-cyan-300">window.AndroidVending.dispense(row, col)</span> directly
              </p>
            </div>

            <div className="space-y-2.5">
              {ROW_LETTERS.map((letter, rIdx) => {
                const rowNum = rIdx + 1;
                const rowSlots = machine.slots
                  .filter((s) => s.row === rowNum)
                  .sort((a, b) => a.col - b.col);
                return (
                  <div key={letter} className="grid grid-cols-5 gap-1.5 sm:gap-3">
                    {rowSlots.map((slot) => (
                      <button
                        key={slot.code}
                        type="button"
                        onClick={() => onRemoteDispense(slot)}
                        className="cyber-slot-card cyber-slot-interactive rounded-2xl p-2 sm:p-3 text-left min-h-[84px] flex flex-col justify-between hover:border-pink-400"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono-tabular text-xs font-bold text-pink-300">
                            {slot.code}
                          </span>
                          <span className="hidden sm:inline font-mono-tabular text-[10px] text-cyan-200/60">
                            R{slot.row}·C{slot.col}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] font-bold text-white line-clamp-2 leading-tight my-1">
                          {slot.name}
                        </p>
                        <span className="text-[10px] font-semibold text-cyan-300">
                          Spin Motor
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      {!embedded && (
        <nav
          aria-label="Admin Navigation"
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
      )}

      {/* Slot Editor Modal with Direct Photo Upload */}
      {editingSlot && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#09041D]/85 backdrop-blur-md p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Edit Slot ${editingSlot.code}`}
        >
          <form
            onSubmit={handleSaveSlot}
            className="cyber-glass-panel w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 border-t-2 sm:border-2 border-cyan-300 shadow-[0_0_45px_rgba(34,211,238,0.4)] space-y-4 max-h-[92vh] overflow-y-auto text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono-tabular text-xs font-bold text-pink-300">
                  Slot {editingSlot.code} · Row {editingSlot.row}, Col {editingSlot.col}
                </p>
                <h3 className="font-display text-xl font-bold text-white">
                  Edit Product &amp; Picture
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="p-2 rounded-xl text-cyan-200 hover:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close editor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-white/10 border border-cyan-300/35 p-3.5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#120A33] border border-cyan-400/50 flex items-center justify-center shrink-0 overflow-hidden">
                <ProductIllustration
                  iconKey={editIconKey}
                  color={editingSlot.color}
                  name={editName || editingSlot.name}
                  customImageUrl={editCustomImg || undefined}
                  className="w-14 h-14"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <label className="inline-flex items-center gap-1.5 rounded-xl cyber-btn-cyan text-slate-950 px-3 py-2 text-xs font-bold cursor-pointer">
                  <Camera className="w-3.5 h-3.5" />
                  <span>{uploadingSlotImg ? 'Uploading...' : 'Upload Picture'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSlotFileUpload}
                    className="hidden"
                  />
                </label>
                {editCustomImg && (
                  <button
                    type="button"
                    onClick={() => setEditCustomImg('')}
                    className="block text-[11px] font-semibold text-pink-300 hover:underline"
                  >
                    Remove custom photo (use 3D icon)
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">
                Product Name
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-cyan-200 mb-1">
                  Price (RM)
                </label>
                <input
                  type="number"
                  step="0.10"
                  min="0.10"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className={`${inputClass} font-mono-tabular`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  Promo (RM)
                </label>
                <input
                  type="number"
                  step="0.10"
                  min="0.10"
                  placeholder="Optional"
                  value={editPromoPrice}
                  onChange={(e) => setEditPromoPrice(e.target.value)}
                  className={`${inputClass} font-mono-tabular border-amber-300/50`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-cyan-200 mb-1">
                  Stock Count
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  required
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  className={`${inputClass} font-mono-tabular`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-cyan-200 mb-1">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as ProductCategory)}
                  className={inputClass}
                >
                  <option value="drink">Cold Drink</option>
                  <option value="coffee">Coffee</option>
                  <option value="snack">Snack / Chips</option>
                  <option value="sweet">Chocolate / Candy</option>
                  <option value="noodle">Cup Noodle</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-cyan-200 mb-1">
                  Fallback 3D Icon
                </label>
                <select
                  value={editIconKey}
                  onChange={(e) => setEditIconKey(e.target.value as ProductIconKey)}
                  className={inputClass}
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">
                Custom Image URL (Optional)
              </label>
              <input
                type="text"
                value={editCustomImg}
                onChange={(e) => setEditCustomImg(e.target.value)}
                placeholder="https://... or upload photo above"
                className={inputClass}
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="w-1/3 rounded-2xl bg-white/10 hover:bg-white/20 py-3 text-sm font-bold text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 rounded-2xl cyber-btn-pink py-3 text-sm font-bold text-white"
              >
                Save Slot
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
