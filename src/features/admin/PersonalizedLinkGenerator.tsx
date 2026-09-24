import { useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { QrCode } from '../../components/QrCode';

export function PersonalizedLinkGenerator() {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  const baseUrl = `${window.location.origin}${window.location.pathname.replace(/admin\/?$/, '')}`;
  const link = name.trim()
    ? `${baseUrl}?to=${encodeURIComponent(name.trim())}${note.trim() ? `&note=${encodeURIComponent(note.trim())}` : ''}`
    : '';

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — the link is still visible to copy by hand
    }
  };

  return (
    <Card>
      <h2 className="font-heading text-lg text-forest mb-1">Personalised Links</h2>
      <p className="text-xs text-charcoal/50 mb-4">
        Generate a link for one guest — when they open it, the invitation greets them by name.
      </p>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Guest's name"
          className="flex-1 rounded-xl border border-forest/20 bg-cream px-3.5 py-2.5 text-sm outline-none focus:border-gold"
        />
        <Button type="button" variant="outline" className="!px-4" onClick={handleCopy} disabled={!link}>
          {copied ? 'Copied ✓' : 'Copy'}
        </Button>
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Personal note (optional) — e.g. Reserved seating for you"
        className="mt-2 w-full rounded-xl border border-forest/20 bg-cream px-3.5 py-2.5 text-sm outline-none focus:border-gold"
      />
      {link && (
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-forest/5 p-2.5">
          <QrCode value={link} size={72} />
          <p className="break-all text-xs text-forest">{link}</p>
        </div>
      )}

      <div className="mt-5 border-t border-gold-deep/15 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/50 mb-2">
          General invitation QR
        </p>
        <div className="flex items-center gap-3">
          <QrCode value={baseUrl} size={72} />
          <p className="text-xs text-charcoal/50">
            For a printed card or a sign at the venue — no name attached.
          </p>
        </div>
      </div>
    </Card>
  );
}
