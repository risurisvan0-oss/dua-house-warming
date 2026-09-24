import { useEffect, useState } from 'react';
import { hasCoordinates, type EventConfig } from '../config/event';
import { getEventDayForecast, type DayForecast } from '../services/weatherService';

const FORECAST_HORIZON_DAYS = 16; // Open-Meteo's approximate forecast range

function daysUntil(dateIso: string): number {
  const today = new Date(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
  const target = new Date(dateIso);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/**
 * The forecast for the event date itself — only fetched once the date is
 * close enough for a real forecast to exist (see weatherService.ts).
 * Null for the ~99% of this event's lifetime that's further out than
 * that; callers should simply omit any forecast-based copy in that case.
 */
export function useEventDayForecast(eventConfig: EventConfig): DayForecast | null {
  const [forecast, setForecast] = useState<DayForecast | null>(null);

  useEffect(() => {
    if (!hasCoordinates(eventConfig)) return;
    const days = daysUntil(eventConfig.eventDate);
    if (days < 0 || days > FORECAST_HORIZON_DAYS) return;
    let cancelled = false;
    getEventDayForecast({ latitude: eventConfig.latitude, longitude: eventConfig.longitude }, eventConfig.eventDate).then(
      (result) => {
        if (!cancelled) setForecast(result);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [eventConfig.latitude, eventConfig.longitude, eventConfig.eventDate]);

  return forecast;
}
