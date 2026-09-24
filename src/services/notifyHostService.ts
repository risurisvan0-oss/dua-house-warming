import { getEffectiveEventConfig } from './adminConfigService';
import type { RsvpStatus } from './storageService';

export interface HostNotification {
  type: 'rsvp' | 'guestbook' | 'arrival';
  guestId: string;
  guestName: string;
  rsvpStatus?: RsvpStatus;
  guests?: number;
  dietaryNotes?: string;
  guestNames?: string;
  message?: string;
  hasVoiceMessage?: boolean;
  timestamp: string; // ISO 8601
}

/**
 * Best-effort, fire-and-forget ping to a host-configured Google Apps
 * Script Web App (see `hostNotifyWebhookUrl` in `config/event.ts` and
 * "Seeing RSVPs as a host" in the README) that appends a row to a Google
 * Sheet. This is the one way hosts can see RSVPs/guestbook messages
 * without running a real backend.
 *
 * - No-op if no webhook URL is configured (the default) — nothing is
 *   sent anywhere unless a host explicitly opts in.
 * - Uses `mode: 'no-cors'` because Apps Script Web Apps don't return
 *   browser-readable CORS headers for POST; we never need to read the
 *   response, only fire the request.
 * - Never throws and never blocks the guest's RSVP/guestbook flow — an
 *   unreachable or misconfigured webhook silently does nothing.
 */
export async function notifyHost(payload: Omit<HostNotification, 'timestamp'>): Promise<void> {
  const url = getEffectiveEventConfig().hostNotifyWebhookUrl;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() } satisfies HostNotification),
    });
  } catch {
    // Offline, blocked by the browser, or the webhook is down — the guest
    // never sees this, and their RSVP/message is still saved locally.
  }
}
