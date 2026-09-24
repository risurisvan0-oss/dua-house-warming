import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the same build works on a GitHub Pages project
  // subpath, a GitHub Pages user site, or Cloudflare Pages without
  // changing any config per deploy target.
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // A hand-written service worker (src/sw.ts, esbuild-bundled) instead
      // of the default generateSW strategy — lighter to build and easier
      // to follow than a generated Workbox config.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        // The MapLibre + admin bundles are handled by their own runtime
        // route in sw.ts instead of being precached up front.
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        globIgnores: ['**/JourneyMap-*', '**/AdminDashboard-*'],
      },
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.svg'],
      manifest: {
        id: '/',
        name: "DUA — House Warming Invitation",
        short_name: 'DUA',
        description: "You're invited to Majeed & Kamarunnisa's house warming ceremony at DUA.",
        theme_color: '#3b2416',
        background_color: '#efe4d0',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/icon-maskable.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
