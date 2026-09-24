import { useCallback, useEffect, useState } from 'react';
import { storageService } from '../services/storageService';

const LARGE_TEXT_ROOT_SIZE = '118%';

/**
 * A simple accessibility toggle for older relatives who may find the
 * default type small. Scales the document root font-size, which — since
 * every Tailwind size in this app is the default rem-based scale — grows
 * every text size, spacing-that's-in-rem, and icon proportionally with
 * no per-component changes needed. Persists per device.
 */
export function useTextScale() {
  const [large, setLarge] = useState(() => storageService.getLargeText());

  useEffect(() => {
    document.documentElement.style.fontSize = large ? LARGE_TEXT_ROOT_SIZE : '';
  }, [large]);

  const toggle = useCallback(() => {
    setLarge((prev) => {
      const next = !prev;
      storageService.setLargeText(next);
      return next;
    });
  }, []);

  return { large, toggle };
}
