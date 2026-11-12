import {
  AdminUser,
  Machine,
  PaymentGatewayConfig,
  ProductCategory,
  ProductIconKey,
  ProductSlot,
  ROW_LETTERS,
  SaleTransaction,
} from '../types/vending';

interface SlotTemplate {
  name: string;
  price: number;
  promoPrice?: number;
  stock: number;
  category: ProductCategory;
  color: string;
  flavorTag: string;
  iconKey: ProductIconKey;
}

const SLOT_TEMPLATES: SlotTemplate[] = [
  // Row A (row = 1): Chilled Favorites & Hydration
  { name: 'Milo Gao Siew Dai', price: 3.20, promoPrice: 2.50, stock: 7, category: 'drink', color: '#15803D', flavorTag: 'Chilled Malt', iconKey: 'milo' },
  { name: '100PLUS Active', price: 2.50, stock: 10, category: 'drink', color: '#0284C7', flavorTag: 'Isotonic', iconKey: 'soda_lemon' },
  { name: 'Spritzer Mineral', price: 1.50, stock: 10, category: 'drink', color: '#0EA5E9', flavorTag: '600ml Pure', iconKey: 'water' },
  { name: 'Coca-Cola Classic', price: 2.80, stock: 7, category: 'drink', color: '#DC2626', flavorTag: 'Ice Cold', iconKey: 'cola' },
  { name: 'Yeo’s Chrysanthemum', price: 2.20, stock: 6, category: 'drink', color: '#D97706', flavorTag: 'Less Sugar', iconKey: 'greentea' },

  // Row B (row = 2): Coffee & Creamy Drinks
  { name: 'Nescafe Latte Can', price: 3.50, stock: 9, category: 'coffee', color: '#92400E', flavorTag: 'Roast Brew', iconKey: 'coffee' },
  { name: 'Oatside Barista', price: 4.50, stock: 5, category: 'drink', color: '#78350F', flavorTag: 'Oat Milk', iconKey: 'oatmilk' },
  { name: 'Pokka Jasmine Tea', price: 2.80, stock: 8, category: 'drink', color: '#16A34A', flavorTag: 'Fresh Brew', iconKey: 'greentea' },
  { name: 'Minute Maid Orange', price: 3.00, stock: 0, category: 'drink', color: '#EA580C', flavorTag: 'Pulpy Citrus', iconKey: 'juice_orange' },
  { name: 'Wonda Kopi Tarik', price: 3.20, stock: 7, category: 'coffee', color: '#B45309', flavorTag: 'Local Style', iconKey: 'coffee' },

  // Row C (row = 3): Crunchy Chips & Crisps
  { name: 'Twisties BBQ Curry', price: 2.50, promoPrice: 1.80, stock: 9, category: 'snack', color: '#EA580C', flavorTag: 'Crunchy Corn', iconKey: 'chips_bbq' },
  { name: 'Super Ring Cheese', price: 2.20, stock: 10, category: 'snack', color: '#F59E0B', flavorTag: 'Cheesy Puff', iconKey: 'chips_cheese' },
  { name: 'Lay’s Sour Cream', price: 4.80, stock: 6, category: 'snack', color: '#16A34A', flavorTag: 'Crispy Potato', iconKey: 'chips_sour' },
  { name: 'Calbee Hot & Spicy', price: 3.90, stock: 7, category: 'snack', color: '#E11D48', flavorTag: 'Seaweed Chili', iconKey: 'chips_bbq' },
  { name: 'Mamee Monster BBQ', price: 1.50, stock: 10, category: 'snack', color: '#2563EB', flavorTag: 'Crunch Pack', iconKey: 'cracker' },

  // Row D (row = 4): Biscuits & Wafers
  { name: 'Oreo Vanilla Pack', price: 2.80, stock: 8, category: 'snack', color: '#1D4ED8', flavorTag: 'Cream Sandwich', iconKey: 'cracker' },
  { name: 'Loacker Hazelnut', price: 4.20, stock: 6, category: 'snack', color: '#B91C1C', flavorTag: 'Crispy Wafer', iconKey: 'wafer' },
  { name: 'Julie’s Peanut Butter', price: 2.50, stock: 9, category: 'snack', color: '#D97706', flavorTag: 'Golden Biscuit', iconKey: 'cracker' },
  { name: 'Pocky Chocolate', price: 3.80, stock: 7, category: 'sweet', color: '#DC2626', flavorTag: 'Biscuit Sticks', iconKey: 'pocky' },
  { name: 'Pocky Strawberry', price: 3.80, stock: 5, category: 'sweet', color: '#EC4899', flavorTag: 'Berry Cream', iconKey: 'pocky' },

  // Row E (row = 5): Chocolate & Gummies
  { name: 'KitKat 4-Finger', price: 3.60, promoPrice: 2.90, stock: 9, category: 'sweet', color: '#DC2626', flavorTag: 'Milk Choco', iconKey: 'chocolate' },
  { name: 'Cadbury Dairy Milk', price: 4.50, stock: 7, category: 'sweet', color: '#6D28D9', flavorTag: 'Rich Cocoa', iconKey: 'chocolate' },
  { name: 'Kinder Bueno Bar', price: 4.90, stock: 0, category: 'sweet', color: '#9A3412', flavorTag: 'Hazelnut Cream', iconKey: 'wafer' },
  { name: 'Haribo Goldbears', price: 4.20, stock: 8, category: 'sweet', color: '#F59E0B', flavorTag: 'Fruit Gummy', iconKey: 'gummy' },
  { name: 'Sugus Assorted', price: 2.80, stock: 10, category: 'sweet', color: '#EC4899', flavorTag: 'Chewy Candy', iconKey: 'gummy' },

  // Row F (row = 6): Instant Cups & Quick Meals
  { name: 'Maggi Hot Cup Curry', price: 3.50, promoPrice: 2.80, stock: 8, category: 'noodle', color: '#EAB308', flavorTag: 'Spicy Curry', iconKey: 'noodle_curry' },
  { name: 'Maggi Tom Yam Cup', price: 3.50, stock: 7, category: 'noodle', color: '#EF4444', flavorTag: 'Zesty Lime', iconKey: 'noodle_tomyam' },
  { name: 'Mamee Chef Lontong', price: 3.80, stock: 6, category: 'noodle', color: '#10B981', flavorTag: 'Creamy Spice', iconKey: 'noodle_curry' },
  { name: 'Samyang Buldak Cup', price: 6.50, stock: 4, category: 'noodle', color: '#1E293B', flavorTag: 'Fire Noodle', iconKey: 'noodle_tomyam' },
  { name: 'Gardenia Twiggies', price: 2.60, stock: 8, category: 'snack', color: '#D97706', flavorTag: 'Choco Cream', iconKey: 'wafer' },
];

