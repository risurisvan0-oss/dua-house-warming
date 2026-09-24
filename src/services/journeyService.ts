import { getEffectiveEventConfig } from './adminConfigService';
import type { TranslationKey } from '../data/translations';

export type JourneyState =
  | 'NOT_STARTED'
  | 'JOURNEY_STARTED'
  | 'ON_THE_WAY'
  | 'GETTING_CLOSER'
  | 'ALMOST_THERE'
  | 'NEARBY'
  | 'ARRIVED'
  | 'DEPARTED'
  | 'THANK_YOU'
  | 'ERROR';

export interface DistanceClassification {
  journeyState: Extract<
    JourneyState,
    'ARRIVED' | 'ALMOST_THERE' | 'GETTING_CLOSER' | 'ON_THE_WAY'
  >;
  messageKey: TranslationKey;
}

/**
 * Maps a live distance-to-DUA reading to the primary journey status shown
 * on the map screen. `arrivalRadius` is the only configurable gate here —
 * everything above it uses the fixed emotional-distance bands from the spec.
 */
export function classifyDistance(
  distanceMeters: number,
  cfg = getEffectiveEventConfig(),
): DistanceClassification {
  if (distanceMeters <= cfg.arrivalRadius) {
    return { journeyState: 'ARRIVED', messageKey: 'arrived' };
  }
  if (distanceMeters <= 500) {
    return { journeyState: 'ALMOST_THERE', messageKey: 'justALittleFurther' };
  }
  if (distanceMeters <= 1000) {
    return { journeyState: 'ALMOST_THERE', messageKey: 'almostThere' };
  }
  if (distanceMeters <= 3000) {
    return { journeyState: 'GETTING_CLOSER', messageKey: 'duaGettingCloser' };
  }
  if (distanceMeters <= 5000) {
    return { journeyState: 'GETTING_CLOSER', messageKey: 'gettingCloser' };
  }
  return { journeyState: 'ON_THE_WAY', messageKey: 'journeyBegun' };
}

/**
 * A secondary "DUA is near" banner, independent of the main ladder above,
 * driven by the configurable `nearbyRadius`. Shown once per zone entered
 * so the guest isn't over-notified.
 */
export function classifyNearby(
  distanceMeters: number,
  cfg = getEffectiveEventConfig(),
): { nearby: boolean; messageKey: TranslationKey } {
  if (distanceMeters <= 200) return { nearby: true, messageKey: 'justALittleFurther' };
  if (distanceMeters <= 500) return { nearby: true, messageKey: 'almostHere' };
  if (distanceMeters <= cfg.nearbyRadius) return { nearby: true, messageKey: 'duaIsNear' };
  return { nearby: false, messageKey: 'duaIsNear' };
}

const REQUIRED_CONSECUTIVE_READINGS = 2;

/**
 * Guards against a single noisy GPS fix triggering a false arrival: only
 * confirms ARRIVED once a couple of consecutive, sufficiently-accurate
 * readings land inside the arrival radius. The accuracy bar scales with
 * the radius itself (never stricter than ~100m, but also never demanding
 * better precision than the radius it's confirming) — real phone GPS
 * regularly reports 50-150m accuracy near buildings/porches, and a fixed
 * 100m floor risked guests never confirming arrival in that situation.
 */
export function evaluateArrivalReading(
  distanceMeters: number,
  accuracyMeters: number,
  prevConsecutiveInsideCount: number,
  cfg = getEffectiveEventConfig(),
): { confirmed: boolean; consecutiveInsideCount: number } {
  const maxAcceptableAccuracy = Math.max(100, cfg.arrivalRadius);
  const accurateEnough = accuracyMeters <= maxAcceptableAccuracy;
  const inside = distanceMeters <= cfg.arrivalRadius;

  if (inside && accurateEnough) {
    const count = prevConsecutiveInsideCount + 1;
    return { confirmed: count >= REQUIRED_CONSECUTIVE_READINGS, consecutiveInsideCount: count };
  }
  if (!inside && accurateEnough) {
    return { confirmed: false, consecutiveInsideCount: 0 };
  }
  // Low-accuracy reading: neither confirm nor reset progress.
  return { confirmed: false, consecutiveInsideCount: prevConsecutiveInsideCount };
}

/**
 * Requires the guest to stay outside the geofence continuously for
 * `departureDelayMinutes` before firing DEPARTED, so a brief GPS blip
 * near the boundary doesn't end the visit prematurely.
 */
export function evaluateDeparture(
  distanceMeters: number,
  awayStreakStartedAt: number | null,
  now: number,
  cfg = getEffectiveEventConfig(),
): { departed: boolean; awayStreakStartedAt: number | null } {
  const outside = distanceMeters > cfg.arrivalRadius;
  if (!outside) {
    return { departed: false, awayStreakStartedAt: null };
  }
  const streakStart = awayStreakStartedAt ?? now;
  const elapsedMinutes = (now - streakStart) / 60000;
  if (elapsedMinutes >= cfg.departureDelayMinutes) {
    return { departed: true, awayStreakStartedAt: streakStart };
  }
  return { departed: false, awayStreakStartedAt: streakStart };
}

export interface DemoDistancePreset {
  id: string;
  label: string;
  meters: number;
}

// Values chosen to land cleanly inside each named band above, independent
// of admin-configured radii, purely for the /admin Demo Journey buttons.
export const demoDistancePresets: DemoDistancePreset[] = [
  { id: '5km', label: '5 KM', meters: 5200 },
  { id: '3km', label: '3 KM', meters: 3200 },
  { id: '1km', label: '1 KM', meters: 1100 },
  { id: '500m', label: '500 M', meters: 600 },
  { id: '200m', label: '200 M', meters: 250 },
  { id: '100m', label: '100 M', meters: 160 },
];
