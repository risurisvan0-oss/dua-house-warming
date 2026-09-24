import type { Language } from '../data/translations';
import type { JourneyState } from './journeyService';
import { generateGuestId } from '../utils/guestId';

export type RsvpStatus = 'yes' | 'maybe' | 'no';

export interface GuestbookEntry {
  name: string;
  message: string;
  submittedAt: string;
  /** Optional voice message, stored as a base64 data URL (no backend to upload to). */
  audioDataUrl?: string;
}

const KEYS = {
  guestId: 'dua:guestId',
  language: 'dua:language',
  rsvp: 'dua:rsvp',
  journeyState: 'dua:journeyState',
  journeyStartedAt: 'dua:journeyStartedAt',
  arrivedAt: 'dua:arrivedAt',
  departedAt: 'dua:departedAt',
  awayStreakStartedAt: 'dua:awayStreakStartedAt',
  guestbookEntry: 'dua:guestbookEntry',
  invitationOpenedAt: 'dua:invitationOpenedAt',
  hasSeenOpening: 'dua:hasSeenOpening',
  guestName: 'dua:guestName',
  guests: 'dua:guests',
  guestNote: 'dua:guestNote',
  dietaryNotes: 'dua:dietaryNotes',
} as const;

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently
  }
}

function removeRaw(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const storageService = {
  getGuestId(): string {
    let id = readRaw(KEYS.guestId);
    if (!id) {
      id = generateGuestId();
      writeRaw(KEYS.guestId, id);
    }
    return id;
  },

  getLanguage(): Language {
    const value = readRaw(KEYS.language);
    return value === 'ml' ? 'ml' : 'en';
  },
  setLanguage(lang: Language): void {
    writeRaw(KEYS.language, lang);
  },

  getRsvp(): RsvpStatus | null {
    const value = readRaw(KEYS.rsvp);
    return value === 'yes' || value === 'maybe' || value === 'no' ? value : null;
  },
  setRsvp(status: RsvpStatus): void {
    writeRaw(KEYS.rsvp, status);
  },

  getGuests(): number {
    const n = Number(readRaw(KEYS.guests));
    return Number.isInteger(n) && n >= 1 && n <= 8 ? n : 2;
  },
  setGuests(count: number): void {
    writeRaw(KEYS.guests, String(count));
  },

  getJourneyState(): JourneyState | null {
    return readRaw(KEYS.journeyState) as JourneyState | null;
  },
  setJourneyState(state: JourneyState): void {
    writeRaw(KEYS.journeyState, state);
  },

  getJourneyStartedAt(): number | null {
    const v = readRaw(KEYS.journeyStartedAt);
    return v ? Number(v) : null;
  },
  setJourneyStartedAt(timestamp: number): void {
    writeRaw(KEYS.journeyStartedAt, String(timestamp));
  },

  getArrivedAt(): number | null {
    const v = readRaw(KEYS.arrivedAt);
    return v ? Number(v) : null;
  },
  setArrivedAt(timestamp: number): void {
    writeRaw(KEYS.arrivedAt, String(timestamp));
  },

  getDepartedAt(): number | null {
    const v = readRaw(KEYS.departedAt);
    return v ? Number(v) : null;
  },
  setDepartedAt(timestamp: number): void {
    writeRaw(KEYS.departedAt, String(timestamp));
  },

  getAwayStreakStartedAt(): number | null {
    const v = readRaw(KEYS.awayStreakStartedAt);
    return v ? Number(v) : null;
  },
  setAwayStreakStartedAt(timestamp: number | null): void {
    if (timestamp === null) removeRaw(KEYS.awayStreakStartedAt);
    else writeRaw(KEYS.awayStreakStartedAt, String(timestamp));
  },

  resetJourney(): void {
    removeRaw(KEYS.journeyState);
    removeRaw(KEYS.journeyStartedAt);
    removeRaw(KEYS.arrivedAt);
    removeRaw(KEYS.departedAt);
    removeRaw(KEYS.awayStreakStartedAt);
  },

  getGuestbookEntry(): GuestbookEntry | null {
    const raw = readRaw(KEYS.guestbookEntry);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as GuestbookEntry;
    } catch {
      return null;
    }
  },
  setGuestbookEntry(entry: GuestbookEntry): void {
    writeRaw(KEYS.guestbookEntry, JSON.stringify(entry));
  },

  getInvitationOpenedAt(): number | null {
    const v = readRaw(KEYS.invitationOpenedAt);
    return v ? Number(v) : null;
  },
  markInvitationOpened(): void {
    if (!readRaw(KEYS.invitationOpenedAt)) {
      writeRaw(KEYS.invitationOpenedAt, String(Date.now()));
    }
  },

  hasSeenOpening(): boolean {
    return readRaw(KEYS.hasSeenOpening) === '1';
  },
  markOpeningSeen(): void {
    writeRaw(KEYS.hasSeenOpening, '1');
  },

  /** Set once from the `?to=<name>` link (see main.tsx) — lets the whole
   * invitation greet this guest by name. Null for a generic/unnamed link. */
  getGuestName(): string | null {
    return readRaw(KEYS.guestName);
  },
  setGuestName(name: string): void {
    writeRaw(KEYS.guestName, name);
  },

  /** Set once from a personalised `?note=<text>` link (see /admin's
   * Personalised Links tool) — a short host-written note just for this
   * guest, e.g. "Reserved seating for you". Null for a link with no note. */
  getGuestNote(): string | null {
    return readRaw(KEYS.guestNote);
  },
  setGuestNote(note: string): void {
    writeRaw(KEYS.guestNote, note);
  },

  getDietaryNotes(): string {
    return readRaw(KEYS.dietaryNotes) ?? '';
  },
  setDietaryNotes(notes: string): void {
    writeRaw(KEYS.dietaryNotes, notes);
  },

  /**
   * Wipes every guest-facing key (RSVP, journey progress, guestbook entry,
   * guest id — a brand new one is generated next) so the invitation opens
   * exactly as a fresh guest would see it. Deliberately leaves the chosen
   * language and any /admin Event Settings overrides untouched. Used by
   * the `?fresh=1` link — see main.tsx.
   */
  resetForFreshStart(): void {
    removeRaw(KEYS.guestId);
    removeRaw(KEYS.rsvp);
    removeRaw(KEYS.guests);
    removeRaw(KEYS.guestbookEntry);
    removeRaw(KEYS.invitationOpenedAt);
    removeRaw(KEYS.hasSeenOpening);
    removeRaw(KEYS.dietaryNotes);
    // Deliberately keeps guestNote — it came from the link itself (?note=),
    // so a fresh replay should still greet the guest with the same note.
    this.resetJourney();
  },
};
