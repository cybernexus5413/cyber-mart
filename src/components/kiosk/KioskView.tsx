import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  CartItem,
  formatRM,
  getEffectivePrice,
  hasActivePromo,
  Machine,
  ProductSlot,
  ROW_LETTERS,
  RowLetter,
} from '../../types/vending';
import { ProductIllustration } from '../ProductIllustration';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { CyberCitySkyline } from './CyberHeroGraphics';
import { PromotionModal } from './PromotionModal';

interface KioskViewProps {
  machine: Machine;
  cart: CartItem[];
  onAddToCart: (slot: ProductSlot) => void;
  onUpdateCartQty: (slotCode: string, delta: number) => void;
  onRemoveFromCart: (slotCode: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  onOpenPinPad: () => void;
}

const ROW_BADGE_STYLES: Record<
  RowLetter,
  { bg: string; glow: string }
> = {
  A: {
    bg: 'from-[#1D74FF] to-[#0A46D8]',
    glow: 'shadow-[0_0_16px_rgba(29,116,255,0.75),inset_0_0_8px_rgba(255,255,255,0.45)]',
  },
  B: {
    bg: 'from-[#FFC126] to-[#F57C00]',
    glow: 'shadow-[0_0_16px_rgba(255,168,0,0.75),inset_0_0_8px_rgba(255,255,255,0.45)]',
  },
  C: {
    bg: 'from-[#FF2A6D] to-[#D9044B]',
    glow: 'shadow-[0_0_16px_rgba(255,42,109,0.75),inset_0_0_8px_rgba(255,255,255,0.45)]',
  },
  D: {
    bg: 'from-[#1AE080] to-[#069E55]',
    glow: 'shadow-[0_0_16px_rgba(26,224,128,0.72),inset_0_0_8px_rgba(255,255,255,0.45)]',
  },
  E: {
    bg: 'from-[#9A4EFF] to-[#681CEB]',
    glow: 'shadow-[0_0_16px_rgba(154,78,255,0.75),inset_0_0_8px_rgba(255,255,255,0.45)]',
  },
  F: {
    bg: 'from-[#FFE01B] to-[#F29F05]',
    glow: 'shadow-[0_0_16px_rgba(255,224,27,0.75),inset_0_0_8px_rgba(255,255,255,0.45)]',
  },
};

export const KioskView: React.FC<KioskViewProps> = ({
  machine,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onRemoveFromCart,
  onClearCart,
  onCheckout,
  onOpenPinPad,
}) => {
  const [tapCount, setTapCount] = useState(0);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [highlightedPromoSlot, setHighlightedPromoSlot] = useState<string | null>(null);
  const tapTimerRef = useRef<number | null>(null);

  const handleLogoTap = () => {
    const nextCount = tapCount + 1;
    if (tapTimerRef.current) {
      window.clearTimeout(tapTimerRef.current);
    }

    if (nextCount >= 5) {
      setTapCount(0);
      onOpenPinPad();
      return;
    }

    setTapCount(nextCount);
    tapTimerRef.current = window.setTimeout(() => {
      setTapCount(0);
    }, 2200);
  };

  const openPromoModal = (slotCode?: string) => {
    setHighlightedPromoSlot(slotCode ?? null);
    setShowPromoModal(true);
  };

  const cartQtyMap = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach((item) => map.set(item.slot.code, item.qty));
    return map;
  }, [cart]);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  const totalAmount = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + getEffectivePrice(item.slot) * item.qty,
        0
      ),
    [cart]
  );

  const promoStats = useMemo(() => {
    const promoSlots = machine.slots.filter((s) => hasActivePromo(s));
    const lowestPromoPrice =
      promoSlots.length > 0
        ? Math.min(...promoSlots.map((s) => s.promoPrice as number))
        : null;
    return { count: promoSlots.length, lowestPromoPrice };
  }, [machine.slots]);

  const rows = useMemo(() => {
    return ROW_LETTERS.map((letter, rowIdx) => {
      const rowNum = rowIdx + 1;
      const slots = machine.slots
        .filter((s) => s.row === rowNum)
        .sort((a, b) => a.col - b.col);
      return { letter, rowNum, slots };
    });
  }, [machine.slots]);

  const isMaintenance = machine.status === 'maintenance';

  return (
    <div className="min-h-screen w-full cyber-bg relative overflow-x-hidden flex flex-col text-white">
      <div className="pointer-events-none fixed inset-0 cyber-grid-overlay opacity-75" />
      <CyberCitySkyline />

      {/* Main Responsive Kiosk & iPhone Frame */}
      <div className="relative z-10 w-full max-w-[1040px] mx-auto px-1.5 sm:px-3.5 pt-2 pb-3 flex-1 flex flex-col gap-2 sm:gap-2.5">
        {/* Exact Professional Header Banner with Interactive Hotspots */}
        <header className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-cyan-400/60 shadow-[0_0_28px_rgba(0,229,255,0.45)] bg-[#040924]">
          <div className="relative w-full aspect-[1012/298]">
            <img
              src="/assets/aistudio/file_000000007e6082078b392cb539c32438_a379dafd.png"
              alt="CYBER MART - Shop Smart, Live Better"
              className="w-full h-full object-cover select-none pointer-events-none"
            />

            {/* Dynamic Machine ID override pill only when SuperAdmin switches away from default machine */}
            {machine.id !== 'MM24-KL-01' && (
              <div className="absolute top-[4.5%] left-[12.5%] w-[21%] h-[16%] rounded-full bg-[#061542] border border-cyan-400/70 flex items-center justify-center px-1.5 pointer-events-none">
                <span className="font-mono-tabular text-[8px] xs:text-[9px] sm:text-xs font-bold text-white truncate">
                  {machine.id}
                </span>
              </div>
            )}

            {/* Hotspot 1: Top-Right Staff Login Button */}
            <button
              type="button"
              onClick={onOpenPinPad}
              aria-label="Staff Login"
              title="Staff Login"
              className="absolute top-[1.5%] right-[1%] w-[31%] h-[25%] rounded-full hover:bg-pink-400/15 active:bg-pink-400/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 transition-colors cursor-pointer"
            />

            {/* Hotspot 2: Robot & CYBER MART Logo (Tap 5× for Staff PIN Pad) */}
            <button
              type="button"
              onClick={handleLogoTap}
              aria-label="CYBER MART (Tap 5 times for Staff PIN)"
              title="CYBER MART (Tap 5× for Staff PIN)"
              className="absolute top-[25%] left-[1%] w-[68%] h-[72%] rounded-2xl hover:bg-cyan-300/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 cursor-pointer"
            >
              {tapCount > 0 && (
                <span className="absolute top-1.5 left-1/2 -translate-x-1/2 font-mono-tabular text-[10px] sm:text-xs font-bold bg-pink-500 text-white px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(255,31,166,0.95)]">
                  Staff PIN {tapCount}/5
                </span>
              )}
            </button>

            {/* Hotspot 3: Clickable SPECIAL PROMOTION + Gift Box */}
            <button
              type="button"
              onClick={() => openPromoModal()}
              aria-label="Open Special Promotion updates and prices"
              title="Click to see inside promotion updates"
              className="absolute top-[24%] right-[0.5%] w-[29.5%] h-[74%] rounded-2xl hover:bg-amber-300/15 active:bg-amber-300/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 transition-colors cursor-pointer group"
            >
              {promoStats.lowestPromoPrice !== null && (
                <span className="absolute bottom-[6%] left-[4%] inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 border border-amber-200 px-1.5 sm:px-2.5 py-[1px] sm:py-0.5 text-[7px] xs:text-[8px] sm:text-[10px] font-extrabold text-white shadow-[0_0_12px_rgba(255,42,109,0.9)] whitespace-nowrap group-hover:scale-105 transition-transform">
                  <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-yellow-200 shrink-0" />
                  <span>FROM {formatRM(promoStats.lowestPromoPrice)}</span>
                </span>
              )}
            </button>
          </div>
        </header>

        {isMaintenance && (
          <div className="rounded-xl bg-amber-400/95 text-slate-950 px-3 py-1.5 text-[11px] sm:text-xs font-bold text-center shadow-[0_0_16px_rgba(251,191,36,0.5)]">
            Machine in Maintenance Mode &middot; Staff &amp; Remote Dispense Testing Active
          </div>
        )}

        {/* Exact 6x5 Glowing Cyberpunk Cabinet Matrix */}
        <section
          aria-label="Cyber Mart 30-Slot Vending Grid"
          className="cyber-cabinet rounded-2xl sm:rounded-3xl p-1.5 sm:p-3 flex-1 flex flex-col justify-between gap-1 sm:gap-2"
        >
          {rows.map(({ letter, slots }) => {
            const badge = ROW_BADGE_STYLES[letter];
            return (
              <div key={letter} className="flex items-stretch gap-1 sm:gap-2 flex-1">
                {/* Vibrant Neon Row Badge */}
                <div
                  className={`w-8 xs:w-9 sm:w-14 md:w-16 shrink-0 rounded-lg sm:rounded-xl bg-gradient-to-b ${badge.bg} ${badge.glow} p-[2px] flex`}
                >
                  <div className="w-full h-full rounded-[6px] sm:rounded-[10px] border border-white/65 flex flex-col items-center justify-center text-white px-0.5">
                    <span className="text-[6px] xs:text-[7px] sm:text-[9px] font-extrabold uppercase tracking-wider leading-none opacity-95">
                      ROW
                    </span>
                    <span className="font-display text-sm xs:text-base sm:text-2xl font-bold leading-none mt-0.5">
                      {letter}
                    </span>
                  </div>
                </div>

                {/* 5 Slot Columns */}
                <div className="flex-1 grid grid-cols-5 gap-1 sm:gap-2">
                  {slots.map((slot) => {
                    const inCartQty = cartQtyMap.get(slot.code) ?? 0;
                    const soldOut = slot.stock <= 0;
                    const atMaxInCart = inCartQty >= slot.stock;
                    const isPromo = hasActivePromo(slot);
                    const displayPrice = getEffectivePrice(slot);

                    return (
                      <motion.div
                        key={slot.code}
                        role="button"
                        tabIndex={soldOut || atMaxInCart ? -1 : 0}
                        aria-disabled={soldOut || atMaxInCart}
                        aria-label={`${slot.code} ${slot.name}, ${formatRM(displayPrice)}, ${soldOut ? 'Sold out' : `${slot.stock} left`}`}
                        whileTap={!soldOut && !atMaxInCart ? { scale: 0.95 } : undefined}
                        onClick={() => {
                          if (!soldOut && !atMaxInCart) onAddToCart(slot);
                        }}
                        onKeyDown={(e) => {
                          if (
                            (e.key === 'Enter' || e.key === ' ') &&
                            !soldOut &&
                            !atMaxInCart
                          ) {
                            e.preventDefault();
                            onAddToCart(slot);
                          }
                        }}
                        className={`relative rounded-lg sm:rounded-2xl p-1 sm:p-1.5 text-center flex flex-col items-center justify-between transition-all min-w-0 select-none ${
                          soldOut
                            ? 'bg-[#050A28]/70 border border-cyan-900/50 opacity-50 cursor-not-allowed'
                            : inCartQty > 0
                              ? 'cyber-slot-card ring-2 ring-pink-400 shadow-[0_0_18px_rgba(255,31,166,0.6)] cursor-pointer'
                              : isPromo
                                ? 'cyber-slot-card cyber-slot-interactive border-amber-300/90 shadow-[0_0_14px_rgba(255,208,21,0.3)] cursor-pointer'
                                : 'cyber-slot-card cyber-slot-interactive cursor-pointer'
                        }`}
                      >
                        {/* Top Slot Code & Stock */}
                        <div className="w-full flex items-center justify-between gap-0.5 px-0.5">
                          <span className="font-mono-tabular text-[8px] xs:text-[9px] sm:text-[11px] font-bold text-white">
                            {slot.code}
                          </span>
                          <span
                            className={`text-[8px] xs:text-[9px] sm:text-[11px] font-bold tabular-nums ${
                              soldOut
                                ? 'text-rose-400'
                                : slot.stock <= 3
                                  ? 'text-amber-300'
                                  : 'text-cyan-200'
                            }`}
                          >
                            {slot.stock}
                          </span>
                        </div>

                        {/* Product Illustration / Custom Photo */}
                        <div className="relative my-0.5 flex items-center justify-center">
                          <ProductIllustration
                            iconKey={slot.iconKey}
                            color={slot.color}
                            name={slot.name}
                            customImageUrl={slot.customImageUrl}
                            className={`w-7 h-7 xs:w-8 xs:h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 ${
                              soldOut ? 'grayscale opacity-40' : ''
                            }`}
                          />
                        </div>

                        {/* Product Name + Oval Price Capsule */}
                        <div className="w-full flex flex-col items-center gap-0.5">
                          <p className="text-[7px] xs:text-[8px] sm:text-[11px] font-bold text-white leading-tight truncate w-full px-0.5">
                            {slot.name}
                          </p>

                          {isPromo && !soldOut ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openPromoModal(slot.code);
                              }}
                              title="Click to see promotion update & savings"
                              className="inline-flex items-center justify-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400/25 via-pink-500/35 to-amber-400/25 hover:from-amber-400/45 hover:to-pink-500/55 border border-amber-300 text-amber-200 font-mono-tabular text-[7px] xs:text-[8px] sm:text-[11px] font-extrabold px-1.5 sm:px-2.5 py-[1px] sm:py-0.5 shadow-[0_0_10px_rgba(255,208,21,0.55)] whitespace-nowrap transition-transform hover:scale-105"
                            >
                              <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-300 shrink-0" />
                              <span>{formatRM(displayPrice)}</span>
                            </button>
                          ) : (
                            <span className="inline-block rounded-full bg-[#091D4D]/95 border border-cyan-300/90 text-white font-mono-tabular text-[7px] xs:text-[8px] sm:text-[11px] font-bold px-1.5 sm:px-3 py-[1px] sm:py-0.5 shadow-[0_0_8px_rgba(0,229,255,0.3)] whitespace-nowrap">
                              {formatRM(displayPrice)}
                            </span>
                          )}
                        </div>

                        {/* Cart Qty Corner Badge */}
                        {inCartQty > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-pink-500 text-white font-mono-tabular text-[9px] sm:text-[11px] font-bold flex items-center justify-center shadow-[0_0_12px_rgba(255,31,166,0.95)]">
                            {inCartQty}
                          </span>
                        )}

                        {/* Promo Tag Corner Dot */}
                        {isPromo && !soldOut && inCartQty === 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPromoModal(slot.code);
                            }}
                            className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 text-[6px] sm:text-[8px] font-black px-1.5 py-[0.5px] tracking-wider shadow-[0_0_8px_rgba(255,208,21,0.8)] uppercase"
                          >
                            PROMO
                          </button>
                        )}

                        {/* SOLD OUT Tilted Neon Stamp */}
                        {soldOut && (
                          <div className="absolute inset-0 rounded-lg sm:rounded-2xl bg-[#04071D]/65 flex items-center justify-center p-1">
                            <span className="rounded-md bg-[#080B28]/95 border-[1.5px] border-pink-500 text-pink-400 font-display text-[8px] sm:text-xs font-extrabold px-1.5 sm:px-2.5 py-0.5 -rotate-6 shadow-[0_0_12px_rgba(255,31,166,0.5)] leading-tight">
                              SOLD OUT
                            </span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        {/* Bottom 2-Panel Chamfered Neon Bar Matching Mockup 100%: Left = MY CART + CHECK OUT >> | Right = TOTAL */}
        <footer
          aria-label="Kiosk Cart and Total"
          className="grid grid-cols-12 gap-2 sm:gap-3"
        >
          {/* Left Panel (7/12): MY CART */}
          <div className="col-span-7 drop-shadow-[0_0_18px_rgba(0,229,255,0.4)]">
            <div className="chamfer-card bg-gradient-to-br from-cyan-400 via-sky-500 to-fuchsia-500 p-[2px] h-full">
              <div className="chamfer-card bg-[#050C32]/95 p-2 sm:p-3.5 h-full flex flex-col justify-between min-h-[138px] sm:min-h-[168px]">
                {/* Top Header Tab: Pink [MY CART] + Cyan [count] */}
                <div className="flex items-center justify-between gap-1">
                  <div className="inline-flex items-center rounded-lg overflow-hidden shadow-[0_0_12px_rgba(255,31,166,0.55)]">
                    <span className="bg-gradient-to-r from-[#D91688] to-[#FF249E] text-white font-display text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 inline-flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>MY CART</span>
                    </span>
                    <span className="bg-cyan-400 text-slate-950 font-mono-tabular text-[10px] sm:text-xs font-extrabold px-2 sm:px-2.5 py-1">
                      {totalItems}
                    </span>
                  </div>

                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={onClearCart}
                      className="text-[10px] sm:text-xs font-bold text-pink-300 hover:text-pink-200 px-1.5 py-0.5"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Middle Cart Body */}
                {cart.length > 0 ? (
                  <div className="my-1.5 flex-1 max-h-20 sm:max-h-24 overflow-y-auto custom-scroll divide-y divide-cyan-400/15 pr-0.5">
                    {cart.map((item) => {
                      const unitPrice = getEffectivePrice(item.slot);
                      return (
                        <div
                          key={item.slot.code}
                          className="py-1 flex items-center justify-between gap-1 text-[9px] sm:text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-white truncate">
                              <span className="font-mono-tabular text-cyan-300 mr-1">
                                {item.slot.code}
                              </span>
                              {item.slot.name}
                            </p>
                            <p className="text-[8px] sm:text-[10px] font-mono-tabular text-amber-300">
                              {formatRM(unitPrice)} &times; {item.qty}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => onUpdateCartQty(item.slot.code, -1)}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                              aria-label={`Decrease ${item.slot.name}`}
                            >
                              <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                            <span className="w-4 text-center font-mono-tabular font-bold text-cyan-200">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              disabled={item.qty >= item.slot.stock}
                              onClick={() => onUpdateCartQty(item.slot.code, 1)}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-40 flex items-center justify-center text-white"
                              aria-label={`Increase ${item.slot.name}`}
                            >
                              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveFromCart(item.slot.code)}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-md text-pink-300 hover:text-rose-400 flex items-center justify-center"
                              aria-label={`Remove ${item.slot.name}`}
                            >
                              <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="my-1.5 flex-1 flex flex-col items-center justify-center text-center">
                    <motion.div
                      animate={{ y: [0, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 2.6 }}
                      className="text-cyan-300 drop-shadow-[0_0_12px_rgba(0,229,255,0.75)]"
                    >
                      <ShoppingCart className="w-7 h-7 sm:w-9 sm:h-9" />
                    </motion.div>
                    <p className="mt-1 text-[10px] sm:text-xs font-semibold text-cyan-200/85">
                      Cart is empty
                    </p>
                  </div>
                )}

                {/* Bottom Chamfered Neon Pink CHECK OUT >> Button */}
                <motion.button
                  type="button"
                  disabled={cart.length === 0}
                  whileTap={cart.length > 0 ? { scale: 0.97 } : undefined}
                  animate={cart.length > 0 ? { scale: [1, 1.02, 1] } : undefined}
                  transition={{ repeat: cart.length > 0 ? Infinity : 0, duration: 1.8 }}
                  onClick={onCheckout}
                  className="chamfer-hex w-full cyber-btn-pink border border-pink-300/80 py-1.5 sm:py-2.5 px-3 font-display text-xs sm:text-base font-extrabold tracking-wide text-white disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <span>CHECK OUT</span>
                  <span className="text-cyan-200">&raquo;</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Right Panel (5/12): TOTAL */}
          <div className="col-span-5 drop-shadow-[0_0_20px_rgba(255,31,184,0.35)]">
            <div className="chamfer-card bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-500 p-[2px] h-full">
              <div className="chamfer-card bg-[#050C32]/95 p-2 sm:p-4 h-full flex flex-col items-center justify-center text-center min-h-[138px] sm:min-h-[168px]">
                <span className="font-display text-xs sm:text-base font-extrabold tracking-widest text-cyan-300 drop-shadow-[0_0_10px_rgba(0,229,255,0.7)] uppercase">
                  TOTAL
                </span>
                <p className="mt-1 sm:mt-2 font-display text-xl xs:text-2xl sm:text-4xl font-black text-white tabular-nums drop-shadow-[0_0_16px_rgba(255,255,255,0.45)] whitespace-nowrap">
                  {formatRM(totalAmount)}
                </p>
                <p className="mt-1.5 sm:mt-2.5 text-[8px] xs:text-[9px] sm:text-xs font-semibold text-cyan-100/85 leading-snug">
                  <span className="text-cyan-300 mr-1">&#9670;</span>
                  {totalItems} item(s) &bull; DuitNow / TnG / FPX
                </p>
              </div>
            </div>
          </div>
        </footer>

        <div className="flex justify-end">
          <PWAInstallButton compact />
        </div>
      </div>

      {/* Clickable Promotion Update Modal */}
      <PromotionModal
        isOpen={showPromoModal}
        machine={machine}
        highlightedSlotCode={highlightedPromoSlot}
        onClose={() => setShowPromoModal(false)}
        onAddPromoItem={onAddToCart}
        onProceedToCheckout={onCheckout}
        cartCount={totalItems}
      />
    </div>
  );
};
