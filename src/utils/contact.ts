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
