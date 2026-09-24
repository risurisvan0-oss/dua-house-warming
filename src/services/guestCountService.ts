import { getEffectiveEventConfig } from './adminConfigService';

export interface GuestCountSnapshot {
  /** Total headcount across every "yes" RSVP (sum of party sizes). */
  confirmedGuests: number;
}

/**
 * Reads a live confirmed-guest count back from the same Google Apps
 * Script Web App used by `notifyHostService` (see README → "Seeing RSVPs
 * as a host"), via its `doGet` handler. Purely additive social proof —
 * returns null (never throws) if no webhook is configured, the script
 * doesn't implement `doGet`, or the request fails for any reason.
 * Callers should simply hide the count when this returns null.
 *
 * Unlike the RSVP/guestbook POST (which uses `no-cors` to dodge preflight
 * issues), this is a plain unauthenticated GET with no custom headers —
 * a "simple request" that Apps Script Web Apps serve with normal
 * browser-readable CORS headers, so the JSON response can be read back.
 */
export async function fetchGuestCount(): Promise<GuestCountSnapshot | null> {
  const url = getEffectiveEventConfig().hostNotifyWebhookUrl;
  if (!url) return null;
  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const confirmedGuests = (data as { confirmedGuests?: unknown })?.confirmedGuests;
    if (typeof confirmedGuests !== 'number' || !Number.isFinite(confirmedGuests)) return null;
    return { confirmedGuests };
  } catch {
    return null;
  }
}
