import { useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { QrCode } from '../../components/QrCode';

function buildLink(baseUrl: string, name: string, note?: string): string {
  const params = `?to=${encodeURIComponent(name)}${note ? `&note=${encodeURIComponent(note)}` : ''}`;
  return `${baseUrl}${params}`;
}

interface BulkRow {
  name: string;
  note?: string;
  link: string;
}

/** Parses "Name" or "Name | note" per line, skipping blanks. */
function parseBulkInput(raw: string, baseUrl: string): BulkRow[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, ...noteParts] = line.split('|');
      const name = namePart.trim();
      const note = noteParts.join('|').trim() || undefined;
      return { name, note, link: buildLink(baseUrl, name, note) };
    })
    .filter((row) => row.name.length > 0);
}

export function PersonalizedLinkGenerator() {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [bulkCopiedAll, setBulkCopiedAll] = useState(false);
  const [bulkCopiedRow, setBulkCopiedRow] = useState<number | null>(null);

  const baseUrl = `${window.location.origin}${window.location.pathname.replace(/admin\/?$/, '')}`;
  const link = name.trim() ? buildLink(baseUrl, name.trim(), note.trim() || undefined) : '';
  const bulkRows = useMemo(() => parseBulkInput(bulkInput, baseUrl), [bulkInput, baseUrl]);

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

  const handleCopyRow = async (row: BulkRow, index: number) => {
    try {
      await navigator.clipboard.writeText(row.link);
      setBulkCopiedRow(index);
      setTimeout(() => setBulkCopiedRow((current) => (current === index ? null : current)), 2000);
    } catch {
      // clipboard unavailable — the link is still visible to copy by hand
    }
  };

  const handleCopyAll = async () => {
    if (!bulkRows.length) return;
    const text = bulkRows.map((row) => `${row.name}: ${row.link}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setBulkCopiedAll(true);
      setTimeout(() => setBulkCopiedAll(false), 2000);
    } catch {
      // clipboard unavailable — copy each link individually instead
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
        <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/50 mb-1">
          Bulk generate
        </p>
        <p className="text-xs text-charcoal/50 mb-2">
          One guest per line: <code>Name</code> or <code>Name | personal note</code>.
        </p>
        <textarea
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          rows={4}
          placeholder={'Ahmed Rasheed\nFathima | Reserved seating for you\nNoor Family'}
          className="w-full rounded-xl border border-forest/20 bg-cream px-3.5 py-2.5 text-sm outline-none focus:border-gold resize-none"
        />
        {bulkRows.length > 0 && (
          <>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-charcoal/50">
                {bulkRows.length} link{bulkRows.length === 1 ? '' : 's'} generated
              </p>
              <Button type="button" variant="outline" className="!px-3 !py-1.5 !text-xs" onClick={handleCopyAll}>
                {bulkCopiedAll ? 'Copied ✓' : 'Copy All'}
              </Button>
            </div>
            <ul className="mt-2 max-h-64 space-y-1.5 overflow-y-auto">
              {bulkRows.map((row, i) => (
                <li key={`${row.name}-${i}`} className="flex items-center gap-2 rounded-lg bg-forest/5 p-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-forest">{row.name}</p>
                    <p className="truncate text-xs text-charcoal/50">{row.link}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="!px-2.5 !py-1.5 !text-xs shrink-0"
                    onClick={() => handleCopyRow(row, i)}
                  >
                    {bulkCopiedRow === i ? '✓' : 'Copy'}
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

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
