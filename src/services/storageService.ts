import {
  createDefault30Slots,
  createEmptyPaymentConfig,
  createSeedTransactions,
  DEFAULT_ADMINS,
  DEFAULT_MACHINES,
} from '../data/defaultCatalog';
import {
  AdminUser,
  Machine,
  PaymentGatewayConfig,
  PaymentMethod,
  ProductSlot,
  SaleTransaction,
  TransactionItem,
  VendingAppState,
} from '../types/vending';

const STORAGE_KEYS = {
  MACHINES: 'minimart24_machines_v1',
  ACTIVE_MACHINE_ID: 'minimart24_active_machine_v1',
  ADMINS: 'minimart24_admins_v1',
  TRANSACTIONS: 'minimart24_transactions_v1',
  PROMO_MIGRATED: 'minimart24_promo_seeded_v1',
} as const;

const DEFAULT_PROMO_BY_CODE: Record<string, number> = {
  A1: 2.50,
  C1: 1.80,
  E1: 2.90,
  F1: 2.80,
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const storageService = {
  loadState(): VendingAppState {
    const rawMachines = localStorage.getItem(STORAGE_KEYS.MACHINES);
    const rawAdmins = localStorage.getItem(STORAGE_KEYS.ADMINS);
    const rawTxns = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const rawActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_MACHINE_ID);

    let machines = rawMachines
      ? safeParse<Machine[]>(rawMachines, DEFAULT_MACHINES)
      : DEFAULT_MACHINES;

    if (!localStorage.getItem(STORAGE_KEYS.PROMO_MIGRATED)) {
      const hasAnyPromo = machines.some((m) =>
        m.slots.some((s) => typeof s.promoPrice === 'number')
      );
      if (!hasAnyPromo) {
        machines = machines.map((m) => ({
          ...m,
          slots: m.slots.map((s) =>
            DEFAULT_PROMO_BY_CODE[s.code] !== undefined
              ? { ...s, promoPrice: DEFAULT_PROMO_BY_CODE[s.code] }
              : s
          ),
        }));
        localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(machines));
      }
      localStorage.setItem(STORAGE_KEYS.PROMO_MIGRATED, '1');
    }

    const admins = rawAdmins
      ? safeParse<AdminUser[]>(rawAdmins, DEFAULT_ADMINS)
      : DEFAULT_ADMINS;
    const transactions = rawTxns
      ? safeParse<SaleTransaction[]>(rawTxns, createSeedTransactions())
      : createSeedTransactions();

    const activeMachineId =
      rawActiveId && machines.some((m) => m.id === rawActiveId)
        ? rawActiveId
        : machines[0]?.id ?? 'MM24-KL-01';

    if (!rawMachines) this.saveMachines(machines);
    if (!rawAdmins) this.saveAdmins(admins);
    if (!rawTxns) this.saveTransactions(transactions);
    if (!rawActiveId) this.setActiveMachineId(activeMachineId);

    return {
      machines,
      activeMachineId,
      admins,
      transactions,
    };
  },

  saveMachines(machines: Machine[]): void {
    localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(machines));
  },

  saveAdmins(admins: AdminUser[]): void {
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
  },

  saveTransactions(transactions: SaleTransaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  setActiveMachineId(machineId: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MACHINE_ID, machineId);
  },

  updateSlot(
    state: VendingAppState,
    machineId: string,
    slotCode: string,
    updates: Partial<ProductSlot>
  ): VendingAppState {
    const machines = state.machines.map((machine) => {
      if (machine.id !== machineId) return machine;
      return {
        ...machine,
        slots: machine.slots.map((slot) =>
          slot.code === slotCode ? { ...slot, ...updates } : slot
        ),
      };
    });
    this.saveMachines(machines);
    return { ...state, machines };
  },

  fillAllSlotsToTen(state: VendingAppState, machineId: string): VendingAppState {
    const machines = state.machines.map((machine) => {
      if (machine.id !== machineId) return machine;
      return {
        ...machine,
        slots: machine.slots.map((slot) => ({
          ...slot,
          stock: 10,
          maxStock: Math.max(10, slot.maxStock),
        })),
      };
    });
    this.saveMachines(machines);
    return { ...state, machines };
  },

  deductStockAndLogSale(
    state: VendingAppState,
    machineId: string,
    items: TransactionItem[],
    paymentMethod: PaymentMethod | 'remote',
    status: 'completed' | 'remote_dispense' = 'completed'
  ): { nextState: VendingAppState; transaction: SaleTransaction } {
    const targetMachine =
      state.machines.find((m) => m.id === machineId) ?? state.machines[0];

    const qtyByCode = new Map<string, number>();
    items.forEach((item) => {
      qtyByCode.set(item.code, (qtyByCode.get(item.code) ?? 0) + item.qty);
    });

    const machines = state.machines.map((machine) => {
      if (machine.id !== targetMachine.id) return machine;
      return {
        ...machine,
        slots: machine.slots.map((slot) => {
          const soldQty = qtyByCode.get(slot.code) ?? 0;
          if (soldQty === 0) return slot;
          return {
            ...slot,
            stock: Math.max(0, slot.stock - soldQty),
          };
        }),
      };
    });

    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const prefix =
      paymentMethod === 'duitnow'
        ? 'DN'
        : paymentMethod === 'tng'
          ? 'TNG'
          : paymentMethod === 'fpx'
            ? 'FPX'
            : 'RMT';

    const transaction: SaleTransaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      machineId: targetMachine.id,
      machineName: targetMachine.name,
      timestamp: new Date().toISOString(),
      items,
      total: Number(total.toFixed(2)),
      paymentMethod,
      status,
      referenceCode: `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    const transactions = [transaction, ...state.transactions];
    this.saveMachines(machines);
    this.saveTransactions(transactions);

    return {
      nextState: { ...state, machines, transactions },
      transaction,
    };
  },

  savePaymentConfig(
    state: VendingAppState,
    machineId: string,
    paymentConfig: PaymentGatewayConfig
  ): VendingAppState {
    const machines = state.machines.map((machine) =>
      machine.id === machineId ? { ...machine, paymentConfig } : machine
    );
    this.saveMachines(machines);
    return { ...state, machines };
  },

  addMachine(
    state: VendingAppState,
    payload: { id: string; name: string; location: string; assignedAdminId: string }
  ): VendingAppState {
    const newMachine: Machine = {
      id: payload.id.trim().toUpperCase(),
      name: payload.name.trim(),
      location: payload.location.trim(),
      status: 'online',
      assignedAdminId: payload.assignedAdminId,
      slots: createDefault30Slots(0),
      paymentConfig: createEmptyPaymentConfig(),
    };
    const machines = [...state.machines, newMachine];
    this.saveMachines(machines);
    return { ...state, machines };
  },

  updateMachine(
    state: VendingAppState,
    machineId: string,
    updates: Partial<Pick<Machine, 'name' | 'location' | 'status' | 'assignedAdminId'>>
  ): VendingAppState {
    const machines = state.machines.map((machine) =>
      machine.id === machineId ? { ...machine, ...updates } : machine
    );
    this.saveMachines(machines);
    return { ...state, machines };
  },

  upsertAdmin(state: VendingAppState, admin: AdminUser): VendingAppState {
    const exists = state.admins.some((a) => a.id === admin.id);
    const admins = exists
      ? state.admins.map((a) => (a.id === admin.id ? admin : a))
      : [...state.admins, admin];
    this.saveAdmins(admins);
    return { ...state, admins };
  },

  deleteAdmin(state: VendingAppState, adminId: string): VendingAppState {
    const admins = state.admins.filter((a) => a.id !== adminId);
    this.saveAdmins(admins);
    return { ...state, admins };
  },

  updateMachinePromo(
    state: VendingAppState,
    machineId: string,
    promo: { promoImageUrl?: string; promoTitle?: string; promoSubtitle?: string }
  ): VendingAppState {
    const machines = state.machines.map((machine) =>
      machine.id === machineId
        ? {
            ...machine,
            promoImageUrl: promo.promoImageUrl,
            promoTitle: promo.promoTitle,
            promoSubtitle: promo.promoSubtitle,
          }
        : machine
    );
    this.saveMachines(machines);
    return { ...state, machines };
  },

  switchActiveMachine(state: VendingAppState, machineId: string): VendingAppState {
    this.setActiveMachineId(machineId);
    return { ...state, activeMachineId: machineId };
  },

  exportBackupJson(state: VendingAppState): string {
    return JSON.stringify(state, null, 2);
  },
};
