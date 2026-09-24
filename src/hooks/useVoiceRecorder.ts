import { useCallback, useEffect, useRef, useState } from 'react';

export type RecorderState = 'idle' | 'recording' | 'recorded' | 'unsupported' | 'denied';

export function isVoiceRecordingSupported(): boolean {
  return !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
}

/** Records a short voice clip client-side (MediaRecorder) — no server, no upload. */
export function useVoiceRecorder(maxSeconds = 20) {
  const [state, setState] = useState<RecorderState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stop = useCallback(() => {
    clearTimer();
    recorderRef.current?.stop();
  }, []);

  const start = useCallback(async () => {
    if (!isVoiceRecordingSupported()) {
      setState('unsupported');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setState('recorded');
        stream.getTracks().forEach((track) => track.stop());
      };
      recorderRef.current = recorder;
      recorder.start();
      setState('recording');
      setElapsed(0);

      const startedAt = Date.now();
      timerRef.current = window.setInterval(() => {
        const secs = Math.floor((Date.now() - startedAt) / 1000);
        setElapsed(secs);
        if (secs >= maxSeconds) stop();
      }, 200);
    } catch {
      setState('denied');
    }
  }, [maxSeconds, stop]);

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setElapsed(0);
    setState('idle');
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      clearTimer();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, audioUrl, audioBlob, elapsed, maxSeconds, start, stop, reset };
}
