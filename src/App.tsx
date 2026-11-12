import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AdminUser,
  CartItem,
  getEffectivePrice,
  PaymentGatewayConfig,
  PaymentMethod,
  ProductSlot,
  TransactionItem,
  VendingAppState,
} from './types/vending';
import { storageService } from './services/storageService';
import { triggerPhysicalMotor } from './services/vendingBridge';
import { KioskView } from './components/kiosk/KioskView';
import { PaymentModal } from './components/kiosk/PaymentModal';
import { DispenseOverlay, DispenseQueueItem } from './components/kiosk/DispenseOverlay';
import { PinPadModal } from './components/auth/PinPadModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function speakThankYou() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('Thank you! Please come again.');
    utterance.lang = 'en-US';
    utterance.rate = 0.96;
    utterance.pitch = 1.08;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech synthesis errors on unsupported WebViews
  }
}

export function App() {
  const [appState, setAppState] = useState<VendingAppState>(() => storageService.loadState());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPinPad, setShowPinPad] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<AdminUser | null>(null);

  // Dispense & celebration state
  const [dispensePhase, setDispensePhase] = useState<'idle' | 'dispensing' | 'celebration'>('idle');
  const [currentDispenseItem, setCurrentDispenseItem] = useState<DispenseQueueItem | null>(null);
  const [completedSlotCodes, setCompletedSlotCodes] = useState<string[]>([]);
  const celebrationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (celebrationTimerRef.current) {
        window.clearTimeout(celebrationTimerRef.current);
      }
    };
  }, []);

  const activeMachine = useMemo(() => {
    return (
      appState.machines.find((m) => m.id === appState.activeMachineId) ??
      appState.machines[0]
    );
  }, [appState.machines, appState.activeMachineId]);

  const adminMachine = useMemo(() => {
    if (authenticatedUser?.role === 'admin') {
      return (
        appState.machines.find((m) => m.assignedAdminId === authenticatedUser.id) ??
        activeMachine
      );
    }
    return activeMachine;
  }, [authenticatedUser, appState.machines, activeMachine]);

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + getEffectivePrice(item.slot) * item.qty,
        0
      ),
    [cart]
  );

  const handleAddToCart = useCallback((slot: ProductSlot) => {
    if (slot.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.slot.code === slot.code);
      if (existing) {
        if (existing.qty >= slot.stock) return prev;
        return prev.map((c) =>
          c.slot.code === slot.code ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { slot, qty: 1 }];
    });
  }, []);

  const handleUpdateCartQty = useCallback((slotCode: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.slot.code !== slotCode) return c;
          const nextQty = c.qty + delta;
          if (nextQty <= 0) return null;
          return { ...c, qty: Math.min(nextQty, c.slot.stock) };
        })
        .filter((x): x is CartItem => x !== null)
    );
  }, []);

  const handleRemoveFromCart = useCallback((slotCode: string) => {
    setCart((prev) => prev.filter((c) => c.slot.code !== slotCode));
  }, []);

  const handleClearCart = useCallback(() => {
    setCart([]);
  }, []);

  const runDispenseSequence = useCallback(
    async (
      machineId: string,
      txItems: TransactionItem[],
      slotsToSpin: ProductSlot[],
      paymentMethod: PaymentMethod | 'remote',
      status: 'completed' | 'remote_dispense'
    ) => {
      if (celebrationTimerRef.current) {
        window.clearTimeout(celebrationTimerRef.current);
      }

      setDispensePhase('dispensing');
      const totalCount = slotsToSpin.length;
      const doneCodes: string[] = [];

      for (let i = 0; i < totalCount; i++) {
        const slot = slotsToSpin[i];
        setCurrentDispenseItem({
          slot,
          index: i + 1,
          totalCount,
        });

        triggerPhysicalMotor(slot.row, slot.col);
        doneCodes.push(slot.code);

        // 2.5s delay between physical motor commands (and visual vend window)
        await sleep(2500);
      }

      setAppState((prev) => {
        const { nextState } = storageService.deductStockAndLogSale(
          prev,
          machineId,
          txItems,
          paymentMethod,
          status
        );
        return nextState;
      });

      if (status === 'completed') {
        setCart([]);
      }

      setCompletedSlotCodes(doneCodes);
      setCurrentDispenseItem(null);
      setDispensePhase('celebration');

      if (status === 'completed') {
        speakThankYou();
      }

      celebrationTimerRef.current = window.setTimeout(() => {
        setDispensePhase('idle');
      }, 5000);
    },
    []
  );

  const handlePaymentSuccess = useCallback(
    (method: PaymentMethod) => {
      setShowPaymentModal(false);
      const txItems: TransactionItem[] = cart.map((c) => ({
        code: c.slot.code,
        row: c.slot.row,
        col: c.slot.col,
        name: c.slot.name,
        price: getEffectivePrice(c.slot),
        qty: c.qty,
      }));
      const slotsToSpin: ProductSlot[] = [];
      cart.forEach((c) => {
        for (let i = 0; i < c.qty; i++) {
          slotsToSpin.push(c.slot);
        }
      });
      void runDispenseSequence(
        activeMachine.id,
        txItems,
        slotsToSpin,
        method,
        'completed'
      );
    },
    [cart, activeMachine.id, runDispenseSequence]
  );

  const handleRemoteDispense = useCallback(
    (slot: ProductSlot, targetMachineId?: string) => {
      const mId = targetMachineId ?? adminMachine.id;
      const txItems: TransactionItem[] = [
        {
          code: slot.code,
          row: slot.row,
          col: slot.col,
          name: slot.name,
          price: getEffectivePrice(slot),
          qty: 1,
        },
      ];
      void runDispenseSequence(mId, txItems, [slot], 'remote', 'remote_dispense');
    },
    [adminMachine.id, runDispenseSequence]
  );

  const handleUpdateSlot = useCallback(
    (machineId: string, slotCode: string, updates: Partial<ProductSlot>) => {
      setAppState((prev) =>
        storageService.updateSlot(prev, machineId, slotCode, updates)
      );
    },
    []
  );

  const handleFillAllToTen = useCallback((machineId: string) => {
    setAppState((prev) => storageService.fillAllSlotsToTen(prev, machineId));
  }, []);

  const handleSwitchActiveMachine = useCallback((machineId: string) => {
    setCart([]);
    setAppState((prev) => storageService.switchActiveMachine(prev, machineId));
  }, []);

  const handleAddMachine = useCallback(
    (payload: {
      id: string;
      name: string;
      location: string;
      assignedAdminId: string;
    }) => {
      setAppState((prev) => storageService.addMachine(prev, payload));
    },
    []
  );

  const handleUpdateMachine = useCallback(
    (
      machineId: string,
      updates: Partial<Pick<typeof activeMachine, 'name' | 'location' | 'status' | 'assignedAdminId'>>
    ) => {
      setAppState((prev) => storageService.updateMachine(prev, machineId, updates));
    },
    []
  );

  const handleUpsertAdmin = useCallback((admin: AdminUser) => {
    setAppState((prev) => storageService.upsertAdmin(prev, admin));
  }, []);

  const handleDeleteAdmin = useCallback((adminId: string) => {
    setAppState((prev) => storageService.deleteAdmin(prev, adminId));
  }, []);

  const handleSavePaymentConfig = useCallback(
    (machineId: string, config: PaymentGatewayConfig) => {
      setAppState((prev) =>
        storageService.savePaymentConfig(prev, machineId, config)
      );
    },
    []
  );

  const handleUpdatePromo = useCallback(
    (
      machineId: string,
      promo: { promoImageUrl?: string; promoTitle?: string; promoSubtitle?: string }
    ) => {
      setAppState((prev) =>
        storageService.updateMachinePromo(prev, machineId, promo)
      );
    },
    []
  );

  const handleDoneCelebration = useCallback(() => {
    if (celebrationTimerRef.current) {
      window.clearTimeout(celebrationTimerRef.current);
    }
    setDispensePhase('idle');
  }, []);

  return (
    <>
      {!authenticatedUser && (
        <KioskView
          machine={activeMachine}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateCartQty={handleUpdateCartQty}
          onRemoveFromCart={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onCheckout={() => setShowPaymentModal(true)}
          onOpenPinPad={() => setShowPinPad(true)}
        />
      )}

      {authenticatedUser?.role === 'admin' && (
        <AdminDashboard
          user={authenticatedUser}
          machine={adminMachine}
          transactions={appState.transactions}
          onBackToKiosk={() => setAuthenticatedUser(null)}
          onUpdateSlot={handleUpdateSlot}
          onFillAllToTen={handleFillAllToTen}
          onRemoteDispense={(slot) => handleRemoteDispense(slot, adminMachine.id)}
          onUpdatePromo={handleUpdatePromo}
        />
      )}

      {authenticatedUser?.role === 'superadmin' && (
        <SuperAdminDashboard
          user={authenticatedUser}
          machines={appState.machines}
          activeMachineId={appState.activeMachineId}
          admins={appState.admins}
          transactions={appState.transactions}
          onBackToKiosk={() => setAuthenticatedUser(null)}
          onSwitchActiveMachine={handleSwitchActiveMachine}
          onAddMachine={handleAddMachine}
          onUpdateMachine={handleUpdateMachine}
          onUpsertAdmin={handleUpsertAdmin}
          onDeleteAdmin={handleDeleteAdmin}
          onSavePaymentConfig={handleSavePaymentConfig}
          onUpdateSlot={handleUpdateSlot}
          onFillAllToTen={handleFillAllToTen}
          onRemoteDispense={handleRemoteDispense}
          onUpdatePromo={handleUpdatePromo}
        />
      )}

      <PinPadModal
        isOpen={showPinPad}
        admins={appState.admins}
        onClose={() => setShowPinPad(false)}
        onSuccess={(user) => {
          setShowPinPad(false);
          setAuthenticatedUser(user);
        }}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        machine={activeMachine}
        cart={cart}
        total={cartTotal}
        onCancel={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <DispenseOverlay
        phase={dispensePhase}
        currentItem={currentDispenseItem}
        completedCodes={completedSlotCodes}
        onDone={handleDoneCelebration}
      />

      <OfflineIndicator />
    </>
  );
}

export default App;
