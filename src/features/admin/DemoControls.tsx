import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { demoDistancePresets } from '../../services/journeyService';
import { postDemoMessage } from '../../utils/demoChannel';
import { useLanguage } from '../../hooks/useLanguage';

export function DemoControls() {
  const { t } = useLanguage();

  return (
    <Card>
      <h2 className="font-heading text-lg text-forest mb-1">{t('demoJourney')}</h2>
      <p className="text-xs text-charcoal/50 mb-4">
        Open the invitation link in another tab, start the journey there, then trigger these — the guest screen
        updates live.
      </p>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <Button variant="outline" onClick={() => postDemoMessage({ type: 'DEMO_START' })}>
          START
        </Button>
        {demoDistancePresets.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            onClick={() => postDemoMessage({ type: 'DEMO_DISTANCE', meters: preset.meters })}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" onClick={() => postDemoMessage({ type: 'DEMO_ARRIVED' })}>
          ARRIVED
        </Button>
        <Button variant="secondary" onClick={() => postDemoMessage({ type: 'DEMO_DEPARTED' })}>
          DEPARTED
        </Button>
        <Button variant="secondary" onClick={() => postDemoMessage({ type: 'DEMO_THANK_YOU' })}>
          THANK YOU
        </Button>
      </div>

      <Button
        variant="ghost"
        fullWidth
        className="mt-3"
        onClick={() => postDemoMessage({ type: 'DEMO_RESET' })}
      >
        Reset Journey
      </Button>
    </Card>
  );
}
