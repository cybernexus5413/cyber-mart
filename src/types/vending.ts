export type RowLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type ProductCategory = 'drink' | 'snack' | 'sweet' | 'noodle' | 'coffee';

export type ProductIconKey =
  | 'milo'
  | 'cola'
  | 'water'
  | 'greentea'
  | 'coffee'
  | 'oatmilk'
  | 'chips_bbq'
  | 'chips_cheese'
  | 'chips_sour'
  | 'cracker'
  | 'wafer'
  | 'chocolate'
  | 'pocky'
  | 'gummy'
  | 'noodle_curry'
  | 'noodle_tomyam'
  | 'soda_lemon'
  | 'juice_orange';

export interface ProductSlot {
  code: string; // A1 .. F5
  row: number; // 1 .. 6
  col: number; // 1 .. 5
  name: string;
  price: number; // MYR
  stock: number;
  maxStock: number;
  category: ProductCategory;
  color: string; // Hex accent for 3D illustration & row glow
  flavorTag: string;
  iconKey: ProductIconKey;
  customImageUrl?: string;
  promoPrice?: number; // Optional promotional MYR price when lower than regular price
}

export function hasActivePromo(slot: ProductSlot): boolean {
  return (
    typeof slot.promoPrice === 'number' &&
    slot.promoPrice > 0 &&
    slot.promoPrice < slot.price
  );
}

export function getEffectivePrice(slot: ProductSlot): number {
  return hasActivePromo(slot) ? (slot.promoPrice as number) : slot.price;
}

export type PaymentMethod = 'duitnow' | 'tng' | 'fpx';

export interface DuitNowConfig {
  merchantId: string;
  apiKey: string;
  secretKey: string;
  webhookUrl: string;
}

export interface TnGConfig {
  partnerId: string;
  clientSecret: string;
  merchantCode: string;
  endpointUrl: string;
}

export interface FPXConfig {
  sellerId: string;
  exchangeId: string;
  checksumKey: string;
  gatewayUrl: string;
}

export interface PaymentGatewayConfig {
  duitnow: DuitNowConfig;
  tng: TnGConfig;
  fpx: FPXConfig;
}

export interface Machine {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'maintenance';
  assignedAdminId: string;
  slots: ProductSlot[];
  paymentConfig: PaymentGatewayConfig;
  promoImageUrl?: string;
  promoTitle?: string;
  promoSubtitle?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  pin: string; // 4-digit PIN
  role: 'admin' | 'superadmin';
  email: string;
}

export interface TransactionItem {
  code: string;
  row: number;
  col: number;
  name: string;
  price: number;
  qty: number;
}

export interface SaleTransaction {
  id: string;
  machineId: string;
  machineName: string;
  timestamp: string; // ISO string
  items: TransactionItem[];
  total: number;
  paymentMethod: PaymentMethod | 'remote';
  status: 'completed' | 'remote_dispense';
  referenceCode: string;
}

export interface CartItem {
  slot: ProductSlot;
  qty: number;
}

export type AppRole = 'customer' | 'admin' | 'superadmin';

export interface VendingAppState {
  machines: Machine[];
  activeMachineId: string;
  admins: AdminUser[];
  transactions: SaleTransaction[];
}

export const ROW_LETTERS: RowLetter[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export function formatRM(amount: number): string {
  return `RM ${amount.toFixed(2)}`;
}
