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

      {/* Large, slow-drifting lantern glows for atmosphere behind everything. */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.span
          key={`glow-${i}`}
          className="absolute rounded-full blur-2xl"
          style={{
            width: 90 + i * 20,
            height: 90 + i * 20,
            left: `${18 + i * 32}%`,
            top: `${25 + (i % 2) * 40}%`,
            background: 'radial-gradient(circle, color-mix(in srgb, var(--color-gold) 55%, transparent), transparent 70%)',
          }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0.15, 0.4, 0.15], y: [-10, 10, -10] }}
          transition={{ duration: 7 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
        />
      ))}

      {/* Floating embers: small glowing points that drift upward with a
          gentle sideways sway, like lanterns rising into the night. */}
      {Array.from({ length: 18 }).map((_, i) => {
        const size = 3 + (i % 4) * 2;
        const sway = 14 + (i % 5) * 6;
        return (
          <motion.span
            key={`ember-${i}`}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${(i * 29) % 100}%`,
              top: `${(i * 47) % 100}%`,
              background: 'var(--color-gold)',
              boxShadow: '0 0 8px 2px color-mix(in srgb, var(--color-gold) 70%, transparent)',
            }}
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{ opacity: [0, 0.9, 0], y: -70 - (i % 3) * 20, x: [0, sway, -sway, 0] }}
            transition={{ duration: 5 + (i % 5), repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}
          />
        );
      })}

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
