// Badging API — sets a small numeric badge on the installed PWA's home
// screen icon (supported on Chrome/Edge on Android and desktop, iOS
// Safari's PWA support varies). No-ops silently everywhere else.
export function updateAppBadge(eventStart: Date): void {
  if (typeof navigator.setAppBadge !== 'function' || typeof navigator.clearAppBadge !== 'function') return;

  const daysLeft = Math.ceil((eventStart.getTime() - Date.now()) / 86400000);
  if (daysLeft > 0) {
    navigator.setAppBadge(daysLeft).catch(() => {});
  } else {
    navigator.clearAppBadge().catch(() => {});
  }
}
