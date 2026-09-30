import { getEffectiveEventConfig } from '../services/adminConfigService';
import { formatEventDate, formatEventTimeRange } from './dateTime';

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function telLink(): string {
  return `tel:${getEffectiveEventConfig().phone}`;
}

export function whatsappLink(message?: string): string {
  const countryCoded = `91${digitsOnly(getEffectiveEventConfig().phone)}`; // Kerala, India
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${countryCoded}${text}`;
}

/**
 * A downloadable vCard for the host, so their number goes straight into
 * the guest's phone contacts rather than just being tap-to-call. Built
 * as a `data:` URI (no Blob/object-URL cleanup needed) — small enough
 * that every browser handles it fine as a direct download link.
 */
export function hostVCardDataUrl(): string {
  const cfg = getEffectiveEventConfig();
  const digits = digitsOnly(cfg.phone);
  const vcard = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${cfg.hostNames}`, `ORG:${cfg.houseName}`, `TEL;TYPE=CELL:+91${digits}`, 'END:VCARD'].join(
    '\r\n',
  );
  return `data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`;
}

export function invitationShareText(link: string): string {
  const cfg = getEffectiveEventConfig();
  return [
    `You are warmly invited to our house-warming ceremony at ${cfg.houseName} ❤️`,
    '',
    formatEventDate(),
    formatEventTimeRange(),
    cfg.address,
    '',
    `Open your invitation:`,
    link,
  ].join('\n');
}

export async function shareInvitation(link: string): Promise<'shared' | 'copied' | 'failed'> {
  const cfg = getEffectiveEventConfig();
  const text = invitationShareText(link);
  if (navigator.share) {
    try {
      await navigator.share({ title: `You're Invited to ${cfg.houseName} 🏡`, text, url: link });
      return 'shared';
    } catch {
      // user cancelled or share failed — fall through to copy
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
