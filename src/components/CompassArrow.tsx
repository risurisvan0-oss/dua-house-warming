import { motion } from 'framer-motion';
import { useDeviceHeading } from '../hooks/useDeviceHeading';
import { useLanguage } from '../hooks/useLanguage';

/**
 * A playful AR-style arrow that points toward DUA using the phone's
 * compass heading, layered on top of the map. Starts collapsed as a
 * small toggle button — iOS requires an explicit tap (user gesture)
 * before it will grant compass permission, so this can't auto-enable.
 * Hides itself entirely if the browser/device has no heading to give.
 */
export function CompassArrow({ bearingToDestination }: { bearingToDestination: number | null }) {
  const { heading, permission, requestPermission } = useDeviceHeading();
  const { t } = useLanguage();

  if (permission === 'unsupported') return null;

  if (permission !== 'granted') {
    return (
      <button
        type="button"
        onClick={requestPermission}
        aria-label={t('compassToDua')}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ivory/95 text-lg shadow-lg backdrop-blur"
      >
        🧭
      </button>
    );
  }

  if (heading == null || bearingToDestination == null) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ivory/95 text-lg shadow-lg backdrop-blur opacity-60">
        🧭
      </div>
    );
  }

  const arrowRotation = (bearingToDestination - heading + 360) % 360;

  return (
    <motion.div
      animate={{ rotate: arrowRotation }}
      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ivory/95 shadow-lg backdrop-blur"
      aria-label={t('compassToDua')}
      role="img"
    >
      <span className="text-xl leading-none text-forest">↑</span>
    </motion.div>
  );
}
