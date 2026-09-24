/**
 * Single source of truth for all event data. Edit this file (or use the
 * /admin Event Settings screen for local overrides) to update the
 * invitation without touching any component code.
 */

export interface EventConfig {
  houseName: string;
  hostNames: string;
  eventDate: string; // YYYY-MM-DD, interpreted in Asia/Kolkata
  startTime: string; // HH:mm, 24h
  endTime: string; // HH:mm, 24h
  address: string;
  addressLines: [string, string];
  phone: string;

  /**
   * REQUIRED before the Journey Experience / map can function.
   * Leave null until the real coordinates for DUA are known — the app
   * will show a friendly "location not configured yet" state instead of
   * crashing.
   */
  latitude: number | null;
  longitude: number | null;

  /** metres — guest is told DUA is nearby */
  nearbyRadius: number;
  /** metres — guest is considered arrived */
  arrivalRadius: number;
  /** minutes outside the geofence before DEPARTED fires */
  departureDelayMinutes: number;

  /**
   * OPTIONAL. A free Google Apps Script Web App URL that receives a POST
   * whenever a guest RSVPs or leaves a guestbook message, so hosts can see
   * responses in a Google Sheet — see "Seeing RSVPs as a host" in the
   * README for the 5-minute, no-cost setup. Leave null to skip this
   * entirely; nothing breaks, guests just stay local-only as before.
   */
  hostNotifyWebhookUrl: string | null;

  /**
   * OPTIONAL. YYYY-MM-DD "kindly respond by" date shown to guests who
   * haven't RSVP'd yet. Leave null to skip the reminder entirely.
   */
  rsvpByDate: string | null;

  /**
   * OPTIONAL. The day-of programme, shown as a timeline on the Event Mode
   * screen once a guest has arrived. Each item is a rough time label
   * (already-formatted text, not parsed — e.g. "11:00 AM") plus EN/ML
   * titles. Leave as an empty array to skip the schedule entirely.
   */
  scheduleItems: { time: string; titleEn: string; titleMl: string }[];

  /**
   * OPTIONAL. Shown as a "Travelling From Afar?" card for extended family
   * coming from outside Kerala or abroad. Leave null to skip entirely.
   */
  travelInfo: { nearestAirport: string; nearestRailwayStation: string } | null;

  /**
   * OPTIONAL. A shared Google Photos/Drive album link — shown as a
   * "Share Your Photos" prompt once a guest has arrived. Leave null to
   * skip entirely.
   */
  photoAlbumUrl: string | null;

  welcomeMessageEn: string;
  welcomeMessageMl: string;
  arrivalMessageEn: string;
  arrivalMessageMl: string;
  thankYouMessageEn: string;
  thankYouMessageMl: string;
}

export const eventConfig: EventConfig = {
  houseName: 'DUA',
  hostNames: 'Majeed & Kamarunnisa',
  eventDate: '2026-10-18',
  startTime: '11:00',
  endTime: '16:00',
  address: 'Thonichra, Naduvattom, Kerala, India',
  addressLines: ['Thonichra', 'Naduvattom, Kerala'],
  phone: '9847704490',

  latitude: null,
  longitude: null,

  nearbyRadius: 1000,
  arrivalRadius: 150,
  departureDelayMinutes: 7,

  hostNotifyWebhookUrl: null,
  rsvpByDate: null,

  scheduleItems: [
    { time: '11:00 AM', titleEn: 'Guests welcomed at the gate', titleMl: 'ഗേറ്റിൽ അതിഥികളെ സ്വാഗതം ചെയ്യുന്നു' },
    { time: '11:30 AM', titleEn: 'Majlis & Dua', titleMl: 'മജ്‌ലിസും ദുആയും' },
    { time: '12:30 PM', titleEn: 'Lunch', titleMl: 'ഉച്ചഭക്ഷണം' },
    { time: '4:00 PM', titleEn: 'Programme concludes', titleMl: 'പരിപാടി അവസാനിക്കുന്നു' },
  ],

  travelInfo: null,
  photoAlbumUrl: null,

  welcomeMessageEn:
    'With the blessings of Allah, we are beginning a beautiful new chapter in our new home. We would be delighted to have you with us as we celebrate this special day.',
  welcomeMessageMl:
    'അല്ലാഹുവിന്റെ അനുഗ്രഹത്തോടെ ഞങ്ങളുടെ പുതിയ ഭവനത്തിൽ ഒരു പുതിയ അധ്യായത്തിന് തുടക്കം കുറിക്കുകയാണ്. ഈ സന്തോഷകരമായ വേളയിൽ താങ്കളുടെയും കുടുംബത്തിന്റെയും സാന്നിധ്യം സ്നേഹപൂർവ്വം പ്രതീക്ഷിക്കുന്നു.',

  arrivalMessageEn:
    'Assalamu Alaikum! We are so happy to welcome you to our new home. May Allah fill this home with peace, happiness and barakah.',
  arrivalMessageMl:
    'അസ്സലാമു അലൈക്കും! ഞങ്ങളുടെ പുതിയ ഭവനത്തിലേക്ക് താങ്കളെ സ്നേഹപൂർവ്വം സ്വാഗതം ചെയ്യുന്നു. ഈ ഭവനം സമാധാനവും സന്തോഷവും ബറക്കത്തും നിറഞ്ഞതാകട്ടെ എന്ന് പ്രാർത്ഥിക്കുന്നു.',

  thankYouMessageEn:
    'Your presence made our house-warming even more special. Thank you for taking the time to celebrate this beautiful beginning with us. May Allah bless you and your family with happiness, peace and barakah.',
  thankYouMessageMl:
    'ഞങ്ങളുടെ ഗൃഹപ്രവേശനത്തിന്റെ സന്തോഷത്തിൽ പങ്കുചേർന്ന് ഞങ്ങളെ അനുഗ്രഹിച്ചതിന് ഹൃദയം നിറഞ്ഞ നന്ദി. അല്ലാഹു നിങ്ങളെയും കുടുംബത്തെയും സന്തോഷത്തോടെയും സമാധാനത്തോടെയും ബറക്കത്തോടെയും അനുഗ്രഹിക്കട്ടെ.',
};

export const hasCoordinates = (
  cfg: EventConfig = eventConfig,
): cfg is EventConfig & { latitude: number; longitude: number } =>
  typeof cfg.latitude === 'number' && typeof cfg.longitude === 'number';

// Fallback straight-line route is only used if OSRM routing fails AND no
// real coordinates make a computed line possible some other way. Kept
// configurable per the "no dependency on one external service" requirement.
export const routingConfig = {
  osrmBaseUrl: 'https://router.project-osrm.org',
  requestTimeoutMs: 6000,
};

export const mapConfig = {
  primaryStyleUrl: 'https://tiles.openfreemap.org/styles/liberty',
  fallbackRasterStyle: {
    version: 8 as const,
    sources: {
      osm: {
        type: 'raster' as const,
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors',
      },
    },
    layers: [
      {
        id: 'osm-tiles',
        type: 'raster' as const,
        source: 'osm',
      },
    ],
  },
};
