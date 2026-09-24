import { Link } from 'react-router-dom';
import { Badge, Card } from '../../components/Card';
import { useEventConfig } from '../../hooks/useEventConfig';
import { DemoControls } from './DemoControls';
import { EventSettingsForm } from './EventSettingsForm';
import { PersonalizedLinkGenerator } from './PersonalizedLinkGenerator';

const demoStats: { label: string; value: number }[] = [
  { label: 'Invitation Opens', value: 126 },
  { label: 'Confirmed', value: 82 },
  { label: 'On the Way', value: 21 },
  { label: 'Nearby', value: 7 },
  { label: 'Arrived', value: 18 },
  { label: 'Departed', value: 11 },
];

export function AdminDashboard() {
  const eventConfig = useEventConfig();

  return (
    <div className="min-h-dvh bg-cream px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading text-2xl text-forest">{eventConfig.houseName} — Event Control Center</h1>
          <Link to="/" className="text-sm text-forest underline underline-offset-2">
            View invitation
          </Link>
        </div>
        <p className="text-sm text-charcoal/60 mb-6">{eventConfig.hostNames} · {eventConfig.eventDate}</p>

        <div className="mb-3">
          <Badge tone="gold">DEMO DATA</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {demoStats.map((stat) => (
            <Card key={stat.label} className="text-center py-5">
              <p className="text-3xl font-heading text-forest">{stat.value}</p>
              <p className="text-xs uppercase tracking-wide text-charcoal/50 mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <DemoControls />
            <PersonalizedLinkGenerator />
          </div>
          <EventSettingsForm />
        </div>
      </div>
    </div>
  );
}