export function createEmptyPaymentConfig(): PaymentGatewayConfig {
  return {
    duitnow: {
      merchantId: '',
      apiKey: '',
      secretKey: '',
      webhookUrl: '',
    },
    tng: {
      partnerId: '',
      clientSecret: '',
      merchantCode: '',
      endpointUrl: '',
    },
    fpx: {
      sellerId: '',
      exchangeId: '',
      checksumKey: '',
      gatewayUrl: '',
    },
  };
}

export function createDefault30Slots(variantOffset = 0): ProductSlot[] {
  const slots: ProductSlot[] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 5; c++) {
      const idx = r * 5 + c;
      const tpl = SLOT_TEMPLATES[idx];
      const stock = variantOffset > 0 ? Math.max(2, (tpl.stock + variantOffset) % 11) : tpl.stock;
      slots.push({
        code: `${ROW_LETTERS[r]}${c + 1}`,
        row: r + 1,
        col: c + 1,
        name: tpl.name,
        price: tpl.price,
        promoPrice: tpl.promoPrice,
        stock,
        maxStock: 10,
        category: tpl.category,
        color: tpl.color,
        flavorTag: tpl.flavorTag,
        iconKey: tpl.iconKey,
      });
    }
  }
  return slots;
}

export const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: 'adm-1',
    name: 'Aiman Hakim',
    pin: '1234',
    role: 'admin',
    email: 'aiman@minimart24.my',
  },
  {
    id: 'adm-2',
    name: 'Mei Ling Tan',
    pin: '2468',
    role: 'admin',
    email: 'meiling@minimart24.my',
  },
  {
    id: 'super-1',
    name: 'Fleet Director',
    pin: '9999',
    role: 'superadmin',
    email: 'hq@minimart24.my',
  },
];

