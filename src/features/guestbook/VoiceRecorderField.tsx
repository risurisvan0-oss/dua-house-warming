import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';

export function VoiceRecorderField({ onChange }: { onChange: (blob: Blob | null) => void }) {
  const { t } = useLanguage();
  const { state, audioUrl, audioBlob, elapsed, maxSeconds, start, stop, reset } = useVoiceRecorder();

  // Propagate the finished recording up to the parent form once it's ready.
  useEffect(() => {
    if (state === 'recorded' && audioBlob) onChange(audioBlob);
  }, [state, audioBlob, onChange]);

  const handleReset = () => {
    reset();
    onChange(null);
  };

  return (
    <div>
      <span className="block text-xs font-semibold text-forest/70 mb-1.5">{t('orRecordVoiceMessage')}</span>

      {state === 'unsupported' && <p className="text-xs text-charcoal/50">{t('recordingUnsupported')}</p>}
      {state === 'denied' && <p className="text-xs text-charcoal/50 mb-2">{t('recordingDenied')}</p>}

      {(state === 'idle' || state === 'denied') && (
        <button
          type="button"
          onClick={() => start()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-forest/20 bg-cream px-4 py-3 text-sm font-medium text-forest"
        >
          🎙️ {t('startRecording')}
        </button>
      )}

      {state === 'recording' && (
        <button
          type="button"
          onClick={stop}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="h-2.5 w-2.5 rounded-full bg-red-600"
          />
          {t('stopRecording')} · {elapsed}s / {maxSeconds}s
        </button>
      )}

      {state === 'recorded' && audioUrl && (
        <div className="flex items-center gap-2 rounded-xl border border-forest/20 bg-cream px-3 py-2.5">
          <audio src={audioUrl} controls className="h-9 flex-1" />
          <button type="button" onClick={handleReset} className="text-xs font-medium text-forest underline">
            {t('reRecord')}
          </button>
        </div>
      )}
    </div>
  );
}
