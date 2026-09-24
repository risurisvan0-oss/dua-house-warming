import { useCallback, useEffect, useReducer, useRef } from 'react';
import { hasCoordinates } from '../config/event';
import { getEffectiveEventConfig } from '../services/adminConfigService';
import type { LatLng } from '../utils/distance';
import { haversineDistance } from '../utils/distance';
import {
  classifyDistance,
  classifyNearby,
  evaluateArrivalReading,
  evaluateDeparture,
  type JourneyState,
} from '../services/journeyService';
import type { GeolocationErrorReason } from '../services/geolocationService';
import { requestCurrentPosition, startJourneyWatch } from '../services/geolocationService';
import { storageService } from '../services/storageService';
import { notifyHost } from '../services/notifyHostService';
import { subscribeDemoChannel } from '../utils/demoChannel';
import type { TranslationKey } from '../data/translations';

export type JourneyError = GeolocationErrorReason | 'notConfigured' | null;

interface JourneyHookState {
  journeyState: JourneyState;
  distanceMeters: number | null;
  messageKey: TranslationKey;
  isNearby: boolean;
  watching: boolean;
  paused: boolean;
  error: JourneyError;
  userPosition: LatLng | null;
  consecutiveInsideCount: number;
  awayStreakStartedAt: number | null;
  isDemo: boolean;
}

type Action =
  | { type: 'START' }
  | { type: 'ERROR'; reason: GeolocationErrorReason }
  | { type: 'NOT_CONFIGURED' }
  | { type: 'GPS_SAMPLE'; position: LatLng; accuracyMeters: number; now: number }
  | { type: 'DEMO_DISTANCE'; meters: number }
  | { type: 'DEMO_STATE'; state: 'ARRIVED' | 'DEPARTED' | 'THANK_YOU' }
  | { type: 'DEMO_RESET' }
  | { type: 'STOP' }
  | { type: 'RESUME' };

// Built lazily (passed as useReducer's init function below), not as a
// module-level constant — a module-level constant would read localStorage
// once at import time, which runs before any app code (like the ?fresh=1
// reset in main.tsx) gets a chance to run, silently reviving stale state.
function createInitialState(): JourneyHookState {
  return {
    journeyState: (storageService.getJourneyState() as JourneyState | null) ?? 'NOT_STARTED',
    distanceMeters: null,
    messageKey: 'journeyBegun',
    isNearby: false,
    watching: false,
    paused: false,
    error: null,
    userPosition: null,
    consecutiveInsideCount: 0,
    awayStreakStartedAt: storageService.getAwayStreakStartedAt(),
    isDemo: false,
  };
}

function reducer(state: JourneyHookState, action: Action): JourneyHookState {
  switch (action.type) {
    case 'START':
      return { ...state, journeyState: 'JOURNEY_STARTED', watching: true, error: null, paused: false };

    case 'ERROR':
      return { ...state, error: action.reason, watching: false, paused: state.journeyState !== 'NOT_STARTED' };

    case 'NOT_CONFIGURED':
      return { ...state, error: 'notConfigured', watching: false };

    case 'GPS_SAMPLE': {
      const distance = haversineDistanceGuard(action);
      const { messageKey, journeyState: bandState } = classifyDistance(distance);
      const { nearby } = classifyNearby(distance);
      const arrivalCheck = evaluateArrivalReading(
        distance,
        action.accuracyMeters,
        state.consecutiveInsideCount,
      );

      if (arrivalCheck.confirmed) {
        return {
          ...state,
          journeyState: 'ARRIVED',
          distanceMeters: distance,
          messageKey: 'arrived',
          isNearby: true,
          userPosition: action.position,
          consecutiveInsideCount: arrivalCheck.consecutiveInsideCount,
          awayStreakStartedAt: null,
          error: null,
        };
      }

      if (state.journeyState === 'ARRIVED') {
        const departure = evaluateDeparture(distance, state.awayStreakStartedAt, action.now);
        if (departure.departed) {
          return {
            ...state,
            journeyState: 'DEPARTED',
            distanceMeters: distance,
            userPosition: action.position,
            awayStreakStartedAt: departure.awayStreakStartedAt,
            error: null,
          };
        }
        return {
          ...state,
          distanceMeters: distance,
          userPosition: action.position,
          awayStreakStartedAt: departure.awayStreakStartedAt,
          consecutiveInsideCount: arrivalCheck.consecutiveInsideCount,
          error: null,
        };
      }

      // classifyDistance() is a pure distance->text mapper and will report
      // "ARRIVED" from a single reading inside the radius — but arrival
      // must only become real once evaluateArrivalReading() confirms it
      // above (multiple accurate consecutive readings). Until then, cap
      // the display at the last pre-arrival band so the guest sees "just
      // a little further" rather than a premature/flickering "Arrived".
      const isPrematureArrival = bandState === 'ARRIVED';
      return {
        ...state,
        journeyState: isPrematureArrival ? 'ALMOST_THERE' : bandState,
        distanceMeters: distance,
        messageKey: isPrematureArrival ? 'justALittleFurther' : messageKey,
        isNearby: nearby,
        userPosition: action.position,
        consecutiveInsideCount: arrivalCheck.consecutiveInsideCount,
        error: null,
      };
    }

    case 'DEMO_DISTANCE': {
      const { messageKey, journeyState } = classifyDistance(action.meters);
      const { nearby } = classifyNearby(action.meters);
      return {
        ...state,
        journeyState,
        distanceMeters: action.meters,
        messageKey,
        isNearby: nearby,
        watching: true,
        paused: false,
        error: null,
        isDemo: true,
      };
    }

    case 'DEMO_STATE':
      return {
        ...state,
        journeyState: action.state,
        distanceMeters: action.state === 'ARRIVED' ? Math.min(state.distanceMeters ?? 0, 50) : state.distanceMeters,
        messageKey: action.state === 'ARRIVED' ? 'arrived' : state.messageKey,
        error: null,
        isDemo: true,
      };

    case 'DEMO_RESET':
      return {
        journeyState: 'NOT_STARTED',
        distanceMeters: null,
        messageKey: 'journeyBegun',
        isNearby: false,
        watching: false,
        paused: false,
        error: null,
        userPosition: null,
        consecutiveInsideCount: 0,
        awayStreakStartedAt: null,
        isDemo: false,
      };

    case 'STOP':
      return { ...state, watching: false };

    case 'RESUME':
      return { ...state, watching: true, paused: false, error: null };

    default:
      return state;
  }
}

