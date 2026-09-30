import { useState } from 'react';
import { motion } from 'framer-motion';
import { HomeIllustration } from '../../components/HomeIllustration';
import { useEventConfig } from '../../hooks/useEventConfig';
import { useLanguage } from '../../hooks/useLanguage';
import { storageService } from '../../services/storageService';
import { getEventPhase } from '../../utils/dateTime';
import { WelcomeChat } from './modals/WelcomeChat';
import { RsvpChat } from './modals/RsvpChat';
import { TheDayChat } from './modals/TheDayChat';
import { GettingThereChat } from './modals/GettingThereChat';

type ModalKey = 'welcome' | 'rsvp' | 'day' | 'gettingThere';

interface Hotspot {
  key: ModalKey;
  icon: string;
  labelKey: 'hotspotWelcome' | 'hotspotRsvp' | 'hotspotDay' | 'hotspotGettingThere';
  /** Percentage position within the illustration's 4:3 frame. */
  top: string;
  left: string;
}

const HOTSPOTS: Hotspot[] = [
  { key: 'day', icon: '🏮', labelKey: 'hotspotDay', top: '10%', left: '50%' },
  { key: 'welcome', icon: '🪟', labelKey: 'hotspotWelcome', top: '48%', left: '22%' },
  { key: 'welcome', icon: '🪟', labelKey: 'hotspotWelcome', top: '48%', left: '78%' },
  { key: 'rsvp', icon: '🚪', labelKey: 'hotspotRsvp', top: '68%', left: '50%' },
  { key: 'gettingThere', icon: '🌴', labelKey: 'hotspotGettingThere', top: '98%', left: '50%' },
];

function HotspotButton({
  hotspot,
  visited,
  badge,
  onOpen,
}: {
  hotspot: Hotspot;
  visited: boolean;
  badge?: string;
  onOpen: (key: ModalKey) => void;
}) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => onOpen(hotspot.key)}
      aria-label={t(hotspot.labelKey)}
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
      style={{ top: hotspot.top, left: hotspot.left }}
    >
      <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-ivory/95 text-xl shadow-lg">
        {!visited && (
          <motion.span
            className="absolute inset-0 rounded-full bg-gold/50"
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <span className="relative">{hotspot.icon}</span>
        {badge && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald text-[9px] text-ivory">
            {badge}
          </span>
        )}
      </span>
      <span className="whitespace-nowrap rounded-full bg-forest/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ivory">
        {t(hotspot.labelKey)}
      </span>
    </button>
  );
}

export function HouseScene({ onStartJourney }: { onStartJourney: () => void }) {
  const { t } = useLanguage();
  const eventConfig = useEventConfig();
  const [openModal, setOpenModal] = useState<ModalKey | null>(null);
  const [visited, setVisited] = useState<Set<ModalKey>>(new Set());
  const rsvpDone = !!storageService.getRsvp();
  const isLiveToday = getEventPhase() === 'live';

  const handleOpen = (key: ModalKey) => {
    setVisited((prev) => new Set(prev).add(key));
    setOpenModal(key);
  };

  return (
    <div className="islamic-pattern-bg paper-grain relative flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">{eventConfig.hostNames}</p>
      <h1 className="font-heading text-5xl italic text-forest">{eventConfig.houseName}</h1>
      {isLiveToday && (
        <p className="mt-2 w-fit rounded-full border border-gold-deep/40 bg-gold/20 px-4 py-1 text-sm font-semibold text-gold-deep">
          {t('eventIsLiveToday')}
        </p>
      )}
      <p className="mt-2 max-w-[18rem] text-sm text-charcoal/60">{t('exploreHouseHint')}</p>

      <div className="relative mt-6 w-full max-w-sm">
        <HomeIllustration className="h-auto w-full" />
        {HOTSPOTS.map((h, i) => (
          <HotspotButton
            key={`${h.key}-${i}`}
            hotspot={h}
            visited={visited.has(h.key) || (h.key === 'rsvp' && rsvpDone)}
            badge={h.key === 'rsvp' && rsvpDone ? '✓' : undefined}
            onOpen={handleOpen}
          />
        ))}
      </div>

      <WelcomeChat open={openModal === 'welcome'} onClose={() => setOpenModal(null)} />
      <RsvpChat open={openModal === 'rsvp'} onClose={() => setOpenModal(null)} />
      <TheDayChat open={openModal === 'day'} onClose={() => setOpenModal(null)} />
      <GettingThereChat
        open={openModal === 'gettingThere'}
        onClose={() => setOpenModal(null)}
        onStartJourney={onStartJourney}
      />
    </div>
  );
}
