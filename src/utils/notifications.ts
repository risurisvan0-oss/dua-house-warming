/**
 * Local (on-device) notifications for the "Remind me on the day" opt-in —
 * no backend, no push server. Honest limitation: a browser tab can't wake
 * itself up days later on its own, so this only fires when the guest
 * actually opens (or has left open) the installed app on the event day
 * itself — see the check in `useEventDayReminder`. It is a same-day nudge,
 * not a guaranteed alarm.
 */

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

/**
 * Prefers a service-worker-backed notification (required by some mobile
 * browsers, e.g. Android Chrome, which ignore the plain `Notification`
 * constructor) and falls back to it when no service worker is available.
 */
export async function showLocalNotification(title: string, body: string): Promise<void> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, { body, icon: './icons/icon-192.svg' });
      return;
    }
  } catch {
    // fall through to the plain constructor below
  }
  try {
    new Notification(title, { body });
  } catch {
    // Notifications unavailable for this browser/context — silently skip.
  }
}
