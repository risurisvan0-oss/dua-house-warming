import type { ReactNode } from 'react';

// A solid, hairline-bordered "card stock" surface — deliberately not the
// frosted-glass/heavy-drop-shadow look of a typical mobile app, closer to
// fine printed stationery with a thin gold-tinted edge.
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-ivory border border-gold-deep/20 shadow-[0_1px_2px_rgba(122,62,26,0.08),0_8px_24px_-12px_rgba(122,62,26,0.22)] p-6 ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, tone = 'gold' }: { children: ReactNode; tone?: 'gold' | 'forest' }) {
  const toneClasses =
    tone === 'gold' ? 'bg-gold/15 text-gold-deep border-gold-deep/30' : 'bg-forest/10 text-forest border-forest/20';
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase ${toneClasses}`}>
      {children}
    </span>
  );
}
