import { getEffectiveEventConfig } from './adminConfigService';

export interface GuestCountSnapshot {
  /** Total headcount across every "yes" RSVP (sum of party sizes). */
  confirmedGuests: number;
  /**
   * An optional host-written last-minute update (e.g. "Starting 30
   * minutes late"), read from the same Sheet — see "Live announcement
   * banner" in the README. Undefined/empty when there's nothing to show.
   */
  announcement?: string;
  /**
   * Names of the most recent arrivals, most recent first — powers the
   * [Event Display Mode](#event-display-mode-wall) celebration toasts.
   * Undefined/empty when the script doesn't provide it.
   */
  recentArrivals?: string[];
  /**
   * The most recently consented-to-display guestbook messages, most
   * recent first — also for Event Display Mode's blessings wall. A
   * guest's message only appears here if they explicitly opted in when
   * writing it (see the Guestbook form).
   */
  wallMessages?: { name: string; message: string }[];
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
    const announcement = (data as { announcement?: unknown })?.announcement;
    const rawArrivals = (data as { recentArrivals?: unknown })?.recentArrivals;
    const recentArrivals = Array.isArray(rawArrivals) ? rawArrivals.filter((n): n is string => typeof n === 'string') : undefined;
    const rawWall = (data as { wallMessages?: unknown })?.wallMessages;
    const wallMessages = Array.isArray(rawWall)
      ? rawWall.filter(
          (m): m is { name: string; message: string } =>
            !!m && typeof m === 'object' && typeof (m as { name?: unknown }).name === 'string' && typeof (m as { message?: unknown }).message === 'string',
        )
      : undefined;
    return {
      confirmedGuests,
      announcement: typeof announcement === 'string' && announcement.trim() ? announcement.trim() : undefined,
      recentArrivals,
      wallMessages,
    };
  } catch {
    return null;
  }
}
