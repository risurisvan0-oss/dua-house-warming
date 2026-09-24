import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { storageService } from '../services/storageService';

/**
 * A dismissible last-minute update from the hosts (e.g. "Starting 30
 * minutes late"), sourced live from the optional Google Sheet — see
 * "Live announcement banner" in the README. Renders nothing if there's
 * no announcement, or if this guest already dismissed this exact text.
 */
export function AnnouncementBanner({ text }: { text: string | undefined }) {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(() => text != null && storageService.getDismissedAnnouncement() === text);

  const visible = !!text && !dismissed;

  const handleDismiss = () => {
    if (text) storageService.setDismissedAnnouncement(text);
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 inset-x-0 z-40 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2.5 bg-gold-deep text-ivory"
        >
          <div className="mx-auto flex max-w-lg items-start gap-3">
            <span className="text-lg leading-none">📣</span>
            <p className="flex-1 text-[13px] leading-snug">{text}</p>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label={t('gotIt')}
              className="shrink-0 text-lg leading-none px-1"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
