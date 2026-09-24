import { motion } from 'framer-motion';
import { Button } from '../../components/Button';
import { Divider } from '../../components/Divider';
import { LatticeBorder } from '../../components/LatticeBorder';
import { useLanguage } from '../../hooks/useLanguage';
import { useEventConfig } from '../../hooks/useEventConfig';
import { JourneyProgressCard } from './JourneyProgressCard';

export function ThankYouPage({ onLeaveMessage }: { onLeaveMessage: () => void }) {
  const { t, language } = useLanguage();
  const eventConfig = useEventConfig();
  const thankYou = language === 'en' ? eventConfig.thankYouMessageEn : eventConfig.thankYouMessageMl;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="islamic-pattern-bg paper-grain min-h-dvh flex flex-col items-center px-6 pt-16 pb-16 text-center"
    >
      <LatticeBorder top={false} />
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="text-5xl mb-4"
      >
        ❤️
      </motion.div>
      <h1 className="font-heading text-3xl text-forest mb-4">{t('thankYouForComing')}</h1>
      <Divider className="mb-6" />
      <p className="max-w-sm text-[15px] leading-relaxed text-charcoal/80 mb-8 whitespace-pre-line">{thankYou}</p>

      <div className="w-full max-w-sm mb-6">
        <JourneyProgressCard journeyState="THANK_YOU" />
      </div>

      <Button onClick={onLeaveMessage}>{t('leaveAMessage')}</Button>
    </motion.div>
  );
}
