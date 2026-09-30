import { useEffect, useState } from 'react';

/**
 * Reveals `totalSteps` items one at a time, each preceded by a brief
 * "typing…" pause — the mechanic behind every chat-style modal
 * (Welcome/RSVP/The Day/Getting There). `revealed` is how many items to
 * currently render; `typing` is whether the indicator for the *next*
 * one should show right now.
 */
export function useTypedReveal(totalSteps: number, typingMs = 650) {
  const [revealed, setRevealed] = useState(0);
  const [typing, setTyping] = useState(totalSteps > 0);

  useEffect(() => {
    if (revealed >= totalSteps) {
      setTyping(false);
      return;
    }
    setTyping(true);
    const timer = setTimeout(() => {
      setTyping(false);
      setRevealed((r) => r + 1);
    }, typingMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, totalSteps]);

  return { revealed, typing };
}