function haversineDistanceGuard(action: Extract<Action, { type: 'GPS_SAMPLE' }>): number {
  const cfg = getEffectiveEventConfig();
  if (!hasCoordinates(cfg)) return 0;
  return haversineDistance(action.position, {
    latitude: cfg.latitude,
    longitude: cfg.longitude,
  });
}

export function useJourney() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const watcherRef = useRef<{ stop: () => void } | null>(null);

  // Persist milestones so reopening the invitation resumes correctly.
  useEffect(() => {
    storageService.setJourneyState(state.journeyState);
    if (state.journeyState === 'JOURNEY_STARTED' && !storageService.getJourneyStartedAt()) {
      storageService.setJourneyStartedAt(Date.now());
    }
    if (state.journeyState === 'ARRIVED' && !storageService.getArrivedAt()) {
      storageService.setArrivedAt(Date.now());
      // A tactile "you're here" cue, once, the moment arrival is confirmed.
      // No-op on browsers/devices without vibration support (e.g. iOS Safari).
      navigator.vibrate?.([160, 90, 160]);
      // Let the host know, in real time, that this guest has actually
      // arrived (as opposed to just RSVP'd) — handy for seating/serving.
      // Demo-triggered arrivals (from /admin) are excluded so testing the
      // flow doesn't spam the host's Sheet.
      if (!state.isDemo) {
        notifyHost({
          type: 'arrival',
          guestId: storageService.getGuestId(),
          guestName: storageService.getGuestName() ?? 'Guest',
        });
      }
    }
    if (state.journeyState === 'DEPARTED' && !storageService.getDepartedAt()) {
      storageService.setDepartedAt(Date.now());
    }
    storageService.setAwayStreakStartedAt(state.awayStreakStartedAt);
  }, [state.journeyState, state.awayStreakStartedAt, state.isDemo]);

  const start = useCallback(async () => {
    if (!hasCoordinates(getEffectiveEventConfig())) {
      dispatch({ type: 'NOT_CONFIGURED' });
      return;
    }
    try {
      // Use the very first fix immediately (don't throw it away and wait
      // for the watcher's own first callback, which can take much longer)
      // so the map shows the guest's position and a route right away.
      const initialSample = await requestCurrentPosition();
      dispatch({ type: 'START' });
      dispatch({
        type: 'GPS_SAMPLE',
        position: initialSample.coords,
        accuracyMeters: initialSample.accuracyMeters,
        now: Date.now(),
      });
      watcherRef.current = startJourneyWatch(
        (sample) => dispatch({ type: 'GPS_SAMPLE', position: sample.coords, accuracyMeters: sample.accuracyMeters, now: Date.now() }),
        (reason) => dispatch({ type: 'ERROR', reason }),
      );
    } catch (err) {
      const reason = (err as { reason?: GeolocationErrorReason })?.reason ?? 'unavailable';
      dispatch({ type: 'ERROR', reason });
    }
  }, []);

  const stop = useCallback(() => {
    watcherRef.current?.stop();
    watcherRef.current = null;
    dispatch({ type: 'STOP' });
  }, []);

  const resume = useCallback(() => {
    dispatch({ type: 'RESUME' });
    if (!watcherRef.current) {
      watcherRef.current = startJourneyWatch(
        (sample) => dispatch({ type: 'GPS_SAMPLE', position: sample.coords, accuracyMeters: sample.accuracyMeters, now: Date.now() }),
        (reason) => dispatch({ type: 'ERROR', reason }),
      );
    }
  }, []);

  useEffect(() => {
    return () => watcherRef.current?.stop();
  }, []);

  // Live demo sync from /admin, in another tab.
  useEffect(() => {
    return subscribeDemoChannel((message) => {
      switch (message.type) {
        case 'DEMO_DISTANCE':
          dispatch({ type: 'DEMO_DISTANCE', meters: message.meters });
          break;
        case 'DEMO_ARRIVED':
          dispatch({ type: 'DEMO_STATE', state: 'ARRIVED' });
          break;
        case 'DEMO_DEPARTED':
          dispatch({ type: 'DEMO_STATE', state: 'DEPARTED' });
          break;
        case 'DEMO_THANK_YOU':
          dispatch({ type: 'DEMO_STATE', state: 'THANK_YOU' });
          break;
        case 'DEMO_START':
          dispatch({ type: 'START' });
          break;
        case 'DEMO_RESET':
          storageService.resetJourney();
          dispatch({ type: 'DEMO_RESET' });
          break;
      }
    });
  }, []);

  return { ...state, start, stop, resume };
}
