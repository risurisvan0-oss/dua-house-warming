import { motion } from 'framer-motion';
import { HomeIllustration } from '../../components/HomeIllustration';
import { Card } from '../../components/Card';
import { useLanguage } from '../../hooks/useLanguage';
import { useEventConfig } from '../../hooks/useEventConfig';
import { formatEventTimeRange } from '../../utils/dateTime';
import { ArrivalPostcardButton } from './ArrivalPostcardButton';
import { JourneyProgressCard } from './JourneyProgressCard';

export function EventModePage() {
  const { t, language } = useLanguage();
  const eventConfig = useEventConfig();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-dvh flex flex-col items-center px-6 py-10 text-center bg-cream"
    >
      <HomeIllustration className="w-40 h-auto mb-4" />
      <h1 className="font-heading text-3xl text-forest mb-1">{t('welcomeHome')}</h1>
      <p className="text-sm uppercase tracking-wide text-gold font-semibold mb-4">{eventConfig.houseName}</p>
      <p className="text-[15px] text-charcoal/75 mb-1">{t('makeYourselfAtHome')}</p>
      <p className="text-sm text-charcoal/60 mb-8">{formatEventTimeRange()}</p>

      <div className="w-full max-w-sm mb-6">
        <JourneyProgressCard journeyState="ARRIVED" />
      </div>

      {eventConfig.scheduleItems.length > 0 && (
        <Card className="w-full max-w-sm mb-6 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-deep mb-3">{t('todaysProgramme')}</p>
          <ol className="space-y-3">
            {eventConfig.scheduleItems.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-[4.5rem] shrink-0 text-xs font-semibold text-forest/60">{item.time}</span>
                <span className="text-sm text-charcoal/80">{language === 'en' ? item.titleEn : item.titleMl}</span>
              </li>
            ))}
          </ol>
        </Card>
      )}

      <ArrivalPostcardButton />
    </motion.div>
  );
}
