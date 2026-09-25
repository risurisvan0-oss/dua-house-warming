# DUA — House Warming Invitation

**Live:** https://risurisvan0-oss.github.io/dua-house-warming/ — auto-deploys
on every push to `master` via `.github/workflows/deploy.yml`. Real
coordinates are still not set (see below), so the Journey/map screens
aren't functional on the live site yet.

An interactive, zero-budget digital invitation and "Journey Experience" for
Majeed & Kamarunnisa's house-warming ceremony at **DUA**, 18 October 2026,
Thonichra, Naduvattom, Kerala.

A guest opens a WhatsApp link, experiences a cinematic invitation, RSVPs,
then can start an in-app journey with a live map that recognises when
they're on the way, getting closer, and arrived — closing with a "Welcome
to DUA" moment and, later, a "Thank You for Coming" screen and guestbook.

Built as a static, client-side PWA. No backend, no paid APIs, no API keys,
no database, no credit card — it runs entirely in the browser and deploys
to any free static host.

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Framer Motion
- React Router
- MapLibre GL JS, rendering free [OpenFreeMap](https://openfreemap.org)
  vector tiles (falls back to plain OpenStreetMap raster tiles)
- Free public [OSRM](https://project-osrm.org) routing (falls back to a
  straight-line route if unreachable)
- Browser Geolocation API, `localStorage` / `sessionStorage`
- `vite-plugin-pwa` (installable app, offline app-shell cache)

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

No environment variables, API keys, or accounts are required for any of
these commands.

## Adding the real coordinates

`src/config/event.ts` ships with `latitude: null, longitude: null` on
purpose — the app is not allowed to guess DUA's location. Until real
coordinates are set, the Journey/map screens show a friendly "location
being finalised" message instead of crashing.

Once you know the coordinates, edit:

```ts
// src/config/event.ts
latitude: 11.xxxxx,
longitude: 75.xxxxx,
```

Everything else (RSVP, invitation, FAQ, guestbook, PWA) already works
without them.

## How the map works

`src/services/mapService.ts` boots a MapLibre map using the free
OpenFreeMap vector style (`https://tiles.openfreemap.org/styles/liberty`,
no key, no rate limit). If that style doesn't load within a few seconds
(network blocked, provider down), it automatically retries with a plain
OpenStreetMap raster style. If both fail, the Journey Map screen shows
"Your map is taking a moment to load ❤️" instead of a blank screen — the
rest of the invitation keeps working.

Map tiles and routing are deliberately **not** cached by the service
worker (they're large, live, third-party data) — see [Offline
behaviour](#offline-behaviour).

## How routing works (and its fallback)

`src/services/routingService.ts` exposes one function:

```ts
getRoute(origin: LatLng, destination: LatLng): Promise<RouteResult>
```

It calls the free public OSRM demo server
(`router.project-osrm.org`, no key, no account). If the request fails or
times out (6s), it never throws — it resolves to a straight-line fallback
route between the two points instead, with `isFallback: true`. The
Journey Map screen shows "Your route is taking a moment to load ❤️" when
running on the fallback, while still drawing the map, DUA's marker, the
guest's live position, and a route line.

Because the app never depends on OSRM being reachable to function, you
can swap in OpenRouteService or another provider later by only editing
this one file.

## How geolocation works

`src/services/geolocationService.ts` wraps `navigator.geolocation`.
Location is strictly **opt-in**: nothing is requested until the guest taps
"Allow & Start Journey" on the Location Permission screen. Only the
current position and journey milestone timestamps are stored — no
continuous GPS trail is ever saved (see [Privacy](#privacy--geolocation-safety)).

The journey state machine (`src/services/journeyService.ts`) is pure logic
with no browser calls, so it can be driven identically by real GPS samples
or by the `/admin` Demo Mode buttons:

- **Distance bands** (`classifyDistance`) turn a live distance into one of
  the emotional states from the spec: *your journey has begun* → *getting
  closer* → *almost there* → **arrived** (gated by the configurable
  `arrivalRadius`).
- **Arrival** only confirms after several consecutive, sufficiently
  accurate readings land inside `arrivalRadius` — a single noisy GPS fix
  can't trigger a false arrival.
- **Departure** only fires after the guest has been continuously outside
  the geofence for `departureDelayMinutes` (default 7) — a GPS blip near
  the boundary doesn't end the visit.

### Browser limitation

A browser tab cannot reliably keep tracking location once it's
backgrounded, the phone is locked, or battery saver kicks in — the app is
upfront about this ("keep this page open while travelling") and shows a
"journey is paused" state with a **Resume Journey** button if updates
stop arriving, rather than silently failing.

## Demo Mode

> **Note on routes:** this app uses hash-based routing (`HashRouter`),
> not path-based routing — because it's typically deployed to a GitHub
> Pages *project* subpath (e.g. `you.github.io/repo-name/`), and a plain
> path-based router has no way to know about that subpath, which causes
> a **blank page** (ask me if you ever see one — it's almost always
> this). So `/admin` and `/wall` below really mean **`/#/admin`** and
> **`/#/wall`** appended to wherever the app is hosted — e.g.
> `https://you.github.io/repo-name/#/admin`. This works identically
> regardless of subpath, domain, or host, with zero configuration.

Because most people testing this won't physically drive to Kerala, `/admin`
has a **Demo Journey** panel with buttons for every distance band (5 km, 3
km, 1 km, 500 m, 200 m, 100 m), plus Arrived, Departed, and Thank You.

These buttons broadcast over a `BroadcastChannel` (built into the browser,
no dependency) to any other tab on the same origin that's showing the
guest invitation — so the standard demo flow is:

1. Open the invitation (`/`) in one tab, RSVP, and start the journey so
   you're on the live map screen.
2. Open `/#/admin` in a second tab.
3. Click through **START → 5 KM → 3 KM → 1 KM → 500 M → 200 M → 100 M →
   ARRIVED → DEPARTED → THANK YOU** and watch the first tab transition
   through every state, including the arrival reveal animation.

If `BroadcastChannel` isn't supported by the browser, the demo buttons
simply have no cross-tab effect — everything else still works.

The `/admin` dashboard also shows **clearly labelled demo statistics**
(invitation opens, confirmed, on the way, nearby, arrived, departed) — these
are static placeholder numbers, not a real live dashboard, because there is
no backend collecting data from guests' devices.

## Event Settings (local overrides)

`/admin` → **Event Settings** lets you edit house name, host names, date,
time, address, coordinates, radii, delay, and the EN/ML welcome & thank-you
messages. These edits are saved to `localStorage` in *your* browser only —
they're for demoing/tuning the copy quickly. For the real deployed build
that every guest sees, edit `src/config/event.ts` directly and redeploy.

## RSVP & personalisation

The invitation's "Majlis" chapter (`src/features/invitation/StoryPage.tsx`)
collects a Yes/Maybe/No RSVP, a headcount (1–8, editable any time), an
optional list of who's coming with them (free text, shown once headcount
is above 1), and an optional dietary-preferences note — all saved locally
per guest (`storageService.ts`) and, if configured, forwarded to the
host's Google Sheet (see [Seeing RSVPs as a host](#seeing-rsvps-as-a-host)).

Setting `rsvpByDate` in `src/config/event.ts` (or `/admin` → Event
Settings) shows a gentle "Kindly RSVP by …" reminder to guests who
haven't responded yet; it disappears once the date passes or they RSVP.
Leave it null (the default) to skip the reminder.

`/admin` → **Personalised Links** generates a per-guest link (`?to=<name>`)
that greets that guest by name, plus an optional personal note
(`&note=<text>`, e.g. "Reserved seating for you") shown just below their
name on the invitation — both are stripped from the URL and saved to that
guest's device on first open.

The same tool has a **Bulk generate** box: paste one guest per line —
`Name` or `Name | personal note` — to get every link generated at once,
each with its own copy button, plus a **Copy All** button that copies
`Name: link` for every guest as one block of text (handy for pasting into
a spreadsheet, or working through one by one on WhatsApp). Nothing here
is saved anywhere; it's regenerated from the pasted list each time.

## Weather

`src/services/weatherService.ts` (free, no key, [Open-Meteo](https://open-meteo.com))
does two different things:

- **Live conditions right now** at DUA's coordinates — shown as "Weather
  at DUA: 24°C, Light rain" whenever a guest is browsing the invitation.
- **The actual event-day forecast** (`getEventDayForecast`), shown as a
  "☔ Rain is expected — consider carrying an umbrella" tip. Forecast
  APIs only cover roughly the next 16 days, so for most of this event's
  lifetime (DUA is over a year out) this simply has nothing to show yet
  — the tip only appears once the event date comes within that window,
  automatically, with no action needed.

## Prayer times

`src/services/prayerTimesService.ts` (free, no key,
[Aladhan API](https://aladhan.com/prayer-times-api)) shows Dhuhr and Asr
prayer times at DUA's coordinates on the event date, since the 11 AM–4 PM
window typically spans both. Unlike weather, prayer times are
astronomically calculable for any date — this works today even though
DUA is over a year out. Uses calculation method 1 (University of Islamic
Sciences, Karachi), the common convention across South Asia; change the
`method` parameter in that file if your local convention differs.

## Meet the Hosts

Setting `hostsBioEn`/`hostsBioMl` in `src/config/event.ts` (or `/admin` →
Event Settings) shows a short bio card in the invitation's opening
chapter — useful for guests who are distant relatives or friends-of-
friends and may not know Majeed & Kamarunnisa well. `hostsPhotoUrl` adds
a circular photo alongside it (a path into `public/`, e.g. `/hosts.jpg`,
or any external image URL). Leave the bio fields null (the default) to
skip the card entirely.

## Landmark note for the last stretch

Setting `arrivalLandmarkNoteEn`/`arrivalLandmarkNoteMl` in
`src/config/event.ts` (or `/admin` → Event Settings) — e.g. "Look for
the blue gate past the mosque" — shows a short note on the Journey map
once the guest is nearby. Addresses often aren't precise enough on their
own, even with GPS, especially in rural areas. Leave both null (the
default) to skip.

## Save the host's contact

The Contact sheet (tap "Contact Hosts" from the invitation) has a
**💾 Save Contact** button alongside Call/WhatsApp that downloads a
`.vcf` file, so the host's number goes straight into the guest's phone
contacts rather than staying tap-to-call only.

## Travelling from afar

Setting `travelInfo` in `src/config/event.ts` (or `/admin` → Event
Settings) — `{ nearestAirport, nearestRailwayStation }` — shows a
"Travelling From Afar?" card for extended family coming from outside
Kerala or abroad. Leave it `null` (the default) to skip entirely.

## Shared photo album

Setting `photoAlbumUrl` in `src/config/event.ts` (or `/admin` → Event
Settings) to a Google Photos/Drive (or any) shared-album link shows a
"📸 Share Your Photos" prompt on the Event Mode screen once a guest has
arrived, so everyone's pictures from the day end up in one place. Leave
it `null` (the default) to skip entirely.

## Larger text

A small "A+" toggle next to the language switcher scales the whole
page's root font size (persisted per device via `localStorage`) — since
every size in this app uses Tailwind's default rem-based scale, this
grows every piece of text and spacing proportionally with no
per-component work. For older relatives who find the default size small.

## Day-of programme

Setting `scheduleItems` in `src/config/event.ts` (a list of
`{ time, titleEn, titleMl }`) shows a simple timeline — e.g. "11:00 AM —
Guests welcomed at the gate" — on the Event Mode screen once a guest has
actually arrived, so they know what's happening next. Ships with a
sensible default programme; set it to `[]` to skip the timeline entirely.

## Remind me on the day

The Veranda chapter has an optional **🔔 Remind Me** button that requests
notification permission and, from then on, shows a local "Today's the
day!" notification if the guest has the app open (or reopens it) on the
event date. This is a same-day nudge, not a guaranteed advance alarm — a
browser tab can't reliably wake itself up unprompted days ahead with no
backend/push server, and this app deliberately has neither. Hidden
entirely on browsers without Notification API support.

## Language

English and Malayalam are both fully supported. Every string lives in
`src/data/translations.ts` as `{ en, ml }` pairs, looked up through the
`useLanguage()` hook / `t()` function. The language switcher persists the
choice to `localStorage`. To change or add copy, edit that one file — no
string is hardcoded in a component.

## Ask DUA (FAQ assistant)

The floating "Ask DUA" button is a **local, offline keyword matcher** — see
`src/data/faq.ts` and `matchFaq()`. It does not call any AI API (no
OpenAI/Claude/Gemini/etc.) — it's a small predefined Q&A list matched by
substring, bilingual, with quick actions like "Start Journey" or "Call
Host" where relevant.

## Guestbook

`/` → after Thank You → **Leave a Message** saves a name + message to
`localStorage` on that guest's own device (`src/services/storageService.ts`).
There is no backend, so hosts cannot see these messages from a dashboard by
default — the storage layer (`storageService.ts`) is deliberately isolated
so a real backend could be plugged in later without touching any UI
component. See the next section for a free, optional way to see them live.

## Seeing RSVPs as a host

By default, RSVPs and guestbook messages are saved only on each guest's own
phone (see above) — nobody else can see them. If you want to see them
yourself as they come in, `src/services/notifyHostService.ts` can send a
copy of every RSVP, guestbook message, **and arrival** (the moment a
guest's Journey confirms they've reached DUA — not fired by `/admin` demo
testing) to a **free Google Sheet**, with no backend, no server, and no
cost. It's entirely optional and off by default. This same setup also
powers three more optional, purely additive features that read the
Sheet back:

- the "🎉 N guests confirmed so far" counter on the invitation
  (`src/services/guestCountService.ts`)
- the [live announcement banner](#live-announcement-banner) below
- [Event Display Mode](#event-display-mode-wall) — the `/wall` screen

Skip either part of the script below if you don't want that feature —
everything else still works without it.

### Setup (about 5 minutes, free Google account only)

1. Create a new Google Sheet (any name).
2. In it, go to **Extensions → Apps Script**, delete the placeholder code,
   and paste this:

   ```js
   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     const data = JSON.parse(e.postData.contents);
     sheet.appendRow([
       new Date(data.timestamp),
       data.type, // 'rsvp' | 'guestbook' | 'arrival'
       data.guestName,
       data.rsvpStatus ?? '',
       data.guests ?? '',
       data.dietaryNotes ?? '',
       data.guestNames ?? '',
       data.message ?? '',
       data.hasVoiceMessage ? 'yes' : '',
       data.guestId,
       data.isPublic ? 'yes' : '', // guestbook consent for the Event Display Mode wall
     ]);
     return ContentService.createTextOutput('OK');
   }

   // Powers the "N guests confirmed" counter, the live announcement
   // banner, and Event Display Mode's arrival celebrations + blessings
   // wall — all on the invitation/wall pages, none of it needs a
   // redeploy to change.
   function doGet() {
     const ss = SpreadsheetApp.getActiveSpreadsheet();
     const sheet = ss.getActiveSheet();
     const rows = sheet.getDataRange().getValues();
     // Columns: timestamp, type, guestName, rsvpStatus, guests,
     // dietaryNotes, guestNames, message, hasVoiceMessage, guestId, isPublic

     // Keeps only each guest's MOST RECENT "yes" RSVP (so someone who
     // later changes their headcount, or switches to "no", isn't
     // double-counted) and sums up the party sizes.
     const latestByGuest = {};
     rows.forEach((row) => {
       const [timestamp, type, , rsvpStatus, guests, , , , , guestId] = row;
       if (type !== 'rsvp' || !guestId) return;
       const existing = latestByGuest[guestId];
       if (!existing || new Date(timestamp) >= new Date(existing.timestamp)) {
         latestByGuest[guestId] = { timestamp, rsvpStatus, guests };
       }
     });
     const confirmedGuests = Object.values(latestByGuest)
       .filter((g) => g.rsvpStatus === 'yes')
       .reduce((sum, g) => sum + (Number(g.guests) || 0), 0);

     // Most recent arrivals first, for Event Display Mode's celebration
     // toasts — capped so the response stays small.
     const recentArrivals = rows
       .filter((row) => row[1] === 'arrival')
       .sort((a, b) => new Date(b[0]) - new Date(a[0]))
       .slice(0, 15)
       .map((row) => row[2]);

     // Only guestbook messages the guest explicitly consented to show
     // (column 11 === 'yes'), most recent first, for the blessings wall.
     const wallMessages = rows
       .filter((row) => row[1] === 'guestbook' && row[10] === 'yes')
       .sort((a, b) => new Date(b[0]) - new Date(a[0]))
       .slice(0, 20)
       .map((row) => ({ name: row[2], message: row[7] }));

     // Optional: an "Announcement" tab, cell A1 = your message. Leave the
     // tab out (or A1 empty) to send no announcement — see "Live
     // announcement banner" below.
     const announcementSheet = ss.getSheetByName('Announcement');
     const announcement = announcementSheet ? String(announcementSheet.getRange('A1').getValue() || '') : '';

     return ContentService
       .createTextOutput(JSON.stringify({ confirmedGuests, announcement, recentArrivals, wallMessages }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. Click **Deploy → New deployment → Web app**. Set "Execute as" to
   **Me** and "Who has access" to **Anyone**. Deploy, and authorize it
   with your Google account when prompted.
4. Copy the Web app URL it gives you (ends in `/exec`).
5. Paste it into `src/config/event.ts` as `hostNotifyWebhookUrl`, or
   paste it into `/admin` → Event Settings → **Host Notifications Webhook
   URL** to try it first without redeploying.

From then on, every RSVP (including headcount, guest-name, and
dietary-note changes),
every arrival, and every guestbook message appends a row to that Sheet —
open it on your phone or laptop any time to see responses live, with no
dashboard, login, or app to build. Leaving the field blank (the default)
sends nothing anywhere.

Because Apps Script Web Apps don't return browser-readable CORS headers
for POST, that part uses a fire-and-forget `no-cors` request — it never
blocks or fails a guest's RSVP/guestbook submission even if the Sheet is
unreachable, full, or the URL is wrong; the guest's own local copy is
unaffected either way. The `doGet` counter read is a plain GET with no
custom headers, which Apps Script does serve with normal CORS headers, so
that one can be read back and shown on the page.

### Exporting responses as a CSV

No extra code needed — this is a built-in Google Sheets feature. Open the
Sheet and use **File → Download → Comma-separated values (.csv)**. Do
this any time to get a spreadsheet snapshot of every response so far, or
share the Sheet itself (**Share** button) with anyone who's helping with
the guest list.

## Live announcement banner

Requires the `hostNotifyWebhookUrl` setup above. Lets you push a
last-minute update to every guest currently on the invitation — e.g.
"Starting 30 minutes late" — **without redeploying the app**.

In the same Google Sheet, add a second tab named exactly `Announcement`
and put your message in cell `A1`. Within a few seconds of a guest
loading (or reopening) the invitation, `src/components/AnnouncementBanner.tsx`
shows it as a dismissible banner at the top of the screen. Clear cell A1
(or delete the tab) to stop showing it. A guest who dismisses one message
will still see a *different* later message — dismissal is remembered
per exact text, not as a one-time "seen it" flag.

## Event Display Mode (`/wall`)

Requires the `hostNotifyWebhookUrl` setup above. A separate screen at
`/#/wall` (`src/features/display/DisplayWallPage.tsx` — e.g.
`https://you.github.io/repo-name/#/wall`, see the routing note under
[Demo Mode](#demo-mode)), meant to be cast to a TV or projector **at the
venue itself** rather than opened on a guest's own phone — turning the
invitation from something everyone experiences alone into a shared
moment in the room:

- **Before the event**: a large ambient countdown to the start time.
- **During/after**: the live confirmed-guest count, a celebratory toast
  each time a new arrival comes in ("🎉 Ahmed has arrived!") pulled from
  the same Sheet used for [Seeing RSVPs as a host](#seeing-rsvps-as-a-host),
  and a slow auto-scrolling wall of guestbook blessings.

Guestbook messages only appear on the wall if the guest explicitly
ticked **"Show my message on the screen at the venue"** when writing
it — nothing is shown publicly without that consent. Everything on this
page degrades gracefully to just the header and countdown if the webhook
isn't configured; it never shows an error. Polls the Sheet every 15
seconds while the page stays open (e.g. left running on a TV all day),
independent of the single-fetch guest count shown elsewhere.

## AR compass to DUA

On the Journey map, tapping the 🧭 button (top-right, next to the back
button) requests compass access and then shows an arrow that always
points toward DUA, using the phone's device-orientation heading
(`src/hooks/useDeviceHeading.ts`) combined with the bearing from the
guest's current position to DUA's coordinates. A playful "which way do I
go" aid layered on top of the map/route, especially fun for kids. iOS
requires the tap (compass permission needs a user gesture); most other
browsers just start working. Hides itself entirely on devices/browsers
with no compass to give.

## Privacy & geolocation safety

- Location is opt-in, requested only when the guest starts a Journey.
- No continuous GPS trail is ever stored — only the latest position (in
  memory) and journey milestone timestamps (in `localStorage`).
- A guest's location is never shown to other guests or displayed publicly.
- **Stop Journey** clears the GPS watcher immediately.

## PWA & offline behaviour

The app is installable (manifest + service worker via `vite-plugin-pwa`,
`strategies: 'injectManifest'` with a small hand-written service worker at
`src/sw.ts`). It precaches the app shell — invitation screens, translations,
FAQ data, static assets — so RSVP, event details, and the FAQ all work
offline. The MapLibre bundle is code-split and cached opportunistically the
first time a guest visits the map, rather than bloating the initial
install. Map tiles and OSRM routing are always fetched live and never
cached — if they're unreachable, the in-app fallback messages ("map/route
is taking a moment to load ❤️") take over instead of a broken PWA cache.

Being installable doesn't mean guests will think to install it, so
`src/components/InstallAppBanner.tsx` shows a one-time, dismissible nudge
once the app is actually installable: a real **Install** button on
Android/Chrome (via the native `beforeinstallprompt` event), or short
"Tap Share → Add to Home Screen" steps on iOS Safari, which never fires
that event. Hidden entirely once the app is already running installed,
or once a guest dismisses it.

The app is **not** installation-gated — it works fully the moment the
WhatsApp link is opened in a normal mobile browser tab.

## Testing arrival without travelling

Two ways:

1. **Demo Mode** (recommended) — see [above](#demo-mode).
2. **Real GPS, at your desk** — most browser dev tools let you override
   geolocation coordinates (in Chrome: DevTools → ⋮ → More tools →
   Sensors → Location). Set the override to DUA's coordinates (or just
   inside `arrivalRadius` of them) and start a real Journey; the app will
   confirm arrival after a few consecutive readings, exactly as it would
   in the field.

## Deployment (free hosting)

Both options below need **no credit card and no paid plan**.

### GitHub Pages — already set up

This repo is already deployed this way (see the **Live** link at the top).
`.github/workflows/deploy.yml` builds with `npm run build` and publishes
`dist/` via the standard `actions/deploy-pages` flow on every push to
`master`, plus manual runs via **Actions → Deploy to GitHub Pages → Run
workflow**. Pages is enabled with **Source: GitHub Actions** in the repo's
**Settings → Pages**. `vite.config.ts` sets `base: './'` (relative paths),
so the build works unmodified from a project subpath
(`username.github.io/repo-name/`) or a user/org root site.

To set this up on a fork or a different repo from scratch: push the repo
to GitHub, then either copy this same workflow file, or go to
**Settings → Pages**, set **Source** to "GitHub Actions", and let GitHub
suggest a starter workflow.

### Cloudflare Pages

1. Push this repo to GitHub/GitLab and connect it in the Cloudflare Pages
   dashboard (free tier, no card required), **or** deploy directly from
   your machine:
   ```bash
   npm run build
   npx wrangler pages deploy dist
   ```
2. Build command: `npm run build`. Build output directory: `dist`.
3. No environment variables are required.

## Project structure

```
src/
  config/event.ts        # all event data — the single source of truth
  data/
    translations.ts      # EN/ML strings (incl. the Arabic Bismillah line)
    faq.ts                # local Ask DUA keyword/intent data
  services/
    geolocationService.ts # navigator.geolocation wrapper
    routingService.ts     # OSRM + straight-line fallback
    mapService.ts          # MapLibre init, markers, route drawing
    journeyService.ts      # pure distance/arrival/departure state logic
    weatherService.ts      # live conditions + event-day forecast (Open-Meteo)
    prayerTimesService.ts  # Dhuhr/Asr times at DUA (Aladhan API)
    storageService.ts      # typed localStorage/sessionStorage access
    adminConfigService.ts  # local /admin Event Settings overrides
    notifyHostService.ts   # optional fire-and-forget webhook to a Google Sheet
    guestCountService.ts   # optional read-back of live guest count/announcement/wall data
  utils/
    pwaInstall.ts           # beforeinstallprompt/iOS/standalone detection
    notifications.ts        # local "remind me on the day" notification helper
  hooks/                  # useLanguage, useEventConfig, useJourney, useGuestCount,
                           # useEventDayForecast, useEventDayReminder, usePrayerTimes,
                           # useTextScale, useDeviceHeading
  features/
    invitation/           # opening, welcome, RSVP, event details, contact
    journey/               # intro, permission, arrival reveal, event mode, thank you
    map/                    # JourneyMap (MapLibre screen)
    guestbook/
    faq/                    # Ask DUA floating widget
    admin/                  # /admin dashboard, demo controls, settings form
    display/                # /wall — Event Display Mode, for a TV at the venue
  components/             # Button, Card, BottomSheet, LanguageSwitcher, HomeIllustration,
                           # AnnouncementBanner, InstallAppBanner, TextSizeToggle, CompassArrow
  sw.ts                   # custom service worker (injectManifest)
```

## No parking

Per the brief, there is intentionally no parking feature, section, map
layer, or FAQ entry anywhere in this project.
