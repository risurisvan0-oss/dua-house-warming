import type { LatLng } from '../utils/distance';

export interface WeatherSnapshot {
  temperatureCelsius: number;
  description: string;
  isRainy: boolean;
}

// WMO weather codes (used by Open-Meteo), collapsed to a short human label.
const WEATHER_CODE_LABELS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Heavy showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm',
  99: 'Thunderstorm',
};

function labelForCode(code: number): string {
  return WEATHER_CODE_LABELS[code] ?? 'Fair weather';
}

// Drizzle, rain, showers, and thunderstorm codes — anything worth an
// umbrella. Snow codes are excluded (irrelevant in Kerala).
const RAINY_CODES = new Set([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 97, 98, 99]);

function isRainyCode(code: number): boolean {
  return RAINY_CODES.has(code);
}

/**
 * Live conditions at DUA from Open-Meteo — free, no API key, no account.
 * Resolves null on any failure (offline, provider down, timeout) so the
 * caller can simply omit the weather line rather than show an error.
 */
export async function getCurrentWeather(location: LatLng): Promise<WeatherSnapshot | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      current: 'temperature_2m,weather_code',
      timezone: 'Asia/Kolkata',
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const data = await response.json();
    const temp = data?.current?.temperature_2m;
    const code = data?.current?.weather_code;
    if (typeof temp !== 'number' || typeof code !== 'number') return null;

    return { temperatureCelsius: Math.round(temp), description: labelForCode(code), isRainy: isRainyCode(code) };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * A same-day-conditions umbrella tip for the *current* weather at DUA
 * (see `getCurrentWeather` above) — useful once someone is actually
 * travelling or nearby. For the forecast on the event date itself, see
 * `getEventDayForecast` below; a real forecast only exists roughly 16
 * days out, so for an event further away than that, only this live
 * "right now" reading is available.
 */
export interface DayForecast {
  isRainy: boolean;
  maxTemperatureCelsius: number;
}

/**
 * The forecast for a specific date (YYYY-MM-DD), used for the event day
 * itself rather than "right now". Open-Meteo's forecast horizon is
 * roughly 16 days — for a date further out than that (true for most of
 * this event's lifetime, since DUA is set for October 2026), the API
 * simply won't have data yet and this resolves to null. Call it again
 * closer to the date.
 */
export async function getEventDayForecast(location: LatLng, dateIso: string): Promise<DayForecast | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      daily: 'weather_code,temperature_2m_max',
      timezone: 'Asia/Kolkata',
      start_date: dateIso,
      end_date: dateIso,
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const data = await response.json();
    const code = data?.daily?.weather_code?.[0];
    const maxTemp = data?.daily?.temperature_2m_max?.[0];
    if (typeof code !== 'number' || typeof maxTemp !== 'number') return null;

    return { isRainy: isRainyCode(code), maxTemperatureCelsius: Math.round(maxTemp) };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
