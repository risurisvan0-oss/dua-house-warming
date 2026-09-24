import { eventConfig, type EventConfig } from '../config/event';

const STORAGE_KEY = 'dua:adminConfigOverrides';

export type EventConfigOverrides = Partial<EventConfig>;

function readOverrides(): EventConfigOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as EventConfigOverrides) : {};
  } catch {
    return {};
  }
}

/**
 * The base event.ts values, with any local /admin Event Settings edits
 * layered on top. Overrides live only in this browser's localStorage —
 * the deployed build for every other guest still uses event.ts as-is.
 */
export function getEffectiveEventConfig(): EventConfig {
  return { ...eventConfig, ...readOverrides() };
}

export function getConfigOverrides(): EventConfigOverrides {
  return readOverrides();
}

export function setEventConfigOverrides(overrides: EventConfigOverrides): void {
  try {
    const merged = { ...readOverrides(), ...overrides };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event('dua:config-updated'));
  } catch {
    // localStorage unavailable — overrides simply won't persist
  }
}

export function clearEventConfigOverrides(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('dua:config-updated'));
  } catch {
    // ignore
  }
}
