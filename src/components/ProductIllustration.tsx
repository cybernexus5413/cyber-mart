import React, { useState } from 'react';
import { ProductIconKey } from '../types/vending';

interface ProductIllustrationProps {
  iconKey: ProductIconKey;
  color: string;
  name: string;
  customImageUrl?: string;
  className?: string;
}

export const ProductIllustration: React.FC<ProductIllustrationProps> = ({
  iconKey,
  color,
  name,
  customImageUrl,
  className = 'w-14 h-14',
}) => {
  const [imgError, setImgError] = useState(false);

  if (customImageUrl && !imgError) {
    return (
      <img
        src={customImageUrl}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${className} rounded-xl object-cover drop-shadow-[0_4px_8px_rgba(15,23,42,0.22)] border border-white/80`}
      />
    );
  }

  const uid = `${iconKey}-${color.replace('#', '')}`;

  const renderShape = () => {
    switch (iconKey) {
      case 'milo':
      case 'oatmilk':
        return (
          <g>
            <path d="M22 18 L54 18 L60 28 L16 28 Z" fill={color} opacity="0.85" />
            <rect x="16" y="28" width="44" height="50" rx="8" fill={color} />
            <rect x="16" y="28" width="16" height="50" rx="6" fill="#FFFFFF" opacity="0.18" />
            <rect x="23" y="40" width="30" height="22" rx="6" fill="#FFFBEB" />
            <circle cx="38" cy="51" r="7" fill={color} opacity="0.9" />
            <path d="M48 18 L48 9 L58 6" stroke="#FF3CAC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <ellipse cx="38" cy="31" rx="14" ry="2.5" fill="#FFFFFF" opacity="0.35" />
          </g>
        );

      case 'cola':
      case 'coffee':
      case 'soda_lemon':
        return (
          <g>
            <rect x="20" y="18" width="36" height="58" rx="10" fill={color} />
            <rect x="20" y="18" width="12" height="58" rx="8" fill="#FFFFFF" opacity="0.22" />
            <ellipse cx="38" cy="20" rx="16" ry="4" fill="#E2E8F0" />
            <ellipse cx="38" cy="19.5" rx="12" ry="2.2" fill="#94A3B8" />
            <path d="M20 38 Q38 45 56 38 L56 54 Q38 61 20 54 Z" fill="#FFFFFF" opacity="0.92" />
            <circle cx="38" cy="46" r="6" fill={color} />
            <circle cx="29" cy="29" r="1.8" fill="#FFFFFF" opacity="0.7" />
            <circle cx="48" cy="64" r="1.5" fill="#FFFFFF" opacity="0.65" />
          </g>
        );

      case 'water':
      case 'greentea':
      case 'juice_orange':
        return (
          <g>
            <rect x="31" y="10" width="14" height="8" rx="3" fill={color} />
            <path d="M30 18 L46 18 L52 32 L52 72 C52 76 48 78 38 78 C28 78 24 76 24 72 L24 32 Z" fill={color} opacity="0.88" />
            <path d="M25 32 L33 32 L33 74 C27 74 25 72 25 70 Z" fill="#FFFFFF" opacity="0.26" />
            <rect x="24" y="41" width="28" height="19" rx="3" fill="#FFFFFF" opacity="0.94" />
            <rect x="28" y="46" width="20" height="4" rx="2" fill={color} />
            <rect x="31" y="52" width="14" height="3" rx="1.5" fill={color} opacity="0.55" />
          </g>
        );

      case 'chips_bbq':
      case 'chips_cheese':
      case 'chips_sour':
        return (
          <g>
            <path d="M18 16 L58 16 L55 23 L21 23 Z" fill={color} />
            <path d="M18 76 L58 76 L55 69 L21 69 Z" fill={color} />
            <rect x="17" y="21" width="42" height="50" rx="10" fill={color} />
            <path d="M20 24 C28 24 28 68 20 68 Z" fill="#FFFFFF" opacity="0.22" />
            <circle cx="38" cy="46" r="14" fill="#FEF3C7" />
            <ellipse cx="38" cy="46" rx="9" ry="6" transform="rotate(-18 38 46)" fill="#FBBF24" />
            <path d="M32 45 Q38 41 44 47" stroke="#D97706" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'noodle_curry':
      case 'noodle_tomyam':
        return (
          <g>
            <ellipse cx="38" cy="23" rx="24" ry="6" fill="#FEF3C7" stroke={color} strokeWidth="2.5" />
            <path d="M15 24 L21 72 C21 76 55 76 55 72 L61 24 Z" fill={color} />
            <path d="M18 28 L23 70 L30 71 L26 28 Z" fill="#FFFFFF" opacity="0.2" />
            <rect x="23" y="38" width="30" height="18" rx="6" fill="#FFFFFF" opacity="0.94" />
            <path d="M28 45 Q33 41 38 45 T48 45" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M29 50 Q34 46 39 50 T47 50" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M31 15 Q33 10 31 7 M39 14 Q41 9 39 6 M46 15 Q48 10 46 7" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
          </g>
        );

      case 'pocky':
        return (
          <g>
            <rect x="22" y="14" width="32" height="64" rx="6" fill={color} />
            <rect x="22" y="14" width="10" height="64" rx="5" fill="#FFFFFF" opacity="0.2" />
            <rect x="26" y="24" width="24" height="34" rx="4" fill="#FFFBEB" />
            <line x1="32" y1="54" x2="35" y2="28" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="39" y1="54" x2="43" y2="27" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="33.5" y1="40" x2="35" y2="28" stroke="#FDE68A" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );

      case 'chocolate':
      case 'wafer':
        return (
          <g>
            <rect x="14" y="26" width="48" height="40" rx="8" fill={color} transform="rotate(-8 38 46)" />
            <rect x="18" y="31" width="40" height="30" rx="5" fill="#FFFFFF" opacity="0.16" transform="rotate(-8 38 46)" />
            <rect x="22" y="34" width="32" height="24" rx="4" fill="#FFF7ED" transform="rotate(-8 38 46)" />
            <rect x="26" y="39" width="11" height="14" rx="2" fill="#78350F" transform="rotate(-8 38 46)" />
            <rect x="39" y="39" width="11" height="14" rx="2" fill="#92400E" transform="rotate(-8 38 46)" />
          </g>
        );

      default:
        return (
          <g>
            <rect x="17" y="19" width="42" height="54" rx="11" fill={color} />
            <rect x="17" y="19" width="14" height="54" rx="8" fill="#FFFFFF" opacity="0.22" />
            <circle cx="38" cy="46" r="13" fill="#FFFBEB" />
            <circle cx="34" cy="43" r="4" fill={color} />
            <circle cx="43" cy="48" r="4.5" fill="#F59E0B" />
            <circle cx="35" cy="52" r="3" fill="#EC4899" />
          </g>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 76 88"
      className={`${className} select-none`}
      aria-hidden="true"
      id={uid}
    >
      <ellipse cx="38" cy="80" rx="22" ry="4.5" fill="#64748B" opacity="0.25" />
      {renderShape()}
    </svg>
  );
};
