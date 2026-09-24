import { routingConfig } from '../config/event';
import type { LatLng } from '../utils/distance';
import { haversineDistance } from '../utils/distance';

export interface RouteResult {
  /** [lng, lat] pairs, GeoJSON order, ready for a MapLibre LineString source */
  geometry: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  isFallback: boolean;
}

function buildFallbackRoute(origin: LatLng, destination: LatLng): RouteResult {
  const distanceMeters = haversineDistance(origin, destination);
  // Rough walking/driving-agnostic estimate so the UI has something sensible to show.
  const durationSeconds = (distanceMeters / 1000) * 90;
  return {
    geometry: [
      [origin.longitude, origin.latitude],
      [destination.longitude, destination.latitude],
    ],
    distanceMeters,
    durationSeconds,
    isFallback: true,
  };
}

interface OsrmResponse {
  code: string;
  routes?: {
    geometry: { coordinates: [number, number][] };
    distance: number;
    duration: number;
  }[];
}

/**
 * Fetches a driving route from the free OSRM public demo server (no API
 * key). Never throws — on any failure or timeout it resolves to a
 * straight-line fallback route between origin and destination so the map
 * always has something to draw.
 */
export async function getRoute(origin: LatLng, destination: LatLng): Promise<RouteResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), routingConfig.requestTimeoutMs);

  try {
    const url =
      `${routingConfig.osrmBaseUrl}/route/v1/driving/` +
      `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}` +
      `?overview=full&geometries=geojson`;

    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`OSRM responded ${response.status}`);

    const data = (await response.json()) as OsrmResponse;
    const route = data.routes?.[0];
    if (!route) throw new Error('OSRM returned no route');

    return {
      geometry: route.geometry.coordinates,
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      isFallback: false,
    };
  } catch {
    return buildFallbackRoute(origin, destination);
  } finally {
    clearTimeout(timeout);
  }
}
