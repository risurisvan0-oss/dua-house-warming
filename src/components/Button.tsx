import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
}

// A thin inset gold hairline instead of a soft drop shadow — reads like a
// foil-edged invitation card rather than a mobile-app button.
const variantClasses: Record<Variant, string> = {
  primary:
    'bg-forest text-ivory shadow-[inset_0_0_0_1px_rgba(201,162,75,0.5)] hover:bg-emerald',
  secondary: 'bg-gold text-forest shadow-[inset_0_0_0_1px_rgba(59,36,22,0.25)] hover:brightness-105',
  ghost: 'bg-transparent text-forest hover:bg-forest/5',
  outline: 'bg-transparent text-forest border border-gold-deep/40 hover:bg-forest/5',
};

export function Button({ variant = 'primary', fullWidth, className = '', children, ...rest }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold tracking-[0.02em] transition-colors min-h-[48px] ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
}
