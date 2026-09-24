import type { LatLng } from '../utils/distance';

export interface PrayerTimes {
  dhuhr: string;
  asr: string;
}

function stripTimezoneSuffix(time: string): string {
  // Aladhan returns times like "13:05 (IST)" — keep just "13:05".
  return time.replace(/\s*\(.*\)\s*$/, '').trim();
}

/**
 * Dhuhr/Asr prayer times at a location on a given date, from the free
 * Aladhan API (no key, no account) — unlike weather, prayer times are
 * astronomically calculable for any date, so this works even for an
 * event more than a year out. Uses calculation method 1 (University of
 * Islamic Sciences, Karachi), the common convention across South Asia.
 * Resolves null on any failure so callers can simply omit the card.
 */
export async function getPrayerTimes(location: LatLng, dateIso: string): Promise<PrayerTimes | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const [year, month, day] = dateIso.split('-');
    const ddmmyyyy = `${day}-${month}-${year}`;
    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      method: '1',
    });
    const response = await fetch(`https://api.aladhan.com/v1/timings/${ddmmyyyy}?${params}`, {
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const data = await response.json();
    const dhuhr = data?.data?.timings?.Dhuhr;
    const asr = data?.data?.timings?.Asr;
    if (typeof dhuhr !== 'string' || typeof asr !== 'string') return null;

    return { dhuhr: stripTimezoneSuffix(dhuhr), asr: stripTimezoneSuffix(asr) };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
