import React from 'react';

export const CyberRobotMascot: React.FC<{ className?: string }> = ({
  className = 'w-20 h-20 sm:w-28 sm:h-28',
}) => (
  <svg
    viewBox="0 0 140 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="robotGlowBg" cx="50%" cy="45%" r="52%">
        <stop offset="0%" stopColor="#1B3A99" />
        <stop offset="65%" stopColor="#0C1754" />
        <stop offset="100%" stopColor="#060B2B" />
      </radialGradient>
      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00F5FF" />
        <stop offset="52%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#FF20B8" />
      </linearGradient>
      <linearGradient id="shellWhite" x1="25%" y1="10%" x2="80%" y2="95%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="50%" stopColor="#DCE8FF" />
        <stop offset="100%" stopColor="#8DA8E0" />
      </linearGradient>
      <linearGradient id="visorDark" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#081236" />
        <stop offset="100%" stopColor="#030719" />
      </linearGradient>
      <linearGradient id="cyanNeon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#80FFFF" />
        <stop offset="100%" stopColor="#00C8FF" />
      </linearGradient>
      <filter id="cyanSoftGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Outer neon portal ring */}
    <circle cx="70" cy="70" r="64" fill="url(#robotGlowBg)" />
    <circle cx="70" cy="70" r="63" stroke="url(#ringGrad)" strokeWidth="4.5" />
    <circle
      cx="70"
      cy="70"
      r="56"
      stroke="#00E5FF"
      strokeOpacity="0.4"
      strokeWidth="1.5"
      strokeDasharray="6 4"
    />

    {/* Antennae */}
    <rect x="68" y="14" width="4" height="12" rx="2" fill="#9BB5EC" />
    <circle cx="70" cy="13" r="5" fill="url(#cyanNeon)" filter="url(#cyanSoftGlow)" />

    {/* Robot Torso */}
    <path
      d="M44 92 C44 82 54 78 70 78 C86 78 96 82 96 92 L92 122 C90 128 82 130 70 130 C58 130 50 128 48 122 Z"
      fill="url(#shellWhite)"
    />
    {/* Chest core */}
    <circle cx="70" cy="100" r="10" fill="#0B194C" stroke="#00E5FF" strokeWidth="2" />
    <circle cx="70" cy="100" r="5.5" fill="url(#cyanNeon)" filter="url(#cyanSoftGlow)" />

    {/* Left Ear Cup */}
    <rect x="27" y="45" width="11" height="24" rx="5.5" fill="#2563EB" stroke="#67F5FF" strokeWidth="1.5" />
    {/* Right Ear Cup */}
    <rect x="102" y="45" width="11" height="24" rx="5.5" fill="#2563EB" stroke="#67F5FF" strokeWidth="1.5" />

    {/* Robot Head */}
    <rect x="35" y="25" width="70" height="54" rx="24" fill="url(#shellWhite)" />
    {/* Gloss highlight on forehead */}
    <ellipse cx="58" cy="33" rx="16" ry="4" fill="#FFFFFF" fillOpacity="0.85" />

    {/* Visor Screen */}
    <rect x="42" y="37" width="56" height="34" rx="14" fill="url(#visorDark)" stroke="#38BDF8" strokeWidth="1.5" />

    {/* Glowing Cyan Eyes */}
    <ellipse cx="57" cy="51" rx="6" ry="7.5" fill="url(#cyanNeon)" filter="url(#cyanSoftGlow)" />
    <circle cx="55.5" cy="48.5" r="2" fill="#FFFFFF" />
    <ellipse cx="83" cy="51" rx="6" ry="7.5" fill="url(#cyanNeon)" filter="url(#cyanSoftGlow)" />
    <circle cx="81.5" cy="48.5" r="2" fill="#FFFFFF" />

    {/* Happy Cyan Smile */}
    <path
      d="M62 61 Q70 66 78 61"
      stroke="#00F0FF"
      strokeWidth="2.8"
      strokeLinecap="round"
      filter="url(#cyanSoftGlow)"
    />

    {/* Thumbs-up Left Arm */}
    <path
      d="M42 93 C30 96 24 89 24 80"
      stroke="url(#shellWhite)"
      strokeWidth="12"
      strokeLinecap="round"
    />
    {/* Thumbs-up Hand */}
    <circle cx="24" cy="78" r="9.5" fill="url(#shellWhite)" />
    <rect x="21" y="62" width="6.5" height="14" rx="3.2" fill="#FFFFFF" stroke="#8DA8E0" strokeWidth="1" />
    {/* Right Arm resting */}
    <path
      d="M98 93 C109 98 112 108 106 116"
      stroke="url(#shellWhite)"
      strokeWidth="11"
      strokeLinecap="round"
    />
  </svg>
);

