import { motion } from 'framer-motion';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useLanguage } from '../../hooks/useLanguage';
import { directionsLink } from '../../utils/contact';

export function LocationPermissionPage({
  onAllow,
  onSkip,
  requesting,
  denied,
  notConfigured,
}: {
  onAllow: () => void;
  onSkip: () => void;
  requesting: boolean;
  denied: boolean;
  notConfigured: boolean;
}) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-10 text-center bg-cream"
    >
      <h1 className="font-heading text-2xl text-forest mb-6">{t('journeyExperience')}</h1>

      {notConfigured ? (
        <Card className="max-w-sm mb-6">
          <p className="text-[15px] text-charcoal/80 mb-4">{t('errorLocationNotConfigured')}</p>
          <a href={directionsLink()} target="_blank" rel="noreferrer" className="block mb-3">
            <Button fullWidth variant="outline">{t('getDirections')}</Button>
          </a>
          <Button fullWidth onClick={onSkip}>
            {t('continueLabel')}
          </Button>
        </Card>
      ) : denied ? (
        <Card className="max-w-sm mb-6">
          <p className="text-[15px] text-charcoal/80 mb-4">{t('locationDeniedCopy')}</p>
          <a href={directionsLink()} target="_blank" rel="noreferrer" className="block mb-3">
            <Button fullWidth variant="outline">{t('getDirections')}</Button>
          </a>
          <Button fullWidth onClick={onSkip}>
            {t('continueLabel')}
          </Button>
        </Card>
      ) : (
        <>
          <Card className="max-w-sm mb-4 text-left">
            <p className="text-[15px] leading-relaxed text-charcoal/85 mb-4">{t('locationPermissionCopy')}</p>
            <p className="text-xs leading-relaxed text-charcoal/55">{t('locationPrivacyCopy')}</p>
          </Card>

          <div className="w-full max-w-sm space-y-3">
            <Button fullWidth onClick={onAllow} disabled={requesting}>
              {requesting ? '…' : `📍 ${t('allowAndStartJourney')}`}
            </Button>
            <Button variant="ghost" fullWidth onClick={onSkip}>
              {t('notNow')}
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
}
