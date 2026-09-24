import { Card } from '../../components/Card';
import { useLanguage } from '../../hooks/useLanguage';
import { storageService } from '../../services/storageService';
import type { JourneyState } from '../../services/journeyService';

interface Milestone {
  key: 'invitationOpened' | 'journeyStarted' | 'onTheWay' | 'almostThere' | 'arrivedAtDua' | 'thankYouHeart';
  done: boolean;
}

function buildMilestones(journeyState: JourneyState): Milestone[] {
  const order: JourneyState[] = [
    'NOT_STARTED',
    'JOURNEY_STARTED',
    'ON_THE_WAY',
    'GETTING_CLOSER',
    'ALMOST_THERE',
    'NEARBY',
    'ARRIVED',
    'DEPARTED',
    'THANK_YOU',
  ];
  const currentIndex = order.indexOf(journeyState);
  const reached = (state: JourneyState) => currentIndex >= order.indexOf(state);

  return [
    { key: 'invitationOpened', done: !!storageService.getInvitationOpenedAt() },
    { key: 'journeyStarted', done: reached('JOURNEY_STARTED') },
    { key: 'onTheWay', done: reached('ON_THE_WAY') },
    { key: 'almostThere', done: reached('ALMOST_THERE') || reached('NEARBY') },
    { key: 'arrivedAtDua', done: reached('ARRIVED') },
    { key: 'thankYouHeart', done: journeyState === 'THANK_YOU' },
  ];
}

export function JourneyProgressCard({ journeyState }: { journeyState: JourneyState }) {
  const { t } = useLanguage();
  const milestones = buildMilestones(journeyState);

  return (
    <Card className="w-full max-w-sm">
      <h2 className="font-heading text-lg text-forest mb-3">{t('yourJourney')}</h2>
      <ul className="space-y-2">
        {milestones.map((m) => (
          <li key={m.key} className="flex items-center gap-2 text-sm">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                m.done ? 'bg-forest text-ivory' : 'bg-forest/10 text-forest/40'
              }`}
            >
              {m.done ? '✓' : ''}
            </span>
            <span className={m.done ? 'text-charcoal' : 'text-charcoal/40'}>{t(m.key)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
