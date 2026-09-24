import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../../components/Button';
import { CountdownTimer } from '../../components/CountdownTimer';
import { HomeIllustration } from '../../components/HomeIllustration';
import { bismillahArabic } from '../../data/translations';
import { useEventConfig } from '../../hooks/useEventConfig';
import { useLanguage } from '../../hooks/useLanguage';
import { useWeather } from '../../hooks/useWeather';
import { useEventDayForecast } from '../../hooks/useEventDayForecast';
import { useEventDayReminder } from '../../hooks/useEventDayReminder';
import { useGuestCount } from '../../hooks/useGuestCount';
import { storageService, type RsvpStatus } from '../../services/storageService';
import { playChime } from '../../utils/chime';
import { calendarLink, eventStartDateTime, formatHijriEventDate, formatEventTimeRange, formatRsvpByDate, getEventPhase } from '../../utils/dateTime';
import { directionsLink } from '../../utils/contact';
import { notifyHost } from '../../services/notifyHostService';

const TZ = 'Asia/Kolkata';
const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, ease: 'easeOut' as const },
};

export function StoryPage({
  onStartJourney,
  onOpenContact,
}: {
  onStartJourney: () => void;
  onOpenContact: () => void;
}) {
  const { t, language } = useLanguage();
  const eventConfig = useEventConfig();
  const weather = useWeather(eventConfig);
  const eventDayForecast = useEventDayForecast(eventConfig);
  const guestCount = useGuestCount();
  const reminder = useEventDayReminder(eventConfig, language);
  const [guestNames, setGuestNames] = useState(storageService.getGuestNames());
  const guestName = storageService.getGuestName();
  const guestNote = storageService.getGuestNote();
  const [rsvp, setRsvp] = useState<RsvpStatus | null>(storageService.getRsvp());
  const [guests, setGuests] = useState(storageService.getGuests());
  const [dietaryNotes, setDietaryNotes] = useState(storageService.getDietaryNotes());
  const rsvpByDate = formatRsvpByDate();
  const [chapter, setChapter] = useState(0);
  const sections = useRef<(HTMLElement | null)[]>([]);

  const start = eventStartDateTime();
  const day = new Intl.DateTimeFormat('en-IN', { day: 'numeric', timeZone: TZ }).format(start);
  const monthYear = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: TZ }).format(start);
  const weekday = new Intl.DateTimeFormat('en-IN', { weekday: 'long', timeZone: TZ }).format(start);
  const hijri = formatHijriEventDate();
  const isLiveToday = getEventPhase() === 'live';
  const welcome = language === 'en' ? eventConfig.welcomeMessageEn : eventConfig.welcomeMessageMl;

  const chooseRsvp = (status: RsvpStatus) => {
    storageService.setRsvp(status);
    setRsvp(status);
    if (status === 'yes') {
      playChime();
      navigator.vibrate?.(30);
    }
    notifyHost({
      type: 'rsvp',
      guestId: storageService.getGuestId(),
      guestName: guestName ?? 'Guest',
      rsvpStatus: status,
      guests: status === 'yes' ? guests : undefined,
      dietaryNotes: status === 'yes' ? dietaryNotes || undefined : undefined,
      guestNames: status === 'yes' ? guestNames || undefined : undefined,
    });
  };
  const changeGuests = (next: number) => {
    const clamped = Math.max(1, Math.min(8, next));
    storageService.setGuests(clamped);
    setGuests(clamped);
    // Keep the host's headcount current if they've already RSVP'd yes.
    if (rsvp === 'yes') {
      notifyHost({
        type: 'rsvp',
        guestId: storageService.getGuestId(),
        guestName: guestName ?? 'Guest',
        rsvpStatus: 'yes',
        guests: clamped,
        dietaryNotes: dietaryNotes || undefined,
        guestNames: guestNames || undefined,
      });
    }
  };
  const handleDietaryBlur = () => {
    storageService.setDietaryNotes(dietaryNotes);
    if (rsvp === 'yes') {
      notifyHost({
        type: 'rsvp',
        guestId: storageService.getGuestId(),
        guestName: guestName ?? 'Guest',
        rsvpStatus: 'yes',
        guests,
        dietaryNotes: dietaryNotes || undefined,
        guestNames: guestNames || undefined,
      });
    }
  };
  const handleGuestNamesBlur = () => {
    storageService.setGuestNames(guestNames);
    if (rsvp === 'yes') {
      notifyHost({
        type: 'rsvp',
        guestId: storageService.getGuestId(),
        guestName: guestName ?? 'Guest',
        rsvpStatus: 'yes',
        guests,
        dietaryNotes: dietaryNotes || undefined,
        guestNames: guestNames || undefined,
      });
    }
  };

  const rsvpOptions: { id: RsvpStatus; label: string }[] = [
    { id: 'yes', label: t('rsvpYes') },
    { id: 'maybe', label: t('rsvpMaybe') },
    { id: 'no', label: t('rsvpNo') },
  ];
  const confirmation =
    rsvp === 'yes'
      ? `${t('rsvpYesResponse')} · ${guests} ${t('guestsWord')}`
      : rsvp === 'maybe'
        ? t('rsvpMaybeResponse')
        : rsvp === 'no'
          ? t('rsvpNoResponse')
          : '';

  const scrollTo = (i: number) => sections.current[i]?.scrollIntoView({ behavior: 'smooth' });
  const setRef = (i: number) => (el: HTMLElement | null) => {
    sections.current[i] = el;
  };

  return (
    <div className="relative bg-cream">
      {/* chapter dots */}
      <nav aria-label="Chapters" className="fixed right-2 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1">
        {[0, 1, 2, 3].map((i) => (
          <button key={i} type="button" onClick={() => scrollTo(i)} aria-label={`Chapter ${i + 1}`} className="flex h-8 w-6 items-center justify-center">
            <motion.span
              animate={{ height: chapter === i ? 26 : 8, backgroundColor: chapter === i ? '#b88a3e' : 'rgba(90,58,34,0.35)' }}
              transition={{ duration: 0.3 }}
              className="block w-2 rounded"
            />
          </button>
        ))}
      </nav>

      {/* I. Courtyard */}
      <motion.section
        ref={setRef(0)}
        onViewportEnter={() => setChapter(0)}
        viewport={{ amount: 0.5 }}
        className="paper-grain relative flex min-h-dvh flex-col items-center px-8 pb-10 pt-24 text-center bg-[linear-gradient(180deg,#f6ead2,#efe4d0)]"
      >
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">{t('chapterCourtyard')}</p>
        <motion.div {...reveal} className="mt-5 h-60 w-52 overflow-hidden rounded-t-full border-2 border-emerald bg-ivory">
          <HomeIllustration className="mt-14 h-auto w-[135%] max-w-none -translate-x-[13%]" />
        </motion.div>
        {guestName && (
          <motion.p {...reveal} className="mt-5 font-heading text-3xl italic text-gold-deep">
            {t('dearGuest')} {guestName},
          </motion.p>
        )}
        {guestNote && (
          <motion.p {...reveal} className="mt-2 max-w-[19rem] text-sm italic text-emerald">
            {guestNote}
          </motion.p>
        )}
        <motion.p {...reveal} dir="rtl" className="mt-3 font-display text-2xl text-forest">{bismillahArabic}</motion.p>
        <motion.p {...reveal} className="mt-4 max-w-[19rem] text-[15px] leading-relaxed text-charcoal/80">{welcome}</motion.p>
        <div className="flex-1" />
        <button type="button" onClick={() => scrollTo(1)} className="mt-8 flex flex-col items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-charcoal/55">
          {t('scrollToVeranda')}
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }} className="text-gold-deep">↓</motion.span>
        </button>
      </motion.section>

      {/* II. Veranda */}
      <motion.section
        ref={setRef(1)}
        onViewportEnter={() => setChapter(1)}
        viewport={{ amount: 0.5 }}
        className="paper-grain relative min-h-dvh bg-[#e6d3b0] px-7 pb-12 pt-16"
      >
        <div className="absolute inset-x-0 top-0 h-3.5 bg-[linear-gradient(180deg,#3b2416,#5a3a22)]" />
        <p className="text-center text-[11px] uppercase tracking-[0.3em] text-gold-deep">{t('chapterVeranda')}</p>
        {isLiveToday && (
          <p className="mx-auto mt-3 w-fit rounded-full border border-gold-deep/40 bg-gold/20 px-4 py-1 text-sm font-semibold text-gold-deep">
            {t('eventIsLiveToday')}
          </p>
        )}
        <motion.div {...reveal} className="mt-5 text-center">
          <div className="font-heading text-[9rem] font-medium leading-[0.85] text-forest">{day}</div>
          <div className="font-heading text-3xl italic text-emerald">{monthYear}</div>
          <div className="mt-2 text-[13px] text-charcoal/65">{weekday}{hijri ? ` · ${hijri}` : ''}</div>
        </motion.div>

        <motion.div {...reveal} className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-emerald/25 bg-ivory p-4">
            <p className="text-[10.5px] uppercase tracking-[0.2em] text-gold-deep">{t('timeLabel')}</p>
            <p className="mt-1.5 font-heading text-2xl leading-tight text-forest">{formatEventTimeRange()}</p>
          </div>
          <div className="rounded-2xl border border-emerald/25 bg-ivory p-4">
            <p className="text-[10.5px] uppercase tracking-[0.2em] text-gold-deep">{t('placeLabel')}</p>
            <p className="mt-1.5 font-heading text-2xl leading-tight text-forest">
              {eventConfig.addressLines[0]},<br />{eventConfig.addressLines[1].split(',')[0]}
            </p>
          </div>
        </motion.div>
        {weather && (
          <motion.p {...reveal} className="mt-3 rounded-2xl border border-emerald/25 bg-ivory px-4 py-3 text-[13px] text-forest">
            {t('weatherAtDua')}: {weather.temperatureCelsius}°C, {weather.description}
          </motion.p>
        )}
        {eventDayForecast?.isRainy && (
          <motion.p {...reveal} className="mt-2 rounded-2xl border border-gold-deep/25 bg-gold/10 px-4 py-3 text-[13px] text-gold-deep">
            {t('rainExpectedTip')}
          </motion.p>
        )}

        <motion.div {...reveal} className="mt-6"><CountdownTimer /></motion.div>

        <motion.div {...reveal} className="mt-6 flex gap-2.5">
          <a href={calendarLink()} target="_blank" rel="noreferrer" className="flex-1">
            <Button variant="outline" fullWidth className="!px-2 text-[13px]">{t('saveTheDate')}</Button>
          </a>
          <Button variant="outline" className="flex-1 !px-2 text-[13px]" onClick={onOpenContact}>{t('contactHosts')}</Button>
        </motion.div>
        {reminder.supported && (
          <motion.div {...reveal} className="mt-2.5">
            {reminder.optedIn ? (
              <p className="text-center text-xs text-emerald">{t('reminderOnCopy')}</p>
            ) : (
              <Button variant="ghost" fullWidth className="!py-2 text-[13px]" onClick={reminder.optIn}>
                {t('remindMeOnTheDay')}
              </Button>
            )}
          </motion.div>
        )}
      </motion.section>

      {/* III. Majlis */}
      <motion.section
        ref={setRef(2)}
        onViewportEnter={() => setChapter(2)}
        viewport={{ amount: 0.5 }}
        className="relative flex min-h-dvh flex-col justify-center bg-forest px-7 pb-16 pt-24 text-cream"
      >
        <p className="absolute inset-x-0 top-16 text-center text-[11px] uppercase tracking-[0.3em] text-[#e8c77a]">{t('chapterMajlis')}</p>
        <motion.h2 {...reveal} className="mt-5 text-center font-heading text-4xl italic leading-tight">{t('willYouJoinUs')}</motion.h2>
        {!rsvp && rsvpByDate && (
          <motion.p {...reveal} className="mt-2 text-center text-sm text-[#e8c77a]">
            {t('kindlyRsvpBy')} {rsvpByDate}
          </motion.p>
        )}
        {guestCount && guestCount.confirmedGuests > 0 && (
          <motion.p {...reveal} className="mt-2 text-center text-xs text-cream/70">
            🎉 {guestCount.confirmedGuests} {t('guestsConfirmedSoFar')}
          </motion.p>
        )}

        <div className="mt-7 flex flex-col gap-2.5">
          {rsvpOptions.map((o) => {
            const selected = rsvp === o.id;
            return (
              <motion.button
                key={o.id}
                type="button"
                aria-pressed={selected}
                onClick={() => chooseRsvp(o.id)}
                whileTap={{ scale: 0.98 }}
                animate={{ backgroundColor: selected ? '#e8c77a' : 'rgba(232,199,122,0)', color: selected ? '#3b2416' : '#f6ead2' }}
                className="flex min-h-14 items-center justify-between rounded-2xl border border-[#e8c77a]/60 px-5 text-left text-[15px] font-medium"
              >
                {o.label}
                <span className={`h-5 w-5 rounded-full border-[1.5px] ${selected ? 'border-forest bg-forest' : 'border-[#e8c77a]/60'}`} />
              </motion.button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#e8c77a]/30 pt-5">
          <div>
            <p className="text-sm font-medium">{t('howManyOfYou')}</p>
            <p className="mt-0.5 text-xs text-cream/60">{t('includingYou')}</p>
          </div>
          <div className="flex items-center gap-3.5">
            <motion.button type="button" whileTap={{ scale: 0.9 }} aria-label="Fewer guests" onClick={() => changeGuests(guests - 1)} className="h-12 w-12 rounded-full border border-[#e8c77a] text-xl text-[#e8c77a]">−</motion.button>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={guests}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                className="min-w-9 text-center font-heading text-5xl"
              >
                {guests}
              </motion.span>
            </AnimatePresence>
            <motion.button type="button" whileTap={{ scale: 0.9 }} aria-label="More guests" onClick={() => changeGuests(guests + 1)} className="h-12 w-12 rounded-full bg-[#e8c77a] text-xl text-forest">+</motion.button>
          </div>
        </div>

        {rsvp === 'yes' && guests > 1 && (
          <motion.div {...reveal} className="mt-4">
            <label htmlFor="guest-names" className="block text-xs font-medium text-cream/60 mb-1.5">
              {t('guestNamesOptional')}
            </label>
            <input
              id="guest-names"
              value={guestNames}
              onChange={(e) => setGuestNames(e.target.value)}
              onBlur={handleGuestNamesBlur}
              placeholder={t('guestNamesPlaceholder')}
              className="w-full rounded-xl border border-[#e8c77a]/40 bg-transparent px-4 py-3 text-[15px] text-cream placeholder:text-cream/40 outline-none focus:border-[#e8c77a]"
            />
          </motion.div>
        )}
        {rsvp === 'yes' && (
          <motion.div {...reveal} className="mt-4">
            <label htmlFor="dietary-notes" className="block text-xs font-medium text-cream/60 mb-1.5">
              {t('dietaryPreferencesOptional')}
            </label>
            <input
              id="dietary-notes"
              value={dietaryNotes}
              onChange={(e) => setDietaryNotes(e.target.value)}
              onBlur={handleDietaryBlur}
              placeholder={t('dietaryPreferencesPlaceholder')}
              className="w-full rounded-xl border border-[#e8c77a]/40 bg-transparent px-4 py-3 text-[15px] text-cream placeholder:text-cream/40 outline-none focus:border-[#e8c77a]"
            />
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {confirmation && (
            <motion.p
              key={rsvp}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 rounded-2xl border border-[#e8c77a]/35 bg-[#e8c77a]/10 p-4 text-[14px] leading-relaxed"
              aria-live="polite"
            >
              {confirmation}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.section>

      {/* IV. Gate */}
      <motion.section
        ref={setRef(3)}
        onViewportEnter={() => setChapter(3)}
        viewport={{ amount: 0.5 }}
        className="relative flex min-h-dvh flex-col items-center bg-[linear-gradient(180deg,#7d8b68,#66744f)] px-8 pb-12 pt-16 text-center text-cream"
      >
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#f3e2b3]">{t('chapterGate')}</p>
        <svg width="200" height="170" viewBox="0 0 220 190" fill="none" className="mt-[12vh]" aria-hidden="true">
          <motion.path initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }} d="M20 190 V96 a90 90 0 0 1 180 0 V190" stroke="#f3e2b3" strokeWidth="3" />
          <path d="M44 190 V100 a66 66 0 0 1 132 0 V190" stroke="#f3e2b3" strokeWidth="1.4" strokeDasharray="4 6" />
          <line x1="110" y1="34" x2="110" y2="190" stroke="#f3e2b3" strokeWidth="1.6" />
          <circle cx="96" cy="120" r="5" stroke="#f3e2b3" strokeWidth="1.6" />
          <circle cx="124" cy="120" r="5" stroke="#f3e2b3" strokeWidth="1.6" />
        </svg>
        <motion.h2 {...reveal} className="mt-6 font-heading text-4xl italic leading-tight">{t('readyToCome')}</motion.h2>
        <motion.p {...reveal} className="mt-3 max-w-[19rem] text-[14px] leading-relaxed text-cream/85">{t('journeyIntroDescription')}</motion.p>
        <p className="mt-3 max-w-[18rem] text-xs leading-relaxed text-cream/65">{t('locationPrivacyCopy')}</p>
        <div className="flex-1" />
        <Button fullWidth onClick={onStartJourney} className="mt-8 !bg-cream !text-forest">{t('startMyJourneyEmoji')}</Button>
        <a href={directionsLink()} target="_blank" rel="noreferrer" className="mt-3 w-full">
          <Button fullWidth variant="outline" className="!border-cream/60 !text-cream">{t('getDirections')}</Button>
        </a>
        <p className="mt-2 max-w-[18rem] text-xs leading-relaxed text-cream/60">{t('getDirectionsHint')}</p>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="mt-4 min-h-11 text-sm text-cream/75">{t('notNow')}</button>
      </motion.section>
    </div>
  );
}
