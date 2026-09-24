import { useEffect, useRef, useState } from 'react';

/**
 * Smoothly tweens a number toward `target` instead of jumping — used so
 * the live distance readout counts down as the guest travels, rather than
 * snapping between GPS updates.
 */
export function useAnimatedNumber(target: number | null, duration = 700): number | null {
  const [value, setValue] = useState<number | null>(target);
  const fromRef = useRef<number | null>(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target == null) {
      setValue(null);
      fromRef.current = null;
      return;
    }
    const from = fromRef.current ?? target;
    const start = performance.now();
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) * (1 - t);
      setValue(from + (target - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}
