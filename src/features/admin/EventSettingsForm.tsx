import { useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import type { EventConfig } from '../../config/event';
import { clearEventConfigOverrides, getEffectiveEventConfig, setEventConfigOverrides } from '../../services/adminConfigService';
import { requestCurrentPosition } from '../../services/geolocationService';

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-forest/70 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-xl border border-forest/20 bg-cream px-3.5 py-2.5 text-sm outline-none focus:border-gold';

export function EventSettingsForm() {
  const [form, setForm] = useState<EventConfig>(() => getEffectiveEventConfig());
  const [saved, setSaved] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const update = <K extends keyof EventConfig>(key: K, value: EventConfig[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setEventConfigOverrides(form);
    setSaved(true);
  };

  const handleReset = () => {
    clearEventConfigOverrides();
    const fresh = getEffectiveEventConfig();
    setForm(fresh);
    setSaved(false);
  };

  const handleFetchLocation = async () => {
    setLocating(true);
    setLocateError(null);
    try {
      const sample = await requestCurrentPosition();
      setForm((prev) => ({
        ...prev,
        latitude: Number(sample.coords.latitude.toFixed(6)),
        longitude: Number(sample.coords.longitude.toFixed(6)),
      }));
      setSaved(false);
    } catch (err) {
      const reason = (err as { reason?: string })?.reason ?? 'unavailable';
      setLocateError(
        reason === 'denied'
          ? 'Location access was denied — allow it in your browser/device settings and try again.'
          : reason === 'unsupported'
            ? "This browser doesn't support geolocation."
            : "Couldn't get a location fix — try again, ideally outdoors or near a window.",
      );
    } finally {
      setLocating(false);
    }
  };

  const configSnippet = `latitude: ${form.latitude ?? 'null'},\n  longitude: ${form.longitude ?? 'null'},`;
  const [snippetCopied, setSnippetCopied] = useState(false);
  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(configSnippet);
      setSnippetCopied(true);
      setTimeout(() => setSnippetCopied(false), 2000);
    } catch {
      // clipboard unavailable — the snippet is still visible to copy by hand
    }
  };

  return (
    <Card>
      <h2 className="font-heading text-lg text-forest mb-1">Event Settings</h2>
      <p className="text-xs text-charcoal/50 mb-4">
        Saved only in this browser, for demo purposes. Edit <code>src/config/event.ts</code> for the real
        deployed build.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="House Name">
          <input className={inputClass} value={form.houseName} onChange={(e) => update('houseName', e.target.value)} />
        </Field>
        <Field label="Host Names">
          <input className={inputClass} value={form.hostNames} onChange={(e) => update('hostNames', e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input type="date" className={inputClass} value={form.eventDate} onChange={(e) => update('eventDate', e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className={inputClass} value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </Field>
          <Field label="Start Time">
            <input type="time" className={inputClass} value={form.startTime} onChange={(e) => update('startTime', e.target.value)} />
          </Field>
          <Field label="End Time">
            <input type="time" className={inputClass} value={form.endTime} onChange={(e) => update('endTime', e.target.value)} />
          </Field>
        </div>
        <Field label="Address">
          <input className={inputClass} value={form.address} onChange={(e) => update('address', e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude">
            <input
              type="number"
              step="any"
              className={inputClass}
              value={form.latitude ?? ''}
              placeholder="Not set"
              onChange={(e) => update('latitude', e.target.value === '' ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Longitude">
            <input
              type="number"
              step="any"
              className={inputClass}
              value={form.longitude ?? ''}
              placeholder="Not set"
              onChange={(e) => update('longitude', e.target.value === '' ? null : Number(e.target.value))}
            />
          </Field>
        </div>

        <div className="rounded-xl border border-dashed border-forest/25 bg-cream/60 p-3">
          <Button type="button" variant="outline" fullWidth onClick={handleFetchLocation} disabled={locating}>
            {locating ? 'Getting your location…' : '📍 Use My Current Location'}
          </Button>
          <p className="text-xs text-charcoal/50 mt-2">
            Stand at the DUA gate/entrance with this page open on your phone, then tap this to fill in the exact
            coordinates from your device's GPS.
          </p>
          {locateError && <p className="text-xs text-red-600 mt-2">{locateError}</p>}

          {form.latitude != null && form.longitude != null && (
            <div className="mt-3 rounded-lg bg-forest/5 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs text-forest break-all">{configSnippet}</code>
                <Button type="button" variant="ghost" className="!px-3 !py-1.5 !text-xs shrink-0" onClick={handleCopySnippet}>
                  {snippetCopied ? 'Copied ✓' : 'Copy'}
                </Button>
              </div>
              <p className="text-xs text-charcoal/50 mt-1.5">
                Paste this into <code>src/config/event.ts</code> so every guest gets the real location — Save
                Settings below only stores it in this browser.
              </p>
            </div>
          )}
        </div>
        <div className="rounded-xl border border-dashed border-forest/25 bg-cream/60 p-3">
          <Field label="Host Notifications Webhook URL (optional)">
            <input
              className={inputClass}
              value={form.hostNotifyWebhookUrl ?? ''}
              placeholder="https://script.google.com/macros/s/.../exec"
              onChange={(e) => update('hostNotifyWebhookUrl', e.target.value.trim() === '' ? null : e.target.value.trim())}
            />
          </Field>
          <p className="text-xs text-charcoal/50 mt-2">
            When set, every RSVP and guestbook message also gets posted here — the one way to see responses
            without a backend. See &ldquo;Seeing RSVPs as a host&rdquo; in the README for the free 5-minute Google
            Sheet + Apps Script setup. Leave blank to skip.
          </p>
          {form.hostNotifyWebhookUrl && (
            <p className="text-xs text-charcoal/50 mt-1.5">
              Paste this into <code>src/config/event.ts</code> (<code>hostNotifyWebhookUrl</code>) for the real
              deployed build — Save Settings below only stores it in this browser.
            </p>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Arrival Radius (m)">
            <input
              type="number"
              className={inputClass}
              value={form.arrivalRadius}
              onChange={(e) => update('arrivalRadius', Number(e.target.value))}
            />
          </Field>
          <Field label="Nearby Radius (m)">
            <input
              type="number"
              className={inputClass}
              value={form.nearbyRadius}
              onChange={(e) => update('nearbyRadius', Number(e.target.value))}
            />
          </Field>
          <Field label="Departure Delay (min)">
            <input
              type="number"
              className={inputClass}
              value={form.departureDelayMinutes}
              onChange={(e) => update('departureDelayMinutes', Number(e.target.value))}
            />
          </Field>
        </div>
        <Field label="English Welcome Message">
          <textarea
            rows={3}
            className={inputClass}
            value={form.welcomeMessageEn}
            onChange={(e) => update('welcomeMessageEn', e.target.value)}
          />
        </Field>
        <Field label="Malayalam Welcome Message">
          <textarea
            rows={3}
            className={inputClass}
            value={form.welcomeMessageMl}
            onChange={(e) => update('welcomeMessageMl', e.target.value)}
          />
        </Field>
        <Field label="English Thank You Message">
          <textarea
            rows={3}
            className={inputClass}
            value={form.thankYouMessageEn}
            onChange={(e) => update('thankYouMessageEn', e.target.value)}
          />
        </Field>
        <Field label="Malayalam Thank You Message">
          <textarea
            rows={3}
            className={inputClass}
            value={form.thankYouMessageMl}
            onChange={(e) => update('thankYouMessageMl', e.target.value)}
          />
        </Field>

        <div className="flex gap-3 pt-2">
          <Button type="submit" fullWidth>
            {saved ? 'Saved ✓' : 'Save Settings'}
          </Button>
          <Button type="button" variant="ghost" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </form>
    </Card>
  );
}
