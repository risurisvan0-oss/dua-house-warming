import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LanguageProvider, useLanguage } from './hooks/useLanguage';
import { useJourney } from './hooks/useJourney';
import { useEventConfig } from './hooks/useEventConfig';
import { storageService } from './services/storageService';
import type { JourneyState } from './services/journeyService';
import { hasCoordinates } from './config/event';
import { shareInvitation } from './utils/contact';
import { updateAppBadge } from './utils/appBadge';
import { eventStartDateTime } from './utils/dateTime';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { BottomSheet } from './components/BottomSheet';
import { DoorsOpening } from './features/invitation/DoorsOpening';
import { StoryPage } from './features/invitation/StoryPage';
import { ContactButtons } from './features/invitation/ContactButtons';
import { LocationPermissionPage } from './features/journey/LocationPermissionPage';
import { ArrivalReveal } from './features/journey/ArrivalReveal';
import { EventModePage } from './features/journey/EventModePage';
import { ThankYouPage } from './features/journey/ThankYouPage';
import { GuestbookForm } from './features/guestbook/GuestbookForm';
import { AskDuaWidget } from './features/faq/AskDuaWidget';

// MapLibre and the admin console are only needed once a guest actually
// starts a journey (or visits /admin) — code-split them out of the main
// invitation bundle so the first cinematic screen loads fast on mobile data.
const JourneyMap = lazy(() => import('./features/map/JourneyMap').then((m) => ({ default: m.JourneyMap })));
const AdminDashboard = lazy(() =>
  import('./features/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
);

type Screen =
  | 'opening'
  | 'story'
  | 'permission'
  | 'map'
  | 'arrival'
  | 'eventMode'
  | 'thankYou'
  | 'guestbook';

const ACTIVE_JOURNEY_STATES: JourneyState[] = [
  'JOURNEY_STARTED',
  'ON_THE_WAY',
  'GETTING_CLOSER',
  'ALMOST_THERE',
  'NEARBY',
];

function computeInitialScreen(): Screen {
  if (storageService.getDepartedAt()) return 'thankYou';
  const journeyState = storageService.getJourneyState();
  if (journeyState === 'ARRIVED') return 'eventMode';
  if (journeyState && ACTIVE_JOURNEY_STATES.includes(journeyState)) return 'map';
  if (storageService.hasSeenOpening()) return 'story';
  return 'opening';
}

function GuestApp() {
  const [screen, setScreen] = useState<Screen>(() => computeInitialScreen());
  const [contactOpen, setContactOpen] = useState(false);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const journey = useJourney();
  const eventConfig = useEventConfig();
  const { t } = useLanguage();

  useEffect(() => {
    storageService.markInvitationOpened();
  }, []);

  // For guests who install the PWA, show a live "days left" badge on the
  // home-screen icon — a no-op on browsers without the Badging API.
  useEffect(() => {
    updateAppBadge(eventStartDateTime());
  }, [eventConfig.eventDate, eventConfig.startTime]);

  // Reopening mid-journey after a reload: the GPS watcher doesn't survive
  // a page reload, so restart it (the browser already has permission).
  useEffect(() => {
    if (screen === 'map' && !journey.watching && hasCoordinates(eventConfig)) {
      journey.resume();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live transitions driven by real GPS confirmation or /admin demo mode.
  useEffect(() => {
    if (journey.journeyState === 'ARRIVED' && (screen === 'map' || screen === 'permission')) {
      setScreen('arrival');
    }
    if (journey.journeyState === 'THANK_YOU') {
      setScreen('thankYou');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey.journeyState]);

  // Once a location watch is actually live, leave the permission screen.
  useEffect(() => {
    if (screen === 'permission' && journey.watching) {
      setScreen('map');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey.watching]);

  const handleEnterInvitation = () => {
    storageService.markOpeningSeen();
    setScreen('story');
  };

  const handleAllowLocation = async () => {
    setRequestingLocation(true);
    await journey.start();
    setRequestingLocation(false);
  };

  const handleBackFromMap = () => {
    journey.stop();
    setScreen('story');
  };

  const handleShare = async () => {
    const result = await shareInvitation(window.location.href);
    if (result === 'copied') {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  const showTopBar = !['opening', 'map', 'arrival'].includes(screen);

  return (
    <div className="relative">
      {showTopBar && (
        <div className="fixed top-[max(0.75rem,env(safe-area-inset-top))] inset-x-4 z-20 flex justify-between">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={handleShare}
            className="rounded-full bg-ivory/90 border border-forest/15 px-3 py-1.5 text-xs font-semibold text-forest shadow"
          >
            🔗 {t('shareInvitation')}
          </button>
        </div>
      )}

      {shareToast && (
        <div className="fixed top-16 inset-x-0 z-30 flex justify-center px-4">
          <div className="rounded-full bg-forest text-ivory text-xs px-4 py-2 shadow-lg">{t('linkCopied')}</div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {screen === 'opening' && <DoorsOpening key="opening" onEnter={handleEnterInvitation} />}
        {screen === 'story' && (
          <motion.div key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StoryPage onStartJourney={() => setScreen('permission')} onOpenContact={() => setContactOpen(true)} />
          </motion.div>
        )}
        {screen === 'permission' && (
          <LocationPermissionPage
            key="permission"
            onAllow={handleAllowLocation}
            onSkip={() => setScreen('story')}
            requesting={requestingLocation}
            denied={journey.error === 'denied' || journey.error === 'unsupported' || journey.error === 'unavailable'}
            notConfigured={journey.error === 'notConfigured'}
          />
        )}
        {screen === 'map' && hasCoordinates(eventConfig) && (
          <Suspense
            key="map"
            fallback={
              <div className="min-h-dvh flex items-center justify-center bg-cream text-sm text-charcoal/50">
                {t('mapLoadingNotice')}
              </div>
            }
          >
            <JourneyMap
              destination={{ latitude: eventConfig.latitude, longitude: eventConfig.longitude }}
              userPosition={journey.userPosition}
              distanceMeters={journey.distanceMeters}
              journeyState={journey.journeyState}
              messageKey={journey.messageKey}
              isNearby={journey.isNearby}
              watching={journey.watching}
              paused={journey.paused}
              onStop={journey.stop}
              onResume={journey.resume}
              onBack={handleBackFromMap}
            />
          </Suspense>
        )}
        {screen === 'arrival' && <ArrivalReveal key="arrival" onEnter={() => setScreen('eventMode')} />}
        {screen === 'eventMode' && <EventModePage key="eventMode" />}
        {screen === 'thankYou' && (
          <ThankYouPage key="thankYou" onLeaveMessage={() => setScreen('guestbook')} />
        )}
        {screen === 'guestbook' && <GuestbookForm key="guestbook" onDone={() => setScreen('thankYou')} />}
      </AnimatePresence>

      {!['opening', 'arrival'].includes(screen) && (
        <AskDuaWidget onStartJourney={() => setScreen('permission')} />
      )}

      <BottomSheet open={contactOpen} onClose={() => setContactOpen(false)} title={t('contactHosts')}>
        <ContactButtons />
      </BottomSheet>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<GuestApp />} />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<div className="min-h-dvh bg-cream" />}>
              <AdminDashboard />
            </Suspense>
          }
        />
      </Routes>
    </LanguageProvider>
  );
}

export default App;
