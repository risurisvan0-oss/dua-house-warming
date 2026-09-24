import { motion } from 'framer-motion';

const CLAY = '#5a3a22';
const TERRACOTTA = '#a4502a';
const TEAL = '#3b2416';
const GOLD = '#b88a3e';
const PLASTER = '#fffaf0';
const PALM = '#7d8b68';

export function HomeIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 240"
      className={className}
      role="img"
      aria-label="A traditional Kerala home with a tiled roof, arched teak door, hanging lanterns and palm trees"
    >
      <defs>
        <linearGradient id="skyFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbf1e2" />
          <stop offset="100%" stopColor="#f6e4c8" />
        </linearGradient>
        <linearGradient id="roofFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={TERRACOTTA} />
          <stop offset="100%" stopColor="#8f4520" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="320" height="240" fill="url(#skyFade)" />

      {/* ground */}
      <path d="M0 210 Q80 194 160 208 T320 205 V240 H0 Z" fill={PALM} opacity="0.16" />
      <path d="M0 222 Q100 208 220 221 T320 217 V240 H0 Z" fill={CLAY} opacity="0.14" />
      <ellipse cx="160" cy="213" rx="102" ry="7" fill={CLAY} opacity="0.12" />

      {/* house body */}
      <rect x="66" y="112" width="188" height="98" fill={PLASTER} stroke={CLAY} strokeOpacity="0.55" strokeWidth="1.3" />
      {/* plinth */}
      <rect x="62" y="202" width="196" height="8" fill={CLAY} opacity="0.18" />

      {/* sloped tile roof with a lower eave, drawn as layered courses */}
      <path d="M48 116 L160 50 L272 116 L160 100 Z" fill="url(#roofFade)" />
      <path d="M48 116 L160 50 L272 116" fill="none" stroke={CLAY} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M62 108 Q160 92 258 108" fill="none" stroke={CLAY} strokeOpacity="0.3" strokeWidth="1" />
      <path d="M78 99 Q160 84 242 99" fill="none" stroke={CLAY} strokeOpacity="0.25" strokeWidth="1" />

      {/* finial lantern at the roof peak */}
      <line x1="160" y1="50" x2="160" y2="34" stroke={GOLD} strokeWidth="1.6" />
      <path d="M152 34 h16 l-3 13 h-10 z" fill={GOLD} />
      <motion.circle
        cx="160"
        cy="41"
        r="11"
        fill={GOLD}
        animate={{ opacity: [0.1, 0.32, 0.1], scale: [1, 1.2, 1] }}
        style={{ transformOrigin: '160px 41px' }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* arched teak door */}
      <path d="M138 210 V160 a22 22 0 0 1 44 0 V210 Z" fill={TEAL} stroke={GOLD} strokeWidth="2" />
      <line x1="160" y1="138" x2="160" y2="210" stroke={GOLD} strokeOpacity="0.5" strokeWidth="1" />
      <circle cx="154" cy="182" r="1.8" fill={GOLD} />
      <circle cx="166" cy="182" r="1.8" fill={GOLD} />

      {/* windows with a lattice (jali) pattern */}
      {[92, 202].map((x) => (
        <g key={x}>
          <rect x={x} y="134" width="26" height="30" fill="#e4f0ee" stroke={TEAL} strokeWidth="1.4" />
          <path
            d={`M${x} 149 H${x + 26} M${x + 13} 134 V164 M${x} 134 L${x + 26} 164 M${x + 26} 134 L${x} 164`}
            stroke={TEAL}
            strokeWidth="0.9"
            opacity="0.55"
          />
        </g>
      ))}

      {/* hanging lanterns either side of the entrance */}
      {[112, 208].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="112" x2={x} y2="124" stroke={GOLD} strokeWidth="1.4" />
          <motion.circle
            cx={x}
            cy="130"
            r="6"
            fill={GOLD}
            animate={{ opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
          />
          <motion.circle
            cx={x}
            cy="130"
            r="12"
            fill={GOLD}
            animate={{ opacity: [0.12, 0.3, 0.12], scale: [1, 1.15, 1] }}
            style={{ transformOrigin: `${x}px 130px` }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
          />
        </g>
      ))}

      {/* palms — a barely-there sway, like a light breeze */}
      <motion.g
        style={{ transformOrigin: '30px 212px' }}
        animate={{ rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M30 212 C30 172 20 152 2 140 C18 144 32 160 36 180 Z" fill={PALM} opacity="0.9" />
        <path d="M30 212 C30 172 45 150 66 140 C52 148 40 166 38 184 Z" fill={PALM} opacity="0.9" />
        <line x1="30" y1="212" x2="30" y2="152" stroke={CLAY} strokeWidth="3" />
      </motion.g>
      <motion.g
        style={{ transformOrigin: '292px 212px' }}
        animate={{ rotate: [1.5, -1.5, 1.5] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M292 212 C292 177 284 160 270 150 C283 153 295 167 298 184 Z" fill={PALM} opacity="0.9" />
        <path d="M292 212 C292 177 304 158 320 150 C308 156 298 172 296 188 Z" fill={PALM} opacity="0.9" />
        <line x1="292" y1="212" x2="292" y2="157" stroke={CLAY} strokeWidth="3" />
      </motion.g>
    </svg>
  );
}
