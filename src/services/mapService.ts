import { Map as MapLibreMap, Marker, LngLatBounds } from 'maplibre-gl';
import type { GeoJSONSource, StyleSpecification } from 'maplibre-gl';
import type { Feature, LineString } from 'geojson';
import { mapConfig } from '../config/event';
import type { LatLng } from '../utils/distance';

const ROUTE_SOURCE_ID = 'dua-route';
const ROUTE_LAYER_ID = 'dua-route-line';
const ROUTE_GLOW_LAYER_ID = 'dua-route-line-glow';
const STYLE_LOAD_TIMEOUT_MS = 7000;

export type MapInitResult =
  | { ok: true; map: MapLibreMap; usedFallbackStyle: boolean }
  | { ok: false };

/**
 * Boots a MapLibre map using the free OpenFreeMap vector style. If it
 * doesn't load in time (network blocked, provider down, etc.) it retries
 * with a plain OpenStreetMap raster style — still free, no key. If that
 * also fails, resolves with ok:false so the caller can show a friendly
 * "map is taking a moment to load" message instead of a blank screen.
 */
export function initializeMap(container: HTMLElement, center: LatLng): Promise<MapInitResult> {
  return new Promise((resolve) => {
    let settled = false;

    const tryStyle = (styleUrlOrSpec: string | StyleSpecification, isFallback: boolean) => {
      const map = new MapLibreMap({
        container,
        style: styleUrlOrSpec,
        center: [center.longitude, center.latitude],
        zoom: 13,
        attributionControl: { compact: true },
      });

      const timer = setTimeout(() => {
        if (settled) return;
        map.remove();
        if (!isFallback) {
          tryStyle(mapConfig.fallbackRasterStyle, true);
        } else {
          settled = true;
          resolve({ ok: false });
        }
      }, STYLE_LOAD_TIMEOUT_MS);

      map.once('load', () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({ ok: true, map, usedFallbackStyle: isFallback });
      });

      map.once('error', () => {
        clearTimeout(timer);
        if (settled) return;
        map.remove();
        if (!isFallback) {
          tryStyle(mapConfig.fallbackRasterStyle, true);
        } else {
          settled = true;
          resolve({ ok: false });
        }
      });
    };

    tryStyle(mapConfig.primaryStyleUrl, false);
  });
}

function createMarkerCircle(innerHtml: string, bg: string, label: string): HTMLDivElement {
  const el = document.createElement('div');
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', label);
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.width = '36px';
  el.style.height = '36px';
  el.style.borderRadius = '50%';
  el.style.background = bg;
  el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.35)';
  el.style.border = '2px solid white';
  el.style.position = 'relative';
  // A one-time bounce-in as the marker first appears. Applied to this
  // inner circle (never the outer element MapLibre positions) so it never
  // fights the translate transform MapLibre uses to place the marker.
  el.className = 'dua-marker-in';
  el.innerHTML = innerHtml;
  return el;
}

const NAV_ARROW_SVG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="dua-heading-icon" style="transition:transform 0.5s ease-out;"><path d="M12 2 L20 20 L12 15.5 L4 20 Z" fill="#fff"/></svg>';

const HOUSE_ICON_SVG =
  '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3b2416" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>';

/**
 * The live "you" marker: an Uber/Swiggy-style directional arrow (rotates
 * to face the way the guest is travelling — see updateMarkerHeading), a
 * pulsing radar-ping ring behind it, plus a CSS transition on the outer
 * element so each GPS update glides the marker to its new spot instead of
 * snapping — the closest a map can get to "you can feel yourself moving".
 */
export function createUserMarker(map: MapLibreMap, position: LatLng): Marker {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.width = '36px';
  wrapper.style.height = '36px';
  wrapper.style.transition = 'transform 0.9s ease-out';

  const ping = document.createElement('div');
  ping.className = 'dua-marker-ping';
  ping.style.position = 'absolute';
  ping.style.inset = '0';
  ping.style.borderRadius = '50%';
  ping.style.background = '#a4502a';

  wrapper.appendChild(ping);
  wrapper.appendChild(createMarkerCircle(NAV_ARROW_SVG, '#a4502a', 'Your location'));

  return new Marker({ element: wrapper }).setLngLat([position.longitude, position.latitude]).addTo(map);
}

/** Rotates the user marker's inner arrow to face the given compass bearing. */
export function updateMarkerHeading(marker: Marker, bearingDeg: number): void {
  const icon = marker.getElement().querySelector<HTMLElement>('.dua-heading-icon');
  if (icon) icon.style.transform = `rotate(${bearingDeg}deg)`;
}

