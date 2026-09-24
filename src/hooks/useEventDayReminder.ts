import { useCallback, useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import { getEventPhase } from '../utils/dateTime';
import { requestNotificationPermission, showLocalNotification, isNotificationSupported } from '../utils/notifications';
import type { EventConfig } from '../config/event';
import type { Language } from '../data/translations';

/**
 * Manages the "Remind me on the day" opt-in and fires a same-day local
 * notification. Honest limitation: this only fires while the guest has
 * the app open (or reopens it) on the event day itself — a browser tab
 * can't reliably wake itself up unprompted days in advance. See
 * `utils/notifications.ts`.
 */
export function useEventDayReminder(eventConfig: EventConfig, language: Language) {
  const [optedIn, setOptedIn] = useState(() => storageService.wantsEventDayReminder());
  const [supported] = useState(() => isNotificationSupported());

  const optIn = useCallback(async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      storageService.setWantsEventDayReminder(true);
      setOptedIn(true);
    }
    return permission;
  }, []);

  const optOut = useCallback(() => {
    storageService.setWantsEventDayReminder(false);
    setOptedIn(false);
  }, []);

  useEffect(() => {
    if (!optedIn || getEventPhase() !== 'live') return;
    const today = eventConfig.eventDate;
    if (storageService.getEventDayReminderShownOn() === today) return;
    storageService.setEventDayReminderShownOn(today);
    const title = language === 'ml' ? `ഇന്ന് ${eventConfig.houseName}!` : `Today's the day — ${eventConfig.houseName}! 🏡`;
    const body =
      language === 'ml'
        ? `${eventConfig.hostNames} താങ്കളെ ഇന്ന് പ്രതീക്ഷിക്കുന്നു.`
        : `${eventConfig.hostNames} are looking forward to seeing you today.`;
    showLocalNotification(title, body);
  }, [optedIn, eventConfig.eventDate, eventConfig.houseName, eventConfig.hostNames, language]);

  return { supported, optedIn, optIn, optOut };
}
