/** Minimal typing for the non-standard `beforeinstallprompt` event. */
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** True once the PWA is already running installed (standalone display mode). */
export function isRunningStandalone(): boolean {
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  // iOS Safari's own (non-standard) flag for "launched from home screen".
  return (navigator as unknown as { standalone?: boolean }).standalone === true;
}

/** iOS Safari never fires `beforeinstallprompt` — it needs the manual Share
 * → Add to Home Screen steps instead, so callers need to know which case they're in. */
export function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
