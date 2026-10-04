import { useMemo } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#b88a3e', '#a4502a', '#5a3a22', '#e8c77a', '#7d8b68'];
const PIECE_COUNT = 26;

interface Piece {
  x: number;
  y: number;
  color: string;
  width: number;
  height: number;
  rotate: number;
  duration: number;
}

function generatePieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => {
    const angle = (i / PIECE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    const distance = 110 + Math.random() * 170;
    const x = Math.cos(angle) * distance;
    const fallExtra = 180 + Math.random() * 140;
    const y = Math.sin(angle) * distance * 0.5 + fallExtra;
    const width = 6 + Math.random() * 5;
    return {
      x,
      y,
      color: COLORS[i % COLORS.length],
      width,
      height: width * (1.4 + Math.random() * 0.6),
      rotate: (Math.random() - 0.5) * 540,
      duration: 1.3 + Math.random() * 0.5,
    };
  });
}

/**
 * A one-shot celebratory confetti burst — rendered only when `burstKey`
 * is truthy, with `key={burstKey}` on the mount point so each new trigger
 * (e.g. re-tapping "Yes" after changing the answer) gets a fresh burst
 * rather than reusing a stale, already-settled one. Piece trajectories are
 * randomized once per burst via useMemo (not inline during render) so an
 * unrelated re-render mid-animation can't reshuffle particles already in
 * flight. Hand-rolled with Framer Motion rather than a new dependency,
 * matching the rest of the app's particle effects (see ArrivalReveal's
 * lantern embers).
 */
export function ConfettiBurst({ burstKey }: { burstKey: number }) {
  const pieces = useMemo(() => (burstKey ? generatePieces() : []), [burstKey]);

  if (!burstKey) return null;

  return (
    <div key={burstKey} className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-[30%] rounded-[1px]"
          style={{ width: p.width, height: p.height, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.5 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 1 }}
          transition={{ duration: p.duration, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
