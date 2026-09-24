import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useLanguage } from '../../hooks/useLanguage';
import { storageService } from '../../services/storageService';
import { notifyHost } from '../../services/notifyHostService';
import { blobToDataUrl } from '../../utils/blob';
import { VoiceRecorderField } from './VoiceRecorderField';

export function GuestbookForm({ onDone }: { onDone: () => void }) {
  const { t } = useLanguage();
  const existing = storageService.getGuestbookEntry();
  const [name, setName] = useState(existing?.name ?? '');
  const [message, setMessage] = useState(existing?.message ?? '');
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!existing);
  const [savedAudioUrl] = useState(existing?.audioDataUrl ?? null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const audioDataUrl = voiceBlob ? await blobToDataUrl(voiceBlob) : undefined;
      storageService.setGuestbookEntry({
        name: name.trim(),
        message: message.trim(),
        submittedAt: new Date().toISOString(),
        audioDataUrl,
      });
      setSubmitted(true);
      // Voice notes stay device-only (too large for a webhook POST) — the
      // host still gets a text notification flagging that one exists.
      notifyHost({
        type: 'guestbook',
        guestId: storageService.getGuestId(),
        guestName: name.trim(),
        message: message.trim(),
        hasVoiceMessage: !!audioDataUrl,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-10 bg-cream text-center"
    >
      <h1 className="font-heading text-2xl text-forest mb-6">{t('guestbookTitle')}</h1>

      {submitted ? (
        <Card className="w-full max-w-sm">
          <p className="text-[15px] text-charcoal/85 mb-2">{t('guestbookThankYou')}</p>
          {savedAudioUrl && <audio src={savedAudioUrl} controls className="w-full mb-3" />}
          <p className="text-xs text-charcoal/50 mb-4">{t('guestbookLocalNotice')}</p>
          <Button fullWidth onClick={onDone}>
            {t('continueLabel')}
          </Button>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 text-left">
          <div>
            <label htmlFor="guest-name" className="block text-xs font-semibold text-forest/70 mb-1.5">
              {t('yourName')}
            </label>
            <input
              id="guest-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-forest/20 bg-ivory px-4 py-3 text-[15px] outline-none focus:border-gold"
            />
          </div>
          <div>
            <label htmlFor="guest-message" className="block text-xs font-semibold text-forest/70 mb-1.5">
              {t('yourMessage')}
            </label>
            <textarea
              id="guest-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="w-full rounded-xl border border-forest/20 bg-ivory px-4 py-3 text-[15px] outline-none focus:border-gold resize-none"
            />
          </div>

          <VoiceRecorderField onChange={setVoiceBlob} />

          <p className="text-xs text-charcoal/50">{t('guestbookLocalNotice')}</p>
          <Button type="submit" fullWidth disabled={submitting}>
            {t('submit')}
          </Button>
        </form>
      )}
    </motion.div>
  );
}
