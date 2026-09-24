import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './Button';
import { useLanguage } from '../hooks/useLanguage';
import { storageService } from '../services/storageService';
import { isIos, isRunningStandalone, type BeforeInstallPromptEvent } from '../utils/pwaInstall';

/**
 * A one-time, dismissible nudge to actually install the PWA — installable
 * isn't the same as installed, and most guests won't think to do this
 * themselves. Android/Chrome gets a real "Install" button (native
 * `beforeinstallprompt`); iOS Safari never fires that event, so it gets
 * short Share → Add to Home Screen instructions instead.
 */
export function InstallAppBanner() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => storageService.hasDismissedInstallPrompt());
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    if (isRunningStandalone()) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    storageService.setInstallPromptDismissed();
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted' || outcome === 'dismissed') dismiss();
  };

  const canShowAndroid = !!deferredPrompt;
  const canShowIos = isIos() && !isRunningStandalone();
  const visible = !dismissed && (canShowAndroid || canShowIos);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          // Sits above the floating "Ask DUA" button (bottom-right, ~4.5rem
          // tall including its own safe-area padding) rather than under it.
          className="fixed inset-x-0 z-20 px-4 bottom-[calc(max(1.25rem,env(safe-area-inset-bottom))+4.5rem)]"
        >
          <div className="mx-auto max-w-lg rounded-2xl border border-gold-deep/25 bg-ivory p-4 shadow-lg">
            <p className="font-heading text-base text-forest mb-1">{t('installAppTitle')}</p>
            <p className="text-[13px] leading-relaxed text-charcoal/70 mb-3">
              {showIosSteps || (canShowIos && !canShowAndroid) ? t('installAppBodyIos') : t('installAppBodyAndroid')}
            </p>
            <div className="flex gap-2.5">
              {canShowAndroid ? (
                <Button fullWidth onClick={handleInstall} className="!py-2.5 text-sm">
                  📲 {t('installNow')}
                </Button>
              ) : (
                <Button fullWidth onClick={() => setShowIosSteps(true)} className="!py-2.5 text-sm">
                  📲 {t('installNow')}
                </Button>
              )}
              <Button variant="ghost" onClick={dismiss} className="!py-2.5 text-sm shrink-0">
                {t('maybeLater')}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
