import { useMemo } from 'react';
import { ChatModal } from '../../../components/chat/ChatModal';
import { HostBubble, TypingDots } from '../../../components/chat/ChatBubbles';
import { Button } from '../../../components/Button';
import { CountdownTimer } from '../../../components/CountdownTimer';
import { useLanguage } from '../../../hooks/useLanguage';
import { useEventConfig } from '../../../hooks/useEventConfig';
import { useWeather } from '../../../hooks/useWeather';
import { useEventDayForecast } from '../../../hooks/useEventDayForecast';
import { usePrayerTimes } from '../../../hooks/usePrayerTimes';
import { useEventDayReminder } from '../../../hooks/useEventDayReminder';
import { useTypedReveal } from '../../../hooks/useTypedReveal';
import { calendarLink, formatEventDate, formatEventTimeRange, formatHijriEventDate, formatRsvpByDate } from '../../../utils/dateTime';

const TZ = 'Asia/Kolkata';

export function TheDayChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, language } = useLanguage();
  const eventConfig = useEventConfig();
  const weather = useWeather(eventConfig);
  const eventDayForecast = useEventDayForecast(eventConfig);
  const prayerTimes = usePrayerTimes(eventConfig);
  const reminder = useEventDayReminder(eventConfig, language);
  const rsvpByDate = formatRsvpByDate();
  const hijri = formatHijriEventDate();

  const weekday = useMemo(
    () => new Intl.DateTimeFormat('en-IN', { weekday: 'long', timeZone: TZ }).format(new Date(`${eventConfig.eventDate}T00:00:00+05:30`)),
    [eventConfig.eventDate],
  );

  const steps = useMemo(() => {
    const list: React.ReactNode[] = [
      <span key="intro">{t('chatDayIntro')}</span>,
      <span key="date">
        📅 {weekday}, {formatEventDate()}
        {hijri ? ` · ${hijri}` : ''}
      </span>,
      <span key="time">🕚 {formatEventTimeRange()}</span>,
      <span key="place">📍 {eventConfig.addressLines[0]}, {eventConfig.addressLines[1]}</span>,
    ];
    if (prayerTimes) {
      list.push(
        <span key="prayer">
          🕌 {t('dhuhr')}: {prayerTimes.dhuhr} · {t('asr')}: {prayerTimes.asr}
        </span>,
      );
    }
    if (weather) {
      list.push(<span key="weather">{t('weatherAtDua')}: {weather.temperatureCelsius}°C, {weather.description}</span>);
    }
    if (eventDayForecast?.isRainy) {
      list.push(<span key="rain">{t('rainExpectedTip')}</span>);
    }
    if (rsvpByDate) {
      list.push(<span key="rsvp-by">{t('kindlyRsvpBy')} {rsvpByDate}</span>);
    }
    list.push(<span key="countdown-intro">{t('chatDayCountdownIntro')}</span>);
    return list;
  }, [t, weekday, hijri, eventConfig.addressLines, prayerTimes, weather, eventDayForecast, rsvpByDate]);

  const { revealed, typing } = useTypedReveal(open ? steps.length : 0);
  const done = revealed >= steps.length;

  return (
    <ChatModal open={open} onClose={onClose} icon="🏮">
      {steps.slice(0, revealed).map((node, i) => (
        <HostBubble key={i}>{node}</HostBubble>
      ))}
      {typing && <TypingDots />}
      {done && (
        <>
          <HostBubble>
            <CountdownTimer />
          </HostBubble>
          <div className="ml-auto flex max-w-[92%] flex-col items-end gap-2">
            <a href={calendarLink()} target="_blank" rel="noreferrer" className="w-full">
              <Button variant="outline" fullWidth>{t('saveTheDate')}</Button>
            </a>
            {reminder.supported && (
              reminder.optedIn ? (
                <p className="text-xs text-emerald">{t('reminderOnCopy')}</p>
              ) : (
                <Button variant="ghost" fullWidth onClick={reminder.optIn}>
                  {t('remindMeOnTheDay')}
                </Button>
              )
            )}
          </div>
        </>
      )}
    </ChatModal>
  );
}
