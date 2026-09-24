import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HomeIllustration } from '../../components/HomeIllustration';
import { LatticeBorder } from '../../components/LatticeBorder';
import { useEventConfig } from '../../hooks/useEventConfig';
import { useLanguage } from '../../hooks/useLanguage';
import { useGuestCount } from '../../hooks/useGuestCount';
import { useCountdown } from '../../hooks/useCountdown';
import { eventStartDateTime, formatEventDate, formatEventTimeRange, getEventPhase } from '../../utils/dateTime';

const POLL_MS = 15_000;
const TOAST_MS = 6_000;

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="font-heading text-6xl sm:text-7xl text-ivory tabular-nums">{String(value).padStart(2, '0')}</div>
      <div className="mt-1 text-xs sm:text-sm uppercase tracking-[0.25em] text-gold">{label}</div>
    </div>
  );
}

/**
 * A dedicated screen meant to be cast to a TV/projector at the venue
 * itself — not something a guest opens on their own phone. Ambient
 * countdown before doors open, then a live "who just arrived"
 * celebration feed and a scrolling wall of guestbook blessings during
 * and after, all pulled from the same optional Google Sheet used
 * elsewhere (see README → "Event Display Mode"). Every piece degrades
 * gracefully to nothing if the webhook isn't configured — this page
 * never shows an error, just less.
 */
export function DisplayWallPage() {
  const eventConfig = useEventConfig();
  const { t } = useLanguage();
  const countdown = useCountdown(eventStartDateTime());
  const guestCount = useGuestCount(POLL_MS);
  const phase = getEventPhase();

  const [toast, setToast] = useState<string | null>(null);
  const seenArrivalsRef = useRef<Set<string>>(new Set());
  const toastQueueRef = useRef<string[]>([]);
  const toastTimerRef = useRef<number | null>(null);

  // Diff each new poll's recentArrivals against what's already been
  // celebrated, queueing genuinely new names rather than re-announcing
  // the same arrival on every 15s refresh.
  useEffect(() => {
    const arrivals = guestCount?.recentArrivals;
    if (!arrivals?.length) return;
    const fresh = arrivals.filter((name) => !seenArrivalsRef.current.has(`${name}`));
    fresh.forEach((name) => seenArrivalsRef.current.add(name));
    // Oldest-first into the queue so they announce in arrival order.
    toastQueueRef.current.push(...fresh.slice().reverse());
  }, [guestCount?.recentArrivals]);

  useEffect(() => {
    const tick = () => {
      const next = toastQueueRef.current.shift();
      setToast(next ?? null);
      toastTimerRef.current = window.setTimeout(tick, next ? TOAST_MS : 2000);
    };
    toastTimerRef.current = window.setTimeout(tick, 2000);
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const wallMessages = guestCount?.wallMessages ?? [];

  return (
    <div className="islamic-pattern-bg relative min-h-dvh overflow-hidden bg-forest text-cream flex flex-col items-center px-10 py-12">
      <LatticeBorder />

      <HomeIllustration className="w-20 h-auto mb-3 opacity-90" />
      <p className="text-sm uppercase tracking-[0.35em] text-gold">{eventConfig.hostNames}</p>
      <h1 className="font-heading text-5xl sm:text-6xl text-ivory mt-1">{eventConfig.houseName}</h1>
      <p className="mt-2 text-cream/70 text-base sm:text-lg">
        {formatEventDate()} · {formatEventTimeRange()}
      </p>

      {phase === 'before' && !countdown.isPast && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 flex gap-8 sm:gap-14">
          <CountdownBlock value={countdown.days} label="days" />
          <CountdownBlock value={countdown.hours} label="hrs" />
          <CountdownBlock value={countdown.minutes} label="min" />
          <CountdownBlock value={countdown.seconds} label="sec" />
        </motion.div>
      )}

      {phase !== 'before' && guestCount && guestCount.confirmedGuests > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-10 text-center">
          <div className="font-heading text-7xl text-gold">{guestCount.confirmedGuests}</div>
          <div className="mt-1 text-sm uppercase tracking-[0.25em] text-cream/70">{t('guestsConfirmedSoFar')}</div>
        </motion.div>
      )}

      {/* Live arrival celebration toast */}
      <div className="mt-10 h-20 w-full max-w-xl flex items-center justify-center">
        <AnimatePresence mode="wait">
          {toast && (
            <motion.div
              key={toast}
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="lantern-glow rounded-2xl bg-gold px-8 py-4 text-center"
            >
              <p className="font-heading text-2xl sm:text-3xl text-forest">🎉 {toast}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scrolling wall of consented guestbook blessings */}
      {wallMessages.length > 0 && (
        <div className="mt-8 w-full max-w-2xl overflow-hidden">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-gold mb-4">Messages of Blessing</p>
          <motion.div
            className="flex flex-col gap-4"
            animate={{ y: ['0%', '-50%'] }}
            transition={{ duration: Math.max(20, wallMessages.length * 6), repeat: Infinity, ease: 'linear' }}
          >
            {[...wallMessages, ...wallMessages].map((m, i) => (
              <div key={i} className="rounded-2xl border border-gold/25 bg-ivory/10 px-5 py-3.5">
                <p className="text-[15px] leading-relaxed text-cream/90">"{m.message}"</p>
                <p className="mt-1.5 text-xs uppercase tracking-wide text-gold">— {m.name}</p>
              </div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
