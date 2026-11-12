import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Gift, Plus, Sparkles, Tag, X } from 'lucide-react';
import {
  formatRM,
  hasActivePromo,
  Machine,
  ProductSlot,
} from '../../types/vending';
import { ProductIllustration } from '../ProductIllustration';
import cyberPromoBannerImg from '../../assets/images/cyber_promo_banner_1794515576657.jpg';

interface PromotionModalProps {
  isOpen: boolean;
  machine: Machine;
  highlightedSlotCode?: string | null;
  onClose: () => void;
  onAddPromoItem: (slot: ProductSlot) => void;
  onProceedToCheckout: () => void;
  cartCount: number;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  machine,
  highlightedSlotCode,
  onClose,
  onAddPromoItem,
  onProceedToCheckout,
  cartCount,
}) => {
  const [bannerError, setBannerError] = useState(false);
  const [justAddedCode, setJustAddedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const promoSlots = machine.slots.filter((s) => hasActivePromo(s));
  const promoSrc = machine.promoImageUrl || cyberPromoBannerImg;
  const promoHeadline = machine.promoTitle || 'SPECIAL PROMOTION UPDATES';
  const promoSub =
    machine.promoSubtitle || 'Tap any promotion price below to add straight to your cart!';

  const handleGrabDeal = (slot: ProductSlot) => {
    if (slot.stock <= 0) return;
    onAddPromoItem(slot);
    setJustAddedCode(slot.code);
    window.setTimeout(() => {
      setJustAddedCode((prev) => (prev === slot.code ? null : prev));
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#04071E]/88 backdrop-blur-md p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Special Promotion Updates"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="cyber-glass-panel w-full max-w-2xl rounded-3xl border-2 border-amber-300/90 shadow-[0_0_55px_rgba(255,204,0,0.35),0_0_32px_rgba(0,229,255,0.3)] overflow-hidden my-auto text-white"
      >
        {/* Top Banner Image + Header */}
        <div className="relative h-40 sm:h-48 bg-gradient-to-br from-[#170D4A] to-[#0A1F5A] overflow-hidden">
          {!bannerError && (
            <img
              src={promoSrc}
              alt={promoHeadline}
              referrerPolicy="no-referrer"
              onError={() => setBannerError(true)}
              className="w-full h-full object-cover opacity-85"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050B29] via-[#050B29]/45 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-[#060D2C]/85 border border-cyan-300/70 text-cyan-200 hover:text-white flex items-center justify-center shadow-[0_0_14px_rgba(0,229,255,0.4)]"
            aria-label="Close promotion modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 text-rose-800 font-display text-xs font-extrabold px-3 py-1 shadow-[0_0_16px_rgba(255,208,21,0.7)]">
            <Gift className="w-3.5 h-3.5" />
            <span>SPECIAL PROMOTION</span>
          </div>

          <div className="absolute bottom-3 left-4 right-4 z-10">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white cyber-logo-glow leading-tight">
              {promoHeadline}
            </h2>
            <p className="text-xs sm:text-sm text-cyan-100/90 mt-0.5">
              {promoSub}
            </p>
          </div>
        </div>

        {/* Inside Promotion Update Deals List */}
        <div className="p-4 sm:p-5 space-y-3 max-h-[55vh] overflow-y-auto custom-scroll">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>LIVE PROMOTION PRICES ({promoSlots.length})</span>
            </div>
            <span className="text-[11px] font-mono-tabular text-cyan-200/80">
              Machine: {machine.id}
            </span>
          </div>

          {promoSlots.length === 0 ? (
            <div className="rounded-2xl border border-cyan-400/35 bg-white/5 p-6 text-center">
              <Tag className="w-8 h-8 text-cyan-300 mx-auto mb-2 opacity-80" />
              <p className="font-display text-base font-bold text-white">
                No Flash Promo Prices Set Yet
              </p>
              <p className="text-xs text-cyan-100/75 mt-1">
                Staff can set discounted promotion prices on any slot inside Admin &gt; Promo Picture.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {promoSlots.map((slot) => {
                const promoVal = slot.promoPrice as number;
                const savings = slot.price - promoVal;
                const pctOff = Math.round((savings / slot.price) * 100);
                const soldOut = slot.stock <= 0;
                const isHighlighted = highlightedSlotCode === slot.code;
                const justAdded = justAddedCode === slot.code;

                return (
                  <div
                    key={slot.code}
                    className={`rounded-2xl p-3 border transition-all flex items-center gap-3 ${
                      isHighlighted
                        ? 'bg-amber-400/15 border-amber-300 shadow-[0_0_22px_rgba(255,208,21,0.45)]'
                        : 'bg-[#08133D]/90 border-cyan-400/55 hover:border-amber-300/80'
                    }`}
                  >
                    <div className="relative w-14 h-14 rounded-xl bg-[#040B26] border border-cyan-400/50 flex items-center justify-center shrink-0">
                      <ProductIllustration
                        iconKey={slot.iconKey}
                        color={slot.color}
                        name={slot.name}
                        customImageUrl={slot.customImageUrl}
                        className="w-11 h-11"
                      />
                      <span className="absolute -top-1.5 -left-1.5 rounded-md bg-cyan-400 text-slate-950 font-mono-tabular text-[10px] font-bold px-1.5 py-0.5">
                        {slot.code}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-full bg-pink-500 text-white text-[10px] font-extrabold px-2 py-0.5 shadow-[0_0_8px_rgba(255,31,166,0.65)]">
                          -{pctOff}% OFF
                        </span>
                        <span className="text-[10px] font-bold text-emerald-300 tabular-nums">
                          {soldOut ? 'Sold Out' : `${slot.stock} left`}
                        </span>
                      </div>
                      <p className="font-bold text-sm text-white truncate mt-1">
                        {slot.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400 line-through font-mono-tabular">
                          {formatRM(slot.price)}
                        </span>
                        <span className="font-display text-base font-bold text-amber-300 font-mono-tabular">
                          {formatRM(promoVal)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={() => handleGrabDeal(slot)}
                      className={`shrink-0 rounded-xl px-3 py-2.5 text-xs font-bold flex items-center gap-1 transition-all ${
                        soldOut
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : justAdded
                            ? 'bg-emerald-400 text-slate-950 shadow-[0_0_16px_rgba(52,211,153,0.75)]'
                            : 'cyber-btn-pink text-white'
                      }`}
                    >
                      {justAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>{soldOut ? 'Out' : 'Add'}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3.5 bg-[#040922]/90 border-t border-cyan-400/30 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold text-cyan-100"
          >
            Back to Machine
          </button>

          {cartCount > 0 && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="rounded-xl cyber-btn-mint px-4 py-2.5 text-xs font-bold text-slate-950"
            >
              Checkout Cart ({cartCount}) &raquo;
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
