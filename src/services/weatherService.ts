import type { LatLng } from '../utils/distance';

export interface WeatherSnapshot {
  temperatureCelsius: number;
  description: string;
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

    return { temperatureCelsius: Math.round(temp), description: labelForCode(code) };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
