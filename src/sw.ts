// @ts-nocheck
// Custom service worker (esbuild-bundled by vite-plugin-pwa's injectManifest
// strategy). Excluded from the app's tsconfig — DOM and WebWorker lib
// globals both declare `self` incompatibly, and this file is small and
// self-contained enough not to need the app's type-checking.
/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies';

// Injected at build time with the app-shell precache manifest (index.html,
// JS/CSS chunks except the lazy map/admin bundles, translations, icons).
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// The MapLibre + admin bundles are code-split and only fetched when a
// guest actually starts a journey / an organiser opens /admin — cache
// them opportunistically instead of bloating the initial precache.
registerRoute(
  ({ url }) => /JourneyMap-|AdminDashboard-/.test(url.pathname),
  new StaleWhileRevalidate(),
);

// Map tiles and routing are live, third-party, and large — never cache
// them. If they're unreachable the app shows a friendly retry message
// instead of a stale/broken map.
registerRoute(
  ({ url }) =>
    url.hostname.includes('openfreemap.org') ||
    url.hostname.includes('openstreetmap.org') ||
    url.hostname.includes('project-osrm.org'),
  new NetworkOnly(),
);

self.skipWaiting();
self.addEventListener('activate', () => self.clients.claim());
