import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/Button';
import { BottomSheet } from '../../components/BottomSheet';
import { useLanguage } from '../../hooks/useLanguage';
import { matchFaq } from '../../data/faq';
import { telLink, whatsappLink } from '../../utils/contact';

interface ChatTurn {
  question: string;
  answer: string;
  action?: 'startJourney' | 'callHost' | 'whatsappHost';
}

export function AskDuaWidget({ onStartJourney }: { onStartJourney: () => void }) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [turns, setTurns] = useState<ChatTurn[]>([]);

  const ask = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    const match = matchFaq(trimmed, language);
    const answer = match ? (language === 'en' ? match.answerEn : match.answerMl) : t('askDuaNoMatch');
    setTurns((prev) => [...prev, { question: trimmed, answer, action: match?.action }]);
    setQuery('');
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.95 }}
        aria-label={t('askDua')}
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-30 flex items-center gap-2 rounded-full bg-forest px-4 py-3 text-sm font-semibold text-ivory shadow-xl shadow-forest/30"
      >
        💬 {t('askDua')}
      </motion.button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={t('askDua')}>
        <div className="max-h-[45vh] overflow-y-auto space-y-4 mb-4">
          {turns.length === 0 && <p className="text-sm text-charcoal/50">{t('askDuaPlaceholder')}</p>}
          {turns.map((turn, i) => (
            <div key={i} className="space-y-1.5">
              <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-forest text-ivory px-4 py-2 text-sm w-fit">
                {turn.question}
              </p>
              <p className="max-w-[85%] rounded-2xl rounded-bl-sm bg-forest/8 px-4 py-2 text-sm text-charcoal">
                {turn.answer}
              </p>
              {turn.action === 'startJourney' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    onStartJourney();
                  }}
                >
                  {t('startMyJourneyEmoji')}
                </Button>
              )}
              {turn.action === 'callHost' && (
                <a href={telLink()}>
                  <Button variant="outline">📞 {t('callHost')}</Button>
                </a>
              )}
              {turn.action === 'whatsappHost' && (
                <a href={whatsappLink()} target="_blank" rel="noreferrer">
                  <Button variant="outline">💬 {t('whatsappHost')}</Button>
                </a>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={ask} className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('askDuaPlaceholder')}
            className="flex-1 rounded-full border border-forest/20 bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
          <Button type="submit" className="!px-5 !py-2.5">
            →
          </Button>
        </form>
      </BottomSheet>
    </>
  );
}
