import { useMemo } from 'react';
import { ChatModal } from '../../../components/chat/ChatModal';
import { HostBubble, TypingDots } from '../../../components/chat/ChatBubbles';
import { Button } from '../../../components/Button';
import { ContactButtons } from '../ContactButtons';
import { useLanguage } from '../../../hooks/useLanguage';
import { useEventConfig } from '../../../hooks/useEventConfig';
import { useTypedReveal } from '../../../hooks/useTypedReveal';
import { directionsLink } from '../../../utils/contact';

export function GettingThereChat({
  open,
  onClose,
  onStartJourney,
}: {
  open: boolean;
  onClose: () => void;
  onStartJourney: () => void;
}) {
  const { t, language } = useLanguage();
  const eventConfig = useEventConfig();
  const landmarkNote = (language === 'en' ? eventConfig.arrivalLandmarkNoteEn : eventConfig.arrivalLandmarkNoteMl) || undefined;

  const steps = useMemo(() => {
    const list: React.ReactNode[] = [
      <span key="intro">{t('chatGettingThereIntro')}</span>,
      <span key="address">📍 {eventConfig.address}</span>,
    ];
    if (eventConfig.travelInfo) {
      list.push(
        <span key="travel">
          ✈️ {t('nearestAirportLabel')}: {eventConfig.travelInfo.nearestAirport}
          <br />
          🚉 {t('nearestStationLabel')}: {eventConfig.travelInfo.nearestRailwayStation}
        </span>,
      );
    }
    if (landmarkNote) list.push(<span key="landmark">{t('landmarkNoteLabel')}: {landmarkNote}</span>);
    list.push(<span key="journey-prompt">{t('chatGettingThereJourneyPrompt')}</span>);
    return list;
  }, [t, eventConfig.address, eventConfig.travelInfo, landmarkNote]);

  const { revealed, typing } = useTypedReveal(open ? steps.length : 0);
  const done = revealed >= steps.length;

  return (
    <ChatModal open={open} onClose={onClose} icon="🌴">
      {steps.slice(0, revealed).map((node, i) => (
        <HostBubble key={i}>{node}</HostBubble>
      ))}
      {typing && <TypingDots />}
      {done && (
        <>
          <div className="ml-auto flex max-w-[92%] flex-col items-stretch gap-2">
            <a href={directionsLink()} target="_blank" rel="noreferrer">
              <Button variant="outline" fullWidth>{t('getDirections')}</Button>
            </a>
            <Button fullWidth onClick={onStartJourney}>{t('startMyJourneyEmoji')}</Button>
          </div>
          <HostBubble>
            <ContactButtons />
          </HostBubble>
        </>
      )}
    </ChatModal>
  );
}
