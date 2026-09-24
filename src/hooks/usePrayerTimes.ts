import { useEffect, useState } from 'react';
import { hasCoordinates, type EventConfig } from '../config/event';
import { getPrayerTimes, type PrayerTimes } from '../services/prayerTimesService';

export function usePrayerTimes(eventConfig: EventConfig): PrayerTimes | null {
  const [times, setTimes] = useState<PrayerTimes | null>(null);

  useEffect(() => {
    if (!hasCoordinates(eventConfig)) return;
    let cancelled = false;
    getPrayerTimes({ latitude: eventConfig.latitude, longitude: eventConfig.longitude }, eventConfig.eventDate).then(
      (result) => {
        if (!cancelled) setTimes(result);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [eventConfig.latitude, eventConfig.longitude, eventConfig.eventDate]);

  return times;
}
