import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChatModal } from '../../../components/chat/ChatModal';
import { HostBubble, GuestBubble, TypingDots, QuickReplies, StepperBubble, ChatComposer } from '../../../components/chat/ChatBubbles';
import { Button } from '../../../components/Button';
import { useLanguage } from '../../../hooks/useLanguage';
import { storageService, type RsvpStatus } from '../../../services/storageService';
import { notifyHost } from '../../../services/notifyHostService';
import { playChime } from '../../../utils/chime';
import { formatRsvpByDate } from '../../../utils/dateTime';

type Node = { id: string; from: 'host' | 'guest'; content: ReactNode };
type Prompt = 'none' | 'choices' | 'headcount' | 'names' | 'dietary';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
let uid = 0;
const nextId = () => `n${uid++}`;

export function RsvpChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const guestName = storageService.getGuestName();
  const rsvpByDate = formatRsvpByDate();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [typing, setTyping] = useState(false);
  const [prompt, setPrompt] = useState<Prompt>('none');
  const [guests, setGuests] = useState(storageService.getGuests());
  const [namesInput, setNamesInput] = useState('');
  const [dietaryInput, setDietaryInput] = useState('');
  const runIdRef = useRef(0);
  const hasRunRef = useRef(false);

  const say = async (content: ReactNode, runId: number, delayMs = 650) => {
    setTyping(true);
    await sleep(delayMs);
    if (runIdRef.current !== runId) return;
    setTyping(false);
    setNodes((prev) => [...prev, { id: nextId(), from: 'host', content }]);
  };
  const reply = (content: ReactNode) => setNodes((prev) => [...prev, { id: nextId(), from: 'guest', content }]);

  const sendRsvp = (status: RsvpStatus, extra?: { guests?: number; dietaryNotes?: string; guestNames?: string }) => {
    notifyHost({
      type: 'rsvp',
      guestId: storageService.getGuestId(),
      guestName: guestName ?? 'Guest',
      rsvpStatus: status,
      guests: status === 'yes' ? (extra?.guests ?? guests) : undefined,
      dietaryNotes: status === 'yes' ? extra?.dietaryNotes : undefined,
      guestNames: status === 'yes' ? extra?.guestNames : undefined,
    });
  };

  const runFollowUp = async (status: RsvpStatus, runId: number) => {
    if (status === 'yes') {
      await say(t('chatRsvpYesFollowUp'), runId);
      if (runIdRef.current !== runId) return;
      setPrompt('headcount');
      return;
    }
    await say(status === 'maybe' ? t('chatRsvpThanksMaybe') : t('chatRsvpThanksNo'), runId);
    if (runIdRef.current !== runId) return;
    setPrompt('none');
  };

  const handleChoice = async (value: string) => {
    const status = value as RsvpStatus;
    const runId = ++runIdRef.current;
    storageService.setRsvp(status);
    if (status === 'yes') {
      playChime();
      navigator.vibrate?.(30);
    }
    setPrompt('none');
    reply(status === 'yes' ? t('chatRsvpYesReply') : status === 'maybe' ? t('chatRsvpMaybeReply') : t('chatRsvpNoReply'));
    sendRsvp(status);
    await runFollowUp(status, runId);
  };

  const handleHeadcountConfirm = async () => {
    const runId = ++runIdRef.current;
    storageService.setGuests(guests);
    setPrompt('none');
    reply(`${guests} ${t('guestsWord')}`);
    sendRsvp('yes', { guests });
    await say(t('chatRsvpAskNames'), runId);
    if (runIdRef.current !== runId) return;
    setPrompt('names');
  };

  const handleNamesSubmit = async (skip: boolean) => {
    const runId = ++runIdRef.current;
    const value = skip ? '' : namesInput.trim();
    storageService.setGuestNames(value);
    setPrompt('none');
    if (value) reply(value);
    sendRsvp('yes', { guests, guestNames: value || undefined });
    await say(t('chatRsvpAskDietary'), runId);
    if (runIdRef.current !== runId) return;
    setPrompt('dietary');
  };

  const handleDietarySubmit = async (skip: boolean) => {
    const runId = ++runIdRef.current;
    const value = skip ? '' : dietaryInput.trim();
    storageService.setDietaryNotes(value);
    setPrompt('none');
    if (value) reply(value);
    sendRsvp('yes', { guests, dietaryNotes: value || undefined, guestNames: storageService.getGuestNames() || undefined });
    await say(t('chatRsvpThanksYes'), runId);
  };

  const handleRestart = () => {
    runIdRef.current++;
    hasRunRef.current = false;
    setNodes([]);
    setPrompt('none');
  };

  // On open: either replay the existing RSVP as history (returning guest),
  // or run the intro script and ask the question fresh.
  useEffect(() => {
    if (!open || hasRunRef.current) return;
    hasRunRef.current = true;
    const runId = ++runIdRef.current;
    const existing = storageService.getRsvp();

    (async () => {
      if (existing) {
        setNodes([
          { id: nextId(), from: 'host', content: t('chatRsvpQuestion') },
          {
            id: nextId(),
            from: 'guest',
            content: existing === 'yes' ? t('chatRsvpYesReply') : existing === 'maybe' ? t('chatRsvpMaybeReply') : t('chatRsvpNoReply'),
          },
          {
            id: nextId(),
            from: 'host',
            content: existing === 'yes' ? t('chatRsvpThanksYes') : existing === 'maybe' ? t('chatRsvpThanksMaybe') : t('chatRsvpThanksNo'),
          },
        ]);
        setPrompt('none');
        return;
      }
      if (guestName) await say(`${t('dearGuest')} ${guestName} 👋`, runId, 400);
      if (runIdRef.current !== runId) return;
      await say(rsvpByDate ? `${t('chatRsvpQuestion')} (${t('kindlyRsvpBy')} ${rsvpByDate})` : t('chatRsvpQuestion'), runId);
      if (runIdRef.current !== runId) return;
      setPrompt('choices');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <ChatModal open={open} onClose={onClose} icon="🚪">
      {nodes.map((n) =>
        n.from === 'host' ? <HostBubble key={n.id}>{n.content}</HostBubble> : <GuestBubble key={n.id}>{n.content}</GuestBubble>,
      )}
      {typing && <TypingDots />}

      {prompt === 'choices' && (
        <QuickReplies
          options={[
            { label: t('chatRsvpYesReply'), value: 'yes' },
            { label: t('chatRsvpMaybeReply'), value: 'maybe' },
            { label: t('chatRsvpNoReply'), value: 'no' },
          ]}
          onSelect={handleChoice}
        />
      )}
      {prompt === 'headcount' && (
        <StepperBubble value={guests} onChange={setGuests} onConfirm={handleHeadcountConfirm} confirmLabel={t('chatRsvpGuestsConfirm')} />
      )}
      {prompt === 'names' && (
        <ChatComposer
          value={namesInput}
          onChange={setNamesInput}
          onSubmit={() => handleNamesSubmit(false)}
          onSkip={() => handleNamesSubmit(true)}
          placeholder={t('guestNamesPlaceholder')}
          sendLabel={t('submit')}
          skipLabel={t('notNow')}
        />
      )}
      {prompt === 'dietary' && (
        <ChatComposer
          value={dietaryInput}
          onChange={setDietaryInput}
          onSubmit={() => handleDietarySubmit(false)}
          onSkip={() => handleDietarySubmit(true)}
          placeholder={t('dietaryPreferencesPlaceholder')}
          sendLabel={t('submit')}
          skipLabel={t('notNow')}
        />
      )}
      {prompt === 'none' && !typing && nodes.length > 0 && storageService.getRsvp() && (
        <div className="ml-auto max-w-[92%]">
          <Button variant="ghost" onClick={handleRestart} className="!py-2 text-xs">
            {t('chatRsvpChangeMind')}
          </Button>
        </div>
      )}
    </ChatModal>
  );
}
