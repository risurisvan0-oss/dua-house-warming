import { useState } from 'react';
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { Button } from '../../components/Button';
import { HomeIllustration } from '../../components/HomeIllustration';
import { bismillahArabic } from '../../data/translations';
import { useEventConfig } from '../../hooks/useEventConfig';
import { useLanguage } from '../../hooks/useLanguage';
import { storageService } from '../../services/storageService';
import { playChime } from '../../utils/chime';
import { formatEventDate, formatEventTimeRange } from '../../utils/dateTime';

const JALI_ID = { left: 'jali-left', right: 'jali-right' } as const;

function DoorPanel({ side }: { side: 'left' | 'right' }) {
  const id = JALI_ID[side];
  return (
    <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <pattern id={id} width="39" height="39" patternUnits="userSpaceOnUse">
          <path d="M19.5 0 L39 19.5 L19.5 39 L0 19.5Z" fill="none" stroke="#c9a04c" strokeWidth="1" />
          <circle cx="19.5" cy="19.5" r="6" fill="none" stroke="#c9a04c" strokeWidth="0.9" />
        </pattern>
      </defs>
      <rect x="9%" y="9%" width="82%" height="46%" rx="6" fill={`url(#${id})`} stroke="#c9a04c" strokeWidth="1.6" opacity="0.85" />
      <rect x="9%" y="59%" width="82%" height="17%" rx="4" fill="none" stroke="#c9a04c" strokeWidth="1.2" opacity="0.6" />
      <rect x="9%" y="79%" width="82%" height="17%" rx="4" fill="none" stroke="#c9a04c" strokeWidth="1.2" opacity="0.6" />
    </svg>
  );
}

export function DoorsOpening({ onEnter }: { onEnter: () => void }) {
  const { t } = useLanguage();
  const eventConfig = useEventConfig();
  const guestName = storageService.getGuestName();
  const [opened, setOpened] = useState(false);

  const open = useMotionValue(0);
  const leftX = useTransform(open, [0, 1], ['0%', '-103%']);
  const rightX = useTransform(open, [0, 1], ['0%', '103%']);
  const doorUiOpacity = useTransform(open, [0, 0.25], [1, 0]);
  const courtOpacity = useTransform(open, [0, 1], [0.35, 1]);
  const courtScale = useTransform(open, [0, 1], [0.95, 1]);

  const px = useMotionValue(0);
  const illustrationX = useTransform(px, [-0.5, 0.5], [-9, 9]);

  const settle = (target: 0 | 1) => {
    animate(open, target, {
      type: 'spring',
      stiffness: 110,
      damping: 20,
      onComplete: () => {
        if (target === 1) {
          setOpened(true);
          playChime();
          navigator.vibrate?.(40);
        }
      },
    });
  };

  const handlePan = (_e: PointerEvent, info: PanInfo) => {
    if (opened) return;
    open.set(Math.min(1, Math.abs(info.offset.x) / (window.innerWidth * 0.4)));
  };
  const handlePanEnd = (_e: PointerEvent, info: PanInfo) => {
    if (opened) return;
    settle(open.get() > 0.35 || Math.abs(info.velocity.x) > 500 ? 1 : 0);
  };

  return (
    <div
      className="paper-grain relative min-h-dvh overflow-hidden bg-cream"
      onPointerMove={(e) => px.set(e.clientX / window.innerWidth - 0.5)}
    >
      {/* the courtyard behind the doors */}
      <motion.div
        style={{ opacity: courtOpacity, scale: courtScale }}
        className="absolute inset-0 flex flex-col items-center px-7 pb-10 pt-12 text-center"
      >
        <p dir="rtl" className="font-display text-[1.7rem] text-gold-deep">{bismillahArabic}</p>
        <p className="mt-1 max-w-[16rem] text-xs text-charcoal/60">{t('bismillahTranslation')}</p>

        <motion.div style={{ x: illustrationX }} className="mt-5 w-60">
          <HomeIllustration className="h-auto w-full rounded-lg" />
        </motion.div>

        <p className="mt-4 max-w-[17rem] text-[11px] uppercase leading-relaxed tracking-[0.22em] text-gold-deep">
          {t('gratitudeInvite')}
        </p>
        <h1 className="font-heading text-[5.5rem] font-medium italic leading-[0.95] text-forest">{eventConfig.houseName}</h1>
        <p className="font-heading text-2xl text-emerald">{eventConfig.hostNames}</p>
        <div className="my-3 h-px w-16 bg-gold" />
        <p className="text-sm text-charcoal">{formatEventDate()} · {formatEventTimeRange()}</p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-charcoal/55">
          {eventConfig.addressLines[0]}, {eventConfig.addressLines[1]}
        </p>
        <div className="flex-1" />
        <Button onClick={onEnter} disabled={!opened} className="px-11">
          {t('enterInvitation')}
        </Button>
      </motion.div>

      {/* the doors: drag apart, or use the button */}
      <motion.div
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        style={{ touchAction: 'none', pointerEvents: opened ? 'none' : 'auto' }}
        className="absolute inset-0"
        aria-hidden={opened}
      >
        <motion.div
          style={{ x: leftX, background: 'linear-gradient(90deg,#2a190e 0%,#4a2f1a 60%,#3b2416 100%)' }}
          className="absolute bottom-0 left-0 top-0 w-1/2 shadow-[inset_-10px_0_24px_rgba(0,0,0,0.45)]"
        >
          <DoorPanel side="left" />
        </motion.div>
        <motion.div
          style={{ x: rightX, background: 'linear-gradient(270deg,#2a190e 0%,#4a2f1a 60%,#3b2416 100%)' }}
          className="absolute bottom-0 right-0 top-0 w-1/2 shadow-[inset_10px_0_24px_rgba(0,0,0,0.45)]"
        >
          <DoorPanel side="right" />
        </motion.div>

        <motion.div style={{ opacity: doorUiOpacity }} className="pointer-events-none absolute inset-0 flex flex-col items-center">
          <p className="mt-[max(1.5rem,env(safe-area-inset-top))] font-display text-3xl text-[#e8c77a]">بسم الله</p>
          <p className="mt-1.5 px-6 text-center text-sm font-semibold uppercase tracking-[0.2em] text-[#f3d98f]">
            {eventConfig.hostNames}
          </p>
          <div className="flex-1" />
          <div className="mb-[max(3.5rem,env(safe-area-inset-bottom))] text-center">
            {guestName && (
              <p className="mb-2 font-heading text-base italic text-[#e8c77a]/90">
                {t('aSpecialInvitationFor')} {guestName}
              </p>
            )}
            <p className="text-[11px] uppercase tracking-[0.18em] text-cream/70">{t('dragDoorsHint')}</p>
            <div className="mt-2 flex items-center justify-center gap-6 text-[#e8c77a]">
              <motion.span animate={{ x: [0, -6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>←</motion.span>
              <motion.span animate={{ x: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>→</motion.span>
            </div>
          </div>
        </motion.div>

        <motion.button
          type="button"
          aria-label={t('openDoors')}
          onClick={() => settle(1)}
          style={{ opacity: doorUiOpacity }}
          whileTap={{ scale: 0.92 }}
          className="absolute left-1/2 top-[64%] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#e8c77a] bg-[radial-gradient(circle_at_35%_30%,#f3d98f,#b88a3e)] shadow-[0_4px_14px_rgba(0,0,0,0.5)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b2416" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="8 6 2 12 8 18" />
            <polyline points="16 6 22 12 16 18" />
          </svg>
        </motion.button>
      </motion.div>
    </div>
  );
}
