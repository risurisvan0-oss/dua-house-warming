// A soft, procedurally-generated bell chime — Web Audio API oscillators,
// no audio file/licensing needed. Best-effort: browsers require a recent
// user gesture to start audio, so this silently no-ops if blocked.
let sharedContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!sharedContext) sharedContext = new Ctor();
    return sharedContext;
  } catch {
    return null;
  }
}

function playTone(ctx: AudioContext, freq: number, startTime: number, duration: number, gainPeak: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

/** A gentle two-note chime, like a small brass bell. */
export function playChime(): void {
  const ctx = getContext();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const now = ctx.currentTime;
    playTone(ctx, 880, now, 1.1, 0.08);
    playTone(ctx, 1318.5, now + 0.12, 1.3, 0.06);
  } catch {
    // audio unavailable — never block the UI for this
  }
}
