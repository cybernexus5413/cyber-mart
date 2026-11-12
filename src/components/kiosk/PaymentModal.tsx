import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { CheckCircle2, Clock, Landmark, QrCode, Smartphone, X } from 'lucide-react';
import { CartItem, formatRM, Machine, PaymentMethod } from '../../types/vending';

interface PaymentModalProps {
  isOpen: boolean;
  machine: Machine;
  cart: CartItem[];
  total: number;
  onCancel: () => void;
  onPaymentSuccess: (method: PaymentMethod) => void;
}

const PAYMENT_OPTIONS: Array<{
  id: PaymentMethod;
  label: string;
  sublabel: string;
  badgeColor: string;
  activeBorder: string;
  accentBg: string;
}> = [
  {
    id: 'duitnow',
    label: 'DuitNow QR',
    sublabel: 'National Instant QR',
    badgeColor: 'bg-pink-500 text-white',
    activeBorder: 'border-pink-400 bg-pink-500/20 shadow-[0_0_16px_rgba(255,60,172,0.35)]',
    accentBg: 'from-pink-500 to-rose-600',
  },
  {
    id: 'tng',
    label: "Touch 'n Go",
    sublabel: 'eWallet QR',
    badgeColor: 'bg-cyan-400 text-slate-950',
    activeBorder: 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_16px_rgba(0,240,255,0.35)]',
    accentBg: 'from-cyan-400 to-blue-600',
  },
  {
    id: 'fpx',
    label: 'FPX Online QR',
    sublabel: 'Malaysian Banking',
    badgeColor: 'bg-emerald-400 text-slate-950',
    activeBorder: 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_16px_rgba(52,211,153,0.35)]',
    accentBg: 'from-emerald-400 to-teal-600',
  },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  machine,
  cart,
  total,
  onCancel,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('duitnow');
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const gatewayInfo = useMemo(() => {
    const cfg = machine.paymentConfig;
    if (selectedMethod === 'duitnow') {
      const configured = Boolean(cfg.duitnow.merchantId.trim());
      return {
        configured,
        merchantRef: cfg.duitnow.merchantId.trim() || `DEMO-DN-${machine.id}`,
        payload: `DUITNOW|MERCHANT:${cfg.duitnow.merchantId || machine.id}|AMT:${total.toFixed(2)}|CUR:MYR|ITEMS:${cart.map((c) => `${c.slot.code}x${c.qty}`).join(',')}`,
      };
    }
    if (selectedMethod === 'tng') {
      const configured = Boolean(cfg.tng.partnerId.trim() || cfg.tng.merchantCode.trim());
      return {
        configured,
        merchantRef: cfg.tng.merchantCode.trim() || cfg.tng.partnerId.trim() || `DEMO-TNG-${machine.id}`,
        payload: `TNG-EWALLET|PARTNER:${cfg.tng.partnerId || 'DEMO'}|CODE:${cfg.tng.merchantCode || machine.id}|AMT:${total.toFixed(2)}|MYR`,
      };
    }
    const configured = Boolean(cfg.fpx.sellerId.trim());
    return {
      configured,
      merchantRef: cfg.fpx.sellerId.trim() || `DEMO-FPX-${machine.id}`,
      payload: `FPX-QR|SELLER:${cfg.fpx.sellerId || machine.id}|EX:${cfg.fpx.exchangeId || 'EX01'}|AMT:${total.toFixed(2)}|MYR`,
    };
  }, [machine, selectedMethod, total, cart]);

  useEffect(() => {
    if (!isOpen) return;
    setSecondsLeft(60);
  }, [isOpen, selectedMethod]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isOpen, selectedMethod]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const colorMap: Record<PaymentMethod, string> = {
      duitnow: '#DB2777',
      tng: '#0284C7',
      fpx: '#059669',
    };
    QRCode.toDataURL(gatewayInfo.payload, {
      width: 240,
      margin: 2,
      color: {
        dark: colorMap[selectedMethod],
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, gatewayInfo.payload, selectedMethod]);

  if (!isOpen) return null;

  const activeMeta = PAYMENT_OPTIONS.find((p) => p.id === selectedMethod) ?? PAYMENT_OPTIONS[0];
  const expired = secondsLeft === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#09041D]/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Malaysian QR Payment Checkout"
    >
      <div className="cyber-glass-panel w-full max-w-lg rounded-3xl p-5 sm:p-6 border-2 border-cyan-300 shadow-[0_0_50px_rgba(255,60,172,0.4)] my-auto text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-cyan-300">
              CYBER MART · {machine.id}
            </p>
            <h2 className="font-display text-2xl font-bold text-white">
              Scan &amp; Pay Instant QR
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl text-cyan-200 hover:text-white hover:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Cancel payment"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {PAYMENT_OPTIONS.map((opt) => {
            const active = opt.id === selectedMethod;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedMethod(opt.id)}
                className={`rounded-2xl p-2.5 text-left border-2 transition-all min-h-[68px] ${
                  active
                    ? opt.activeBorder
                    : 'border-white/15 bg-white/5 hover:border-cyan-300/50'
                }`}
              >
                <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold ${opt.badgeColor}`}>
                  {opt.id === 'duitnow' && <QrCode className="w-3 h-3" />}
                  {opt.id === 'tng' && <Smartphone className="w-3 h-3" />}
                  {opt.id === 'fpx' && <Landmark className="w-3 h-3" />}
                  <span className="truncate">{opt.id === 'tng' ? 'TnG' : opt.id === 'duitnow' ? 'DuitNow' : 'FPX'}</span>
                </span>
                <p className="mt-1.5 text-xs font-bold text-white truncate">
                  {opt.label}
                </p>
                <p className="text-[10px] text-cyan-100/70 truncate">{opt.sublabel}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-3xl bg-white/10 border border-cyan-300/35 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
          <div className={`relative p-3 rounded-2xl bg-gradient-to-br ${activeMeta.accentBg} shadow-[0_0_24px_rgba(0,240,255,0.35)] shrink-0`}>
            <div className="bg-white rounded-xl p-2 w-44 h-44 flex items-center justify-center">
              {expired ? (
                <div className="text-center px-3">
                  <p className="font-display font-bold text-rose-600 text-base">QR Expired</p>
                  <button
                    type="button"
                    onClick={() => setSecondsLeft(60)}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                  >
                    Refresh QR
                  </button>
                </div>
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`${activeMeta.label} payment QR`}
                  className="w-40 h-40 object-contain"
                />
              ) : (
                <QrCode className="w-16 h-16 text-slate-300" />
              )}
            </div>
          </div>

          <div className="flex-1 w-full text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-cyan-200">
              <Clock className={`w-4 h-4 ${secondsLeft <= 10 ? 'text-rose-400' : 'text-cyan-300'}`} />
              <span>Expires in</span>
              <span className={`font-mono-tabular font-bold text-sm ${secondsLeft <= 10 ? 'text-rose-400' : 'text-white'}`}>
                00:{String(secondsLeft).padStart(2, '0')}
              </span>
            </div>

            <div className="mt-2">
              <p className="text-xs text-cyan-100/75">Total Amount</p>
              <p className="font-display text-3xl font-bold text-white tabular-nums drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]">
                {formatRM(total)}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-white/15 text-xs text-cyan-100/80 space-y-1">
              <p className="truncate">
                Merchant: <span className="font-mono-tabular font-semibold text-white">{gatewayInfo.merchantRef}</span>
              </p>
              <p>
                Gateway State:{' '}
                <span className={`font-semibold ${gatewayInfo.configured ? 'text-emerald-300' : 'text-cyan-300'}`}>
                  {gatewayInfo.configured ? 'Configured API Key Active' : 'Offline / Sandbox Ready'}
                </span>
              </p>
              <p className="text-[11px] text-cyan-200/70">
                {cart.reduce((s, c) => s + c.qty, 0)} item(s) · {cart.map((c) => `${c.slot.code}×${c.qty}`).join(', ')}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="sm:w-1/3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 py-3.5 px-4 text-sm font-bold text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={expired}
            onClick={() => onPaymentSuccess(selectedMethod)}
            className="sm:w-2/3 rounded-2xl cyber-btn-mint py-3.5 px-5 text-sm font-bold text-slate-950 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Simulate Payment Success</span>
          </button>
        </div>
      </div>
    </div>
  );
};
