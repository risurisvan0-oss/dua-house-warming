import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCountdown } from '../hooks/useCountdown';
import { useLanguage } from '../hooks/useLanguage';
import { eventStartDateTime } from '../utils/dateTime';

function Unit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-forest text-ivory shadow-md sm:h-14 sm:w-14">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={display}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center font-heading text-lg sm:text-xl"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1 text-[10px] uppercase tracking-wide text-charcoal/50">{label}</span>
    </div>
  );
}

export function CountdownTimer({ className = '' }: { className?: string }) {
  const { language } = useLanguage();
  const target = useMemo(() => eventStartDateTime(), []);
  const { days, hours, minutes, seconds, isPast } = useCountdown(target);

  if (isPast) return null;

  const labels =
    language === 'en'
      ? { days: 'Days', hours: 'Hrs', minutes: 'Min', seconds: 'Sec' }
      : { days: 'ദിവസം', hours: 'മണി', minutes: 'മിനിറ്റ്', seconds: 'സെക്കൻഡ്' };

  return (
    <div className={className}>
      <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
        {language === 'en' ? 'Counting down to DUA' : 'DUA-യിലേക്ക് ഇനി'}
      </p>
      <div className="flex justify-center gap-2 sm:gap-3">
        <Unit value={days} label={labels.days} />
        <Unit value={hours} label={labels.hours} />
        <Unit value={minutes} label={labels.minutes} />
        <Unit value={seconds} label={labels.seconds} />
      </div>
    </div>
  );
}