export function createDestinationMarker(map: MapLibreMap, position: LatLng): Marker {
  // Wrapped the same way as the user marker so MapLibre's own positioning
  // transform (on the wrapper) never collides with the circle's bounce-in
  // transform (on the child).
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.width = '36px';
  wrapper.style.height = '36px';
  wrapper.appendChild(createMarkerCircle(HOUSE_ICON_SVG, '#b88a3e', 'DUA'));

  return new Marker({ element: wrapper }).setLngLat([position.longitude, position.latitude]).addTo(map);
}

export function updateMarkerPosition(marker: Marker, position: LatLng): void {
  marker.setLngLat([position.longitude, position.latitude]);
}

export function drawRoute(map: MapLibreMap, geometry: [number, number][]): void {
  const geojson: Feature<LineString> = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: geometry },
  };

  const existing = map.getSource<GeoJSONSource>(ROUTE_SOURCE_ID);
  if (existing) {
    existing.setData(geojson);
    return;
  }

  map.addSource(ROUTE_SOURCE_ID, { type: 'geojson', data: geojson });

  // A soft glow underneath the main line — reads like a warmly lit path
  // home rather than a flat navigation line.
  map.addLayer({
    id: ROUTE_GLOW_LAYER_ID,
    type: 'line',
    source: ROUTE_SOURCE_ID,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': '#a4502a',
      'line-width': 12,
      'line-opacity': 0,
      'line-opacity-transition': { duration: 1200, delay: 0 },
      'line-blur': 6,
    },
  });

  map.addLayer({
    id: ROUTE_LAYER_ID,
    type: 'line',
    source: ROUTE_SOURCE_ID,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': '#a4502a',
      'line-width': 5,
      'line-opacity': 0,
      'line-opacity-transition': { duration: 1200, delay: 150 },
    },
  });

  // Fade both layers in on the next frame now that the transitions above
  // are registered (setting the target opacity immediately at creation
  // would skip the transition).
  requestAnimationFrame(() => {
    map.setPaintProperty(ROUTE_GLOW_LAYER_ID, 'line-opacity', 0.25);
    map.setPaintProperty(ROUTE_LAYER_ID, 'line-opacity', 0.9);
  });
}

export function fitToRoute(map: MapLibreMap, geometry: [number, number][]): void {
  if (geometry.length === 0) return;
  const bounds = geometry.reduce(
    (b, coord) => b.extend(coord as [number, number]),
    new LngLatBounds(geometry[0], geometry[0]),
  );
  map.fitBounds(bounds, { padding: 64, maxZoom: 16, duration: 1000 });
}

export function bearingBetween(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const [lng1, lat1] = [toRad(a[0]), toRad(a[1])];
  const [lng2, lat2] = [toRad(b[0]), toRad(b[1])];
  const dLng = lng2 - lng1;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * A one-time cinematic sweep along the just-drawn route — start tilted
 * and oriented toward DUA, glide through the midpoint, arrive banking
 * into the destination, then settle into the full overview. Built from
 * the real MapLibre camera (no video asset needed) so it always matches
 * the guest's actual route. Skips gracefully if the browser is in
 * reduced-motion mode.
 */
export function flyThroughRoute(map: MapLibreMap, geometry: [number, number][]): void {
  if (geometry.length < 2) {
    fitToRoute(map, geometry);
    return;
  }
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    fitToRoute(map, geometry);
    return;
  }

  const start = geometry[0];
  const end = geometry[geometry.length - 1];
  const mid = geometry[Math.floor(geometry.length / 2)];
  const bearing1 = bearingBetween(start, mid);
  const bearing2 = bearingBetween(mid, end);

  map.flyTo({ center: start, zoom: 15, pitch: 58, bearing: bearing1, duration: 1400, essential: true });
  const t1 = setTimeout(() => {
    map.flyTo({ center: mid, zoom: 13.5, pitch: 52, bearing: bearing2, duration: 1500, essential: true });
  }, 1450);
  const t2 = setTimeout(() => {
    map.flyTo({ center: end, zoom: 15.5, pitch: 40, bearing: 0, duration: 1500, essential: true });
  }, 3050);
  const t3 = setTimeout(() => {
    // Settle on a gentle tilt rather than flattening to a top-down view —
    // reads more like a live navigation app than a static map.
    map.easeTo({ pitch: 30, bearing: 0, duration: 600 });
    fitToRoute(map, geometry);
  }, 4650);

  // If the component/map is torn down mid-sequence, don't let a queued
  // flyTo fire against a removed map.
  map.once('remove', () => {
    clearTimeout(t1);
    clearTimeout(t2);
    clearTimeout(t3);
  });
}
