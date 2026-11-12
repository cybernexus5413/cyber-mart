import React, { useState } from 'react';
import { Delete, LockKeyhole, ShieldCheck, X } from 'lucide-react';
import { AdminUser } from '../../types/vending';

interface PinPadModalProps {
  isOpen: boolean;
  admins: AdminUser[];
  onClose: () => void;
  onSuccess: (user: AdminUser) => void;
}

export const PinPadModal: React.FC<PinPadModalProps> = ({
  isOpen,
  admins,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setError('');

    if (nextPin.length === 4) {
      const matched = admins.find((u) => u.pin === nextPin);
      if (matched) {
        setTimeout(() => {
          setPin('');
          setError('');
          onSuccess(matched);
        }, 120);
      } else {
        setError('Invalid 4-digit PIN. Try Admin (1234) or SuperAdmin (9999).');
        setTimeout(() => {
          setPin('');
        }, 450);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#09041D]/85 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Cyber Mart Staff PIN Access"
    >
      <div className="cyber-glass-panel w-full max-w-sm rounded-3xl p-6 border-2 border-cyan-300 shadow-[0_0_45px_rgba(34,211,238,0.4)] text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 to-cyan-400 text-white flex items-center justify-center shadow-[0_0_18px_rgba(255,60,172,0.6)]">
              <LockKeyhole className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">
                CYBER MART Staff PIN
              </h2>
              <p className="text-xs text-cyan-200/80">
                Enter 4-digit Admin or SuperAdmin PIN
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPin('');
              setError('');
              onClose();
            }}
            className="p-2 rounded-xl text-cyan-200 hover:text-white hover:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close PIN modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          {[0, 1, 2, 3].map((idx) => {
            const filled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center font-mono-tabular text-2xl font-bold transition-all ${
                  error
                    ? 'border-rose-400 bg-rose-500/20 text-rose-300'
                    : filled
                      ? 'border-cyan-300 bg-cyan-400/20 text-pink-300 scale-105 shadow-[0_0_16px_rgba(34,211,238,0.5)]'
                      : 'border-white/20 bg-white/5 text-white/30'
                }`}
              >
                {filled ? '●' : ''}
              </div>
            );
          })}
        </div>

        {error ? (
          <p className="mt-3 text-center text-xs font-semibold text-rose-300 min-h-[18px]">
            {error}
          </p>
        ) : (
          <p className="mt-3 text-center text-xs text-cyan-200/75 min-h-[18px]">
            Demo PINs · Admin: <span className="font-mono-tabular font-bold text-white">1234</span> · SuperAdmin: <span className="font-mono-tabular font-bold text-white">9999</span>
          </p>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {keys.map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="cyber-slot-card cyber-slot-interactive h-14 rounded-2xl font-display text-2xl font-bold text-white flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-cyan-100 transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="cyber-slot-card cyber-slot-interactive h-14 rounded-2xl font-display text-2xl font-bold text-white flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-cyan-100 flex items-center justify-center transition-colors"
            aria-label="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-cyan-200/75">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
          <span>Role-based session unlocks fleet &amp; motor controls</span>
        </div>
      </div>
    </div>
  );
};
