import type { LatLng } from '../utils/distance';

export type GeolocationErrorReason = 'denied' | 'unavailable' | 'unsupported' | 'timeout';

export interface GeoPositionSample {
  coords: LatLng;
  accuracyMeters: number;
  timestamp: number;
}

export function isGeolocationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

function toReason(error: GeolocationPositionError): GeolocationErrorReason {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'denied';
    case error.TIMEOUT:
      return 'timeout';
    default:
      return 'unavailable';
  }
}

/** One-shot position request, used for the initial permission prompt. */
export function requestCurrentPosition(): Promise<GeoPositionSample> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject({ reason: 'unsupported' } satisfies { reason: GeolocationErrorReason });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(toSample(position)),
      (error) => reject({ reason: toReason(error) } satisfies { reason: GeolocationErrorReason }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

function toSample(position: GeolocationPosition): GeoPositionSample {
  return {
    coords: { latitude: position.coords.latitude, longitude: position.coords.longitude },
    accuracyMeters: position.coords.accuracy,
    timestamp: position.timestamp,
  };
}

export interface JourneyWatcher {
  stop: () => void;
}

/**
 * Wraps navigator.geolocation.watchPosition for the duration of an active
 * Journey. Filters out very low-accuracy fixes so the UI doesn't jitter
 * between states on a single bad reading.
 */
export function startJourneyWatch(
  onSample: (sample: GeoPositionSample) => void,
  onError: (reason: GeolocationErrorReason) => void,
  maxAcceptableAccuracyMeters = 250,
): JourneyWatcher {
  if (!isGeolocationSupported()) {
    onError('unsupported');
    return { stop: () => {} };
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const sample = toSample(position);
      if (sample.accuracyMeters > maxAcceptableAccuracyMeters) return;
      onSample(sample);
    },
    (error) => onError(toReason(error)),
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
  );

  return {
    stop: () => navigator.geolocation.clearWatch(watchId),
  };
}
