import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/Button';
import { Divider } from '../../components/Divider';
import { LatticeBorder } from '../../components/LatticeBorder';
import { useLanguage } from '../../hooks/useLanguage';
import { useEventConfig } from '../../hooks/useEventConfig';
import { playChime } from '../../utils/chime';

export function ArrivalReveal({ onEnter }: { onEnter: () => void }) {
  const { t, language } = useLanguage();
  const eventConfig = useEventConfig();
  const message = language === 'en' ? eventConfig.arrivalMessageEn : eventConfig.arrivalMessageMl;

  // Best-effort — most browsers only allow this if there's been a recent
  // user gesture (e.g. the guest just tapped through the journey screen),
  // so it silently no-ops otherwise rather than blocking anything.
  useEffect(() => {
    playChime();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="islamic-pattern-bg paper-grain relative min-h-dvh flex flex-col items-center justify-center px-6 py-10 text-center overflow-hidden"
    >
      <LatticeBorder />
      {/* soft ambient particles */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-gold/40"
          style={{
            width: 4 + (i % 3) * 3,
            height: 4 + (i % 3) * 3,
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 100}%`,
          }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.8, 0], y: -40 }}
          transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="lantern-glow mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-ivory text-5xl"
      >
        🏡
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="text-xs uppercase tracking-[0.3em] text-gold-deep font-semibold mb-2"
      >
        {t('youveArrived')}
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
        className="font-heading text-[1.9rem] sm:text-4xl text-clay mb-4"
      >
        {t('welcomeToDuaHeart')}
      </motion.h2>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.6 }}>
        <Divider className="mb-6" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="max-w-sm text-[15px] leading-relaxed text-charcoal/80 mb-10 whitespace-pre-line"
      >
        {message}
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.6 }}>
        <Button onClick={onEnter}>{t('enterDua')}</Button>
      </motion.div>
    </motion.div>
  );
}
