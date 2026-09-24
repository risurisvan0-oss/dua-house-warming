import { getEffectiveEventConfig } from '../services/adminConfigService';

const TIME_ZONE = 'Asia/Kolkata';

export function eventStartDateTime(): Date {
  const cfg = getEffectiveEventConfig();
  return new Date(`${cfg.eventDate}T${cfg.startTime}:00+05:30`);
}

export function eventEndDateTime(): Date {
  const cfg = getEffectiveEventConfig();
  return new Date(`${cfg.eventDate}T${cfg.endTime}:00+05:30`);
}

export type EventPhase = 'before' | 'live' | 'after';

/** Where "now" sits relative to the event, using Asia/Kolkata as the reference clock. */
export function getEventPhase(now: Date = new Date()): EventPhase {
  const start = eventStartDateTime();
  const end = eventEndDateTime();
  if (now < start) return 'before';
  if (now > end) return 'after';
  return 'live';
}

export function formatEventDate(): string {
  return eventStartDateTime().toLocaleDateString('en-IN', {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatEventTimeRange(): string {
  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-IN', { timeZone: TIME_ZONE, hour: 'numeric', minute: '2-digit' });
  return `${fmt(eventStartDateTime())} – ${fmt(eventEndDateTime())}`;
}

/**
 * The Hijri equivalent of the event date, e.g. "6 Rabiʻ al-Thani 1448 AH".
 * Uses the browser's built-in Islamic calendar formatter — no library, no
 * network call. Returns null if the runtime doesn't support it (very rare).
 */
export function formatHijriEventDate(): string | null {
  try {
    const formatted = new Intl.DateTimeFormat('en-TN-u-ca-islamic-umalqura', {
      timeZone: TIME_ZONE,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(eventStartDateTime());
    // Some browsers/locales already append an "AH" era marker, others don't.
    return /\bAH\b/i.test(formatted) ? formatted : `${formatted} AH`;
  } catch {
    return null;
  }
}

/** Google Calendar "quick add" link — free, requires no API key or account setup by us. */
export function calendarLink(): string {
  const cfg = getEffectiveEventConfig();
  const toUtcStamp = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const start = toUtcStamp(eventStartDateTime());
  const end = toUtcStamp(eventEndDateTime());
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${cfg.houseName} — House Warming Ceremony`,
    dates: `${start}/${end}`,
    details: `You're invited to ${cfg.hostNames}'s house warming ceremony.`,
    location: cfg.address,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
