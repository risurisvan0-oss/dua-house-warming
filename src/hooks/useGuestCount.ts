import { useEffect, useState } from 'react';
import { fetchGuestCount, type GuestCountSnapshot } from '../services/guestCountService';

/**
 * `pollMs` is only passed by long-lived, continuously-displayed screens
 * (currently just the [Event Display Mode](#event-display-mode-wall)
 * `/wall` page) that actually need to notice new arrivals/messages while
 * mounted. Every other caller omits it and gets a single fetch on mount,
 * exactly as before.
 */
export function useGuestCount(pollMs?: number): GuestCountSnapshot | null {
  const [snapshot, setSnapshot] = useState<GuestCountSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetchGuestCount().then((result) => {
        if (!cancelled && result) setSnapshot(result);
      });
    };
    load();
    if (!pollMs) return () => {
      cancelled = true;
    };
    const id = setInterval(load, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pollMs]);

  return snapshot;
}
