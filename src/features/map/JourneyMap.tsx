import { useEffect, useRef, useState } from 'react';
import type { Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AnimatePresence, animate as fmAnimate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Card';
import { Stepper } from '../../components/Stepper';
import { useLanguage } from '../../hooks/useLanguage';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import type { LatLng } from '../../utils/distance';
import { formatDistance, formatDuration, haversineDistance } from '../../utils/distance';
import {
  bearingBetween,
  createDestinationMarker,
  createUserMarker,
  drawRoute,
  fitToRoute,
  flyThroughRoute,
  initializeMap,
  updateMarkerHeading,
  updateMarkerPosition,
} from '../../services/mapService';
import { getRoute, type RouteResult } from '../../services/routingService';
import type { TranslationKey } from '../../data/translations';
import type { JourneyState } from '../../services/journeyService';

interface JourneyMapProps {
  destination: LatLng;
  userPosition: LatLng | null;
  /**
   * The authoritative distance-to-DUA for display (text, progress bar).
   * Comes from the journey hook, which sets it identically whether it was
   * computed from a real GPS fix or simulated by /admin Demo Mode — the
   * map's own `userPosition`-derived distance is only used for actually
   * placing markers/drawing the route, not for what's shown as text.
   */
  distanceMeters: number | null;
  journeyState: JourneyState;
  messageKey: TranslationKey;
  isNearby: boolean;
  watching: boolean;
  paused: boolean;
  /** A host-written note for the last stretch (e.g. "Look for the blue
   * gate past the mosque"), shown once the guest is nearby. Optional. */
  landmarkNote?: string;
  onStop: () => void;
  onResume: () => void;
  onBack: () => void;
}

const REFETCH_ROUTE_THRESHOLD_METERS = 500;
// How far (px) the sheet's expanded-only content sits below the peek
// zone — dragging/snapping translates the whole sheet by this amount.
const SHEET_PEEK_OFFSET = 272;

function stepIndexForJourneyState(state: JourneyState): number {
  switch (state) {
    case 'NOT_STARTED':
    case 'JOURNEY_STARTED':
      return 0;
    case 'ON_THE_WAY':
    case 'GETTING_CLOSER':
      return 1;
    case 'ALMOST_THERE':
    case 'NEARBY':
      return 2;
    default:
      return 3;
  }
}

export function JourneyMap({
  destination,
  userPosition,
  distanceMeters,
  journeyState,
  messageKey,
  isNearby,
  watching,
  paused,
  landmarkNote,
  onStop,
  onResume,
  onBack,
}: JourneyMapProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  const destMarkerRef = useRef<Marker | null>(null);
  const lastRouteOriginRef = useRef<LatLng | null>(null);
  const lastHeadingOriginRef = useRef<LatLng | null>(null);
  const initialDistanceRef = useRef<number | null>(null);
  const hasFlownThroughRef = useRef(false);
  const hasShownNearbyToastRef = useRef(false);

  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [routeStatus, setRouteStatus] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle');
  const [progress, setProgress] = useState(0);
  const [showNearbyToast, setShowNearbyToast] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const sheetY = useMotionValue(SHEET_PEEK_OFFSET);
  const expandedOpacity = useTransform(sheetY, [0, SHEET_PEEK_OFFSET], [1, 0]);
  const chevronRotate = useTransform(sheetY, [0, SHEET_PEEK_OFFSET], [180, 0]);

  const snapSheet = (expand: boolean) => {
    setSheetExpanded(expand);
    fmAnimate(sheetY, expand ? 0 : SHEET_PEEK_OFFSET, { type: 'spring', stiffness: 320, damping: 34 });
  };

  const handleDragEnd = (_e: unknown, info: PanInfo) => {
    const shouldExpand = info.velocity.y < -250 || (info.velocity.y < 250 && sheetY.get() < SHEET_PEEK_OFFSET / 2);
    snapSheet(shouldExpand);
  };

  // A one-time "DUA is near ❤️" celebration the moment the guest first
  // enters the nearby zone — separate from the small persistent header
  // badge, which stays up for the rest of the journey.
  useEffect(() => {
    if (!isNearby || hasShownNearbyToastRef.current) return;
    hasShownNearbyToastRef.current = true;
    setShowNearbyToast(true);
    const timer = setTimeout(() => setShowNearbyToast(false), 4000);
    return () => clearTimeout(timer);
  }, [isNearby]);

  // Boot the map once.
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    initializeMap(containerRef.current, destination).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setMapStatus('unavailable');
        return;
      }
      mapRef.current = result.map;
      destMarkerRef.current = createDestinationMarker(result.map, destination);
      setMapStatus('ready');
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track the user marker (rotating it to face the direction of travel,
  // like a delivery-partner icon) + fetch/redraw the route as position
  // updates arrive.
  useEffect(() => {
    if (mapStatus !== 'ready' || !mapRef.current || !userPosition) return;
    const map = mapRef.current;

    if (!userMarkerRef.current) {
      userMarkerRef.current = createUserMarker(map, userPosition);
    } else {
      updateMarkerPosition(userMarkerRef.current, userPosition);
      const prev = lastHeadingOriginRef.current;
      if (prev && (prev.latitude !== userPosition.latitude || prev.longitude !== userPosition.longitude)) {
        const bearing = bearingBetween(
          [prev.longitude, prev.latitude],
          [userPosition.longitude, userPosition.latitude],
        );
        updateMarkerHeading(userMarkerRef.current, bearing);
      }
    }
    lastHeadingOriginRef.current = userPosition;

    const shouldRefetch =
      !lastRouteOriginRef.current ||
      haversineDistance(lastRouteOriginRef.current, userPosition) > REFETCH_ROUTE_THRESHOLD_METERS;

    if (shouldRefetch) {
      lastRouteOriginRef.current = userPosition;
      setRouteStatus('loading');
      getRoute(userPosition, destination).then((result) => {
        setRoute(result);
        setRouteStatus(result.isFallback ? 'unavailable' : 'ready');
        drawRoute(map, result.geometry);
        if (!hasFlownThroughRef.current) {
          hasFlownThroughRef.current = true;
          flyThroughRoute(map, result.geometry);
        } else {
          fitToRoute(map, result.geometry);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapStatus, userPosition?.latitude, userPosition?.longitude]);

  // Prefer a real route's duration when we have one for the current
  // position; otherwise estimate from the authoritative distance so Demo
  // Mode (which has no real route) still shows a sensible ETA.
  const durationSeconds =
    route && !route.isFallback && userPosition
      ? route.durationSeconds
      : distanceMeters != null
        ? (distanceMeters / 1000) * 90
        : null;
  const etaMinutes = durationSeconds != null ? Math.max(1, Math.round(durationSeconds / 60)) : null;

  // Progress never visually slides backward, even if a route refetch or a
  // noisy GPS fix briefly bumps the raw distance up — it always reads as
  // forward motion toward DUA.
  useEffect(() => {
    if (distanceMeters == null) return;
    if (initialDistanceRef.current == null) {
      initialDistanceRef.current = Math.max(distanceMeters, 1);
    }
    const raw = 1 - distanceMeters / initialDistanceRef.current;
    const clamped = Math.max(0, Math.min(1, raw));
    setProgress((prev) => Math.max(prev, clamped));
  }, [distanceMeters]);

  const animatedDistance = useAnimatedNumber(distanceMeters);
  const stepLabels = [t('journeyStarted'), t('onTheWay'), t('almostThere'), t('arrivedAtDua')];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-dvh bg-cream overflow-hidden"
    >
      <div className="absolute inset-0">
        <div ref={containerRef} className="h-full w-full" />
        {mapStatus === 'unavailable' && (
          <div className="absolute inset-0 flex items-center justify-center bg-cream px-8 text-center">
            <p className="text-[15px] text-charcoal/70">{t('errorMapUnavailable')}</p>
          </div>
        )}
        {mapStatus === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-cream">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="text-sm text-charcoal/50"
            >
              {t('mapLoadingNotice')}
            </motion.div>
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-0 inset-x-0 z-10 px-4 pt-[max(1rem,env(safe-area-inset-top))]"
      >
        <div className="mx-auto flex max-w-sm items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ivory/95 text-forest shadow-lg backdrop-blur"
          >
            ←
          </button>
          <div className="flex-1 rounded-2xl bg-ivory/95 backdrop-blur px-4 py-3 shadow-lg">
            <h1 className="font-heading text-lg text-forest">{t('yourJourneyToDua')}</h1>
            <AnimatePresence>
              {isNearby && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, height: 0 }}
                  animate={{ opacity: 1, scale: 1, height: 'auto' }}
                  exit={{ opacity: 0, scale: 0.85, height: 0 }}
                >
                  <Badge tone="gold">{t('duaIsNear')}</Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showNearbyToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="absolute top-24 inset-x-0 z-20 px-4"
          >
            <div className="lantern-glow mx-auto max-w-sm rounded-2xl bg-forest px-5 py-4 text-center text-ivory shadow-2xl">
              <p className="font-heading text-lg">{t('duaIsNear')}</p>
              <p className="text-sm text-ivory/80 mt-0.5">{t('cantWaitToSeeYou')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {paused && (
        <div className="absolute top-24 inset-x-0 z-10 px-4">
          <div className="mx-auto max-w-sm rounded-2xl bg-charcoal/90 px-4 py-3 text-center text-sm text-ivory">
            {t('journeyPausedNotice')}
            <Button variant="secondary" className="mt-2" onClick={onResume}>
              {t('resumeJourney')}
            </Button>
          </div>
        </div>
      )}

      {/* Swiggy/Zomato-style live-tracking sheet: drag the handle (or tap
          it) to peek at just the status, or expand for the full ETA,
          stepper and controls. */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: SHEET_PEEK_OFFSET }}
        dragElastic={0.08}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ y: sheetY, touchAction: 'none' }}
        className="absolute bottom-0 inset-x-0 z-10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto max-w-sm rounded-t-3xl rounded-b-2xl bg-ivory border border-gold-deep/20 shadow-[0_-4px_24px_rgba(122,62,26,0.2)] overflow-hidden">
          <button
            type="button"
            onClick={() => snapSheet(!sheetExpanded)}
            aria-label={sheetExpanded ? 'Collapse journey details' : 'Expand journey details'}
            className="flex w-full flex-col items-center pt-2.5 pb-1 cursor-grab active:cursor-grabbing"
          >
            <span className="h-1.5 w-10 rounded-full bg-forest/15" />
            <motion.span style={{ rotate: chevronRotate }} className="mt-1 text-forest/40 text-[10px]">
              ▲
            </motion.span>
          </button>

          <div className="px-6 pb-2 pt-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={messageKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="font-heading text-xl text-forest"
              >
                {t(messageKey)}
              </motion.p>
            </AnimatePresence>

            {distanceMeters != null && (
              <div className="relative mt-3 pt-4">
                <motion.div
                  className="absolute -top-0.5 -ml-3 text-base leading-none"
                  animate={{ left: `${progress * 100}%` }}
                  transition={{ type: 'spring', stiffness: 50, damping: 16 }}
                >
                  🚗
                </motion.div>
                <div className="h-1.5 overflow-hidden rounded-full bg-forest/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald to-gold"
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ type: 'spring', stiffness: 50, damping: 16 }}
                  />
                </div>
              </div>
            )}

            {isNearby && landmarkNote && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 rounded-xl bg-gold/10 border border-gold-deep/25 px-3 py-2 text-xs text-gold-deep"
              >
                {t('landmarkNoteLabel')}: {landmarkNote}
              </motion.p>
            )}
          </div>

          <motion.div style={{ opacity: expandedOpacity }} className="px-6 pb-6">
            {etaMinutes != null && (
              <div className="flex items-baseline gap-2 py-2">
                <span className="font-heading text-5xl text-forest leading-none">{etaMinutes}</span>
                <span className="text-sm text-charcoal/60">
                  {etaMinutes === 1 ? 'minute away' : 'minutes away'}
                </span>
              </div>
            )}

            <div className="mt-2 mb-5">
              <Stepper activeIndex={stepIndexForJourneyState(journeyState)} labels={stepLabels} />
            </div>

            <div className="flex items-center justify-between text-sm text-charcoal/70 mb-3">
              <span>
                {t('distance')}:{' '}
                <strong className="text-forest">{animatedDistance != null ? formatDistance(animatedDistance) : '—'}</strong>
              </span>
              <span>
                {t('estimatedTime')}:{' '}
                <strong className="text-forest">{durationSeconds != null ? formatDuration(durationSeconds) : '—'}</strong>
              </span>
            </div>
            {routeStatus === 'unavailable' && <p className="text-xs text-charcoal/50 mb-3">{t('routeLoadingNotice')}</p>}
            <p className="text-xs text-charcoal/45 mb-3">{t('keepPageOpenNotice')}</p>
            {watching && !paused && (
              <Button variant="ghost" fullWidth onClick={onStop}>
                {t('stopJourney')}
              </Button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
