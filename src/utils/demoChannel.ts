/**
 * Lets the /admin Demo Journey controls drive the real guest UI live, if
 * the guest screen is open in another tab/window on the same device/
 * browser — exactly what's needed to demo the whole experience without
 * physically travelling. Uses BroadcastChannel (built into every modern
 * browser, no dependency); if unsupported, demo buttons simply have no
 * cross-tab effect and the admin preview still works standalone.
 */
export type DemoMessage =
  | { type: 'DEMO_DISTANCE'; meters: number }
  | { type: 'DEMO_ARRIVED' }
  | { type: 'DEMO_DEPARTED' }
  | { type: 'DEMO_THANK_YOU' }
  | { type: 'DEMO_START' }
  | { type: 'DEMO_RESET' };

const CHANNEL_NAME = 'dua-demo-channel';

function openChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  try {
    return new BroadcastChannel(CHANNEL_NAME);
  } catch {
    return null;
  }
}

export function postDemoMessage(message: DemoMessage): void {
  const channel = openChannel();
  if (!channel) return;
  channel.postMessage(message);
  channel.close();
}

export function subscribeDemoChannel(onMessage: (message: DemoMessage) => void): () => void {
  const channel = openChannel();
  if (!channel) return () => {};
  const listener = (event: MessageEvent<DemoMessage>) => onMessage(event.data);
  channel.addEventListener('message', listener);
  return () => {
    channel.removeEventListener('message', listener);
    channel.close();
  };
}
