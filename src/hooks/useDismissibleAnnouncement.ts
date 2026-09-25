import { useState } from 'react';
import { storageService } from '../services/storageService';

/**
 * Shared dismissal state for the live announcement banner — pulled out
 * of the banner component itself so `App.tsx` can also know whether the
 * banner is actually visible right now (not just whether an announcement
 * exists) and lay out the fixed top bar underneath it accordingly.
 *
 * Tracks the last-dismissed *text* (not a plain seen/unseen flag) and
 * compares it directly against the current text on every render — no
 * effect needed, so a new announcement replacing an old dismissed one
 * shows again immediately.
 */
export function useDismissibleAnnouncement(text: string | undefined) {
  const [dismissedText, setDismissedText] = useState<string | null>(() => storageService.getDismissedAnnouncement());

  const dismiss = () => {
    if (!text) return;
    storageService.setDismissedAnnouncement(text);
    setDismissedText(text);
  };

  return { visible: !!text && dismissedText !== text, dismiss };
}
