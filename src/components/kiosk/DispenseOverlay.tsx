import React from 'react';
import { CheckCircle2, Cog, PackageCheck, Volume2 } from 'lucide-react';
import { ProductIllustration } from '../ProductIllustration';
import { ProductSlot } from '../../types/vending';
import cyberCatMascotImg from '../../assets/images/cyber_cat_mascot_1794515576573.jpg';

export interface DispenseQueueItem {
  slot: ProductSlot;
  index: number;
  totalCount: number;
}

interface DispenseOverlayProps {
  phase: 'idle' | 'dispensing' | 'celebration';
  currentItem: DispenseQueueItem | null;
  completedCodes: string[];
  onDone: () => void;
}

export const DispenseOverlay: React.FC<DispenseOverlayProps> = ({
  phase,
  currentItem,
  completedCodes,
  onDone,
}) => {
  if (phase === 'idle') return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#09041D]/85 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-label={
        phase === 'dispensing'
          ? 'Dispensing Your Snacks'
          : 'Thank You! Please come again.'
      }
    >
      {phase === 'dispensing' && currentItem && (
        <div className="cyber-glass-panel w-full max-w-md rounded-3xl p-7 text-center border-2 border-cyan-300 shadow-[0_0_50px_rgba(0,240,255,0.45)] text-white">
          <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500/25 to-pink-500/25 flex items-center justify-center relative border border-cyan-300/60 shadow-[0_0_24px_rgba(34,211,238,0.35)]">
            <ProductIllustration
              iconKey={currentItem.slot.iconKey}
              color={currentItem.slot.color}
              name={currentItem.slot.name}
              customImageUrl={currentItem.slot.customImageUrl}
              className="w-16 h-16 animate-bounce"
            />
            <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-[0_0_16px_rgba(255,60,172,0.75)]">
              <Cog className="w-5 h-5 animate-spin" />
            </div>
          </div>

          <h2 className="mt-5 font-display text-2xl sm:text-3xl font-bold text-white cyber-logo-glow">
            Dispensing Your Snacks...
          </h2>
          <p className="mt-2 text-sm text-cyan-100/90">
            Spinning motor for slot{' '}
            <span className="font-mono-tabular font-bold text-pink-300">
              {currentItem.slot.code}
            </span>{' '}
            (Row {currentItem.slot.row}, Col {currentItem.slot.col})
          </p>

          <div className="mt-4 rounded-2xl bg-white/10 border border-cyan-300/40 px-4 py-3">
            <p className="font-bold text-white text-sm">{currentItem.slot.name}</p>
            <p className="text-xs text-cyan-200 mt-0.5 tabular-nums">
              Item {currentItem.index} of {currentItem.totalCount}
            </p>
          </div>

          <div className="mt-5 h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-pink-500 to-amber-400 transition-all duration-500 shadow-[0_0_12px_rgba(0,240,255,0.8)]"
              style={{
                width: `${Math.round((currentItem.index / currentItem.totalCount) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {phase === 'celebration' && (
        <div className="cyber-glass-panel w-full max-w-md rounded-3xl p-7 text-center border-2 border-emerald-400 shadow-[0_0_55px_rgba(52,211,153,0.45)] text-white">
          <div className="mx-auto w-40 h-40 rounded-3xl overflow-hidden shadow-[0_0_32px_rgba(255,60,172,0.55)] border-2 border-cyan-300 bg-[#140B36] flex items-center justify-center">
            <img
              src={cyberCatMascotImg}
              alt="Cyber Cat celebrating snack delivery"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-5 inline-flex items-center gap-1.5 text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Purchase Successful</span>
            <Volume2 className="w-4 h-4 ml-1 text-cyan-300" />
          </div>

          <h2 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold text-white cyber-logo-glow leading-tight">
            Thank You!
            <br />
            <span className="text-cyan-300">Please come again.</span>
          </h2>

          <p className="mt-2.5 text-sm text-cyan-100/85">
            Collect your snacks from the lower chute below.
          </p>

          <div className="mt-4 rounded-2xl bg-emerald-400/15 border border-emerald-300/50 px-4 py-3 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-200">
            <PackageCheck className="w-4 h-4 shrink-0" />
            <span className="font-mono-tabular">
              Dispensed slots: {completedCodes.join(' · ')}
            </span>
          </div>

          <button
            type="button"
            onClick={onDone}
            className="mt-6 w-full rounded-2xl cyber-btn-mint py-3.5 text-sm font-bold text-slate-950"
          >
            Done · Start New Order
          </button>
        </div>
      )}
    </div>
  );
};
