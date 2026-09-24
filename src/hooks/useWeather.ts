import { useEffect, useState } from 'react';
import { hasCoordinates, type EventConfig } from '../config/event';
import { getCurrentWeather, type WeatherSnapshot } from '../services/weatherService';

export function useWeather(eventConfig: EventConfig): WeatherSnapshot | null {
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);

  useEffect(() => {
    if (!hasCoordinates(eventConfig)) return;
    let cancelled = false;
    getCurrentWeather({ latitude: eventConfig.latitude, longitude: eventConfig.longitude }).then((result) => {
      if (!cancelled) setWeather(result);
    });
    return () => {
      cancelled = true;
    };
  }, [eventConfig.latitude, eventConfig.longitude]);

  return weather;
}
