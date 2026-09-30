import { useMemo } from 'react';
import { ChatModal } from '../../../components/chat/ChatModal';
import { HostBubble, TypingDots } from '../../../components/chat/ChatBubbles';
import { useLanguage } from '../../../hooks/useLanguage';
import { useEventConfig } from '../../../hooks/useEventConfig';
import { useTypedReveal } from '../../../hooks/useTypedReveal';
import { storageService } from '../../../services/storageService';
import { bismillahArabic } from '../../../data/translations';

export function WelcomeChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, language } = useLanguage();
  const eventConfig = useEventConfig();
  const guestName = storageService.getGuestName();
  const guestNote = storageService.getGuestNote();
  const welcome = language === 'en' ? eventConfig.welcomeMessageEn : eventConfig.welcomeMessageMl;
  const hostsBio = (language === 'en' ? eventConfig.hostsBioEn : eventConfig.hostsBioMl) || undefined;

  const steps = useMemo(() => {
    const list: React.ReactNode[] = [
      <div key="bismillah">
        <p dir="rtl" className="font-display text-2xl text-gold-deep">{bismillahArabic}</p>
        <p className="mt-1 text-sm text-charcoal/60">{t('bismillahTranslation')}</p>
      </div>,
      <span key="greeting">
        {guestName ? `${t('dearGuest')} ${guestName}, ` : ''}
        {welcome}
      </span>,
    ];
    if (guestNote) list.push(<span key="note" className="italic text-emerald">{guestNote}</span>);
    if (hostsBio) {
      list.push(
        <div key="hosts-intro">{t('chatMeetHostsIntro')}</div>,
        <div key="hosts-bio" className="flex items-center gap-3">
          {eventConfig.hostsPhotoUrl && (
            <img
              src={eventConfig.hostsPhotoUrl}
              alt={eventConfig.hostNames}
              className="h-12 w-12 shrink-0 rounded-full object-cover border-2 border-gold/50"
            />
          )}
          <span>{hostsBio}</span>
        </div>,
      );
    }
    return list;
  }, [guestName, welcome, guestNote, hostsBio, eventConfig.hostsPhotoUrl, eventConfig.hostNames, t]);

  const { revealed, typing } = useTypedReveal(open ? steps.length : 0);

  return (
    <ChatModal open={open} onClose={onClose} icon="🪟">
      {steps.slice(0, revealed).map((node, i) => (
        <HostBubble key={i}>{node}</HostBubble>
      ))}
      {typing && <TypingDots />}
    </ChatModal>
  );
}