export const DEFAULT_MACHINES: Machine[] = [
  {
    id: 'MM24-KL-01',
    name: 'Sunway Lobby Alpha',
    location: 'Sunway Pyramid West Lobby, PJ',
    status: 'online',
    assignedAdminId: 'adm-1',
    slots: createDefault30Slots(0),
    paymentConfig: createEmptyPaymentConfig(),
  },
  {
    id: 'MM24-KL-02',
    name: 'KL Sentral Transit',
    location: 'KL Sentral Concourse Gate B',
    status: 'online',
    assignedAdminId: 'adm-2',
    slots: createDefault30Slots(2),
    paymentConfig: createEmptyPaymentConfig(),
  },
];

export function createSeedTransactions(): SaleTransaction[] {
  const now = Date.now();
  const hours = (h: number) => new Date(now - h * 3600 * 1000).toISOString();

  return [
    {
      id: 'TXN-9014',
      machineId: 'MM24-KL-01',
      machineName: 'Sunway Lobby Alpha',
      timestamp: hours(1.2),
      items: [
        { code: 'A1', row: 1, col: 1, name: 'Milo Gao Siew Dai', price: 3.20, qty: 1 },
        { code: 'C1', row: 3, col: 1, name: 'Twisties BBQ Curry', price: 2.50, qty: 1 },
      ],
      total: 5.70,
      paymentMethod: 'duitnow',
      status: 'completed',
      referenceCode: 'DN-882410',
    },
    {
      id: 'TXN-9013',
      machineId: 'MM24-KL-01',
      machineName: 'Sunway Lobby Alpha',
      timestamp: hours(3.5),
      items: [
        { code: 'B1', row: 2, col: 1, name: 'Nescafe Latte Can', price: 3.50, qty: 2 },
      ],
      total: 7.00,
      paymentMethod: 'tng',
      status: 'completed',
      referenceCode: 'TNG-440192',
    },
    {
      id: 'TXN-9012',
      machineId: 'MM24-KL-01',
      machineName: 'Sunway Lobby Alpha',
      timestamp: hours(29),
      items: [
        { code: 'F1', row: 6, col: 1, name: 'Maggi Hot Cup Curry', price: 3.50, qty: 1 },
        { code: 'A3', row: 1, col: 3, name: 'Spritzer Mineral', price: 1.50, qty: 1 },
      ],
      total: 5.00,
      paymentMethod: 'fpx',
      status: 'completed',
      referenceCode: 'FPX-119044',
    },
    {
      id: 'TXN-9011',
      machineId: 'MM24-KL-01',
      machineName: 'Sunway Lobby Alpha',
      timestamp: hours(74),
      items: [
        { code: 'E1', row: 5, col: 1, name: 'KitKat 4-Finger', price: 3.60, qty: 2 },
        { code: 'D4', row: 4, col: 4, name: 'Pocky Chocolate', price: 3.80, qty: 1 },
      ],
      total: 11.00,
      paymentMethod: 'duitnow',
      status: 'completed',
      referenceCode: 'DN-771203',
    },
    {
      id: 'TXN-9010',
      machineId: 'MM24-KL-02',
      machineName: 'KL Sentral Transit',
      timestamp: hours(18),
      items: [
        { code: 'A2', row: 1, col: 2, name: '100PLUS Active', price: 2.50, qty: 2 },
      ],
      total: 5.00,
      paymentMethod: 'tng',
      status: 'completed',
      referenceCode: 'TNG-302918',
    },
    {
      id: 'TXN-9009',
      machineId: 'MM24-KL-01',
      machineName: 'Sunway Lobby Alpha',
      timestamp: hours(240),
      items: [
        { code: 'F4', row: 6, col: 4, name: 'Samyang Buldak Cup', price: 6.50, qty: 1 },
        { code: 'B2', row: 2, col: 2, name: 'Oatside Barista', price: 4.50, qty: 1 },
      ],
      total: 11.00,
      paymentMethod: 'duitnow',
      status: 'completed',
      referenceCode: 'DN-650112',
    },
  ];
}
