import { useEffect, useState } from 'react';
import { fetchGuestCount, type GuestCountSnapshot } from '../services/guestCountService';

export function useGuestCount(): GuestCountSnapshot | null {
  const [snapshot, setSnapshot] = useState<GuestCountSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchGuestCount().then((result) => {
      if (!cancelled && result) setSnapshot(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return snapshot;
}