export const CyberGiftBox: React.FC<{ className?: string }> = ({
  className = 'w-14 h-14 sm:w-16 sm:h-16',
}) => (
  <svg
    viewBox="0 0 96 96"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="boxFront" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF7ED" />
        <stop offset="100%" stopColor="#FDE68A" />
      </linearGradient>
      <linearGradient id="boxSide" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FCD34D" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="ribbonRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF3B6B" />
        <stop offset="100%" stopColor="#BE123C" />
      </linearGradient>
    </defs>

    {/* Warm Burst Behind Box */}
    <circle cx="48" cy="54" r="34" fill="#F59E0B" fillOpacity="0.28" />

    {/* Gift Box Body Left Face */}
    <polygon points="16,42 50,52 50,86 16,74" fill="url(#boxFront)" />
    {/* Gift Box Body Right Face */}
    <polygon points="50,52 80,42 80,74 50,86" fill="url(#boxSide)" />

    {/* Vertical Ribbons */}
    <polygon points="29,46 37,48.5 37,81.5 29,78.5" fill="url(#ribbonRed)" />
    <polygon points="61,48.5 69,46 69,78 61,81" fill="#9F1239" />

    {/* Gift Box Lid */}
    <polygon points="12,35 48,46 84,35 48,25" fill="#FFFBEB" />
    <polygon points="12,35 48,46 48,55 12,44" fill="#FDE68A" />
    <polygon points="48,46 84,35 84,44 48,55" fill="#F59E0B" />

    {/* Lid Ribbon */}
    <polygon points="27,30.5 36,33 65,41 56,43.5" fill="url(#ribbonRed)" />
    <polygon points="29,39.5 37,42 37,51.5 29,49" fill="url(#ribbonRed)" />
    <polygon points="60,42 68,39.5 68,49 60,51.5" fill="#9F1239" />

    {/* 3D Bow Loops */}
    <path
      d="M48 33 C36 16 20 23 30 33 C36 37 44 35 48 33 Z"
      fill="url(#ribbonRed)"
    />
    <path
      d="M48 33 C60 16 76 23 66 33 C60 37 52 35 48 33 Z"
      fill="#E11D48"
    />
    <circle cx="48" cy="33" r="5" fill="#FF4D79" stroke="#881337" strokeWidth="1.5" />
  </svg>
);

export const CyberCitySkyline: React.FC = () => (
  <svg
    viewBox="0 0 1200 110"
    preserveAspectRatio="none"
    className="pointer-events-none fixed bottom-0 left-0 right-0 w-full h-16 sm:h-24 opacity-45 z-0"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="skylineFill" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0F2A7A" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#03071A" stopOpacity="0.95" />
      </linearGradient>
    </defs>
    <path
      d="M0 110 L0 65 L35 65 L35 38 L70 38 L70 58 L105 58 L105 22 L145 22 L145 72 L190 72 L190 45 L240 45 L240 78 L310 78 L310 34 L350 34 L350 68 L430 68 L430 50 L490 50 L490 82 L650 82 L650 48 L705 48 L705 70 L785 70 L785 30 L835 30 L835 66 L910 66 L910 42 L955 42 L955 75 L1035 75 L1035 24 L1080 24 L1080 58 L1135 58 L1135 40 L1175 40 L1175 68 L1200 68 L1200 110 Z"
      fill="url(#skylineFill)"
      stroke="#00E5FF"
      strokeOpacity="0.35"
      strokeWidth="1.5"
    />
  </svg>
);
