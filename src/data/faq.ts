export interface FaqEntry {
  id: string;
  keywordsEn: string[];
  keywordsMl: string[];
  answerEn: string;
  answerMl: string;
  action?: 'startJourney' | 'callHost' | 'whatsappHost';
}

// Local, offline keyword/intent matcher — no AI API involved.
export const faqEntries: FaqEntry[] = [
  {
    id: 'where-is-dua',
    keywordsEn: ['where is dua', 'where is the house', 'location', 'where'],
    keywordsMl: ['എവിടെ', 'വീട് എവിടെ', 'ലൊക്കേഷൻ'],
    answerEn: 'DUA is located at Thonichra, Naduvattom. Would you like to start your Journey Experience?',
    answerMl: 'DUA സ്ഥിതി ചെയ്യുന്നത് തോണിച്ചറ, നടുവട്ടത്താണ്. യാത്ര ആരംഭിക്കണോ?',
    action: 'startJourney',
  },
  {
    id: 'address',
    keywordsEn: ['address', 'what is the address'],
    keywordsMl: ['വിലാസം'],
    answerEn: 'The address is Thonichra, Naduvattom, Kerala, India.',
    answerMl: 'വിലാസം: തോണിച്ചറ, നടുവട്ടം, കേരളം, ഇന്ത്യ.',
  },
  {
    id: 'date',
    keywordsEn: ['what date', 'when is the event', 'date'],
    keywordsMl: ['തീയതി', 'എപ്പോൾ'],
    answerEn: 'The house warming ceremony is on Sunday, 18 October 2026.',
    answerMl: 'ഗൃഹപ്രവേശന ചടങ്ങ് 2026 ഒക്ടോബർ 18, ഞായറാഴ്ച നടക്കും.',
  },
  {
    id: 'time',
    keywordsEn: ['what time', 'timing', 'time'],
    keywordsMl: ['സമയം'],
    answerEn: 'The event is from 11:00 AM to 4:00 PM.',
    answerMl: 'ചടങ്ങ് രാവിലെ 11 മുതൽ വൈകുന്നേരം 4 വരെ.',
  },
  {
    id: 'who-is-hosting',
    keywordsEn: ['who is hosting', 'host', 'who'],
    keywordsMl: ['ആരാണ്', 'ആതിഥേയർ'],
    answerEn: 'The event is hosted by Majeed & Kamarunnisa at their new home, DUA.',
    answerMl: 'മജീദ് & കമറുന്നിസ ആണ് ആതിഥേയർ, അവരുടെ പുതിയ വീടായ DUA-യിൽ.',
  },
  {
    id: 'how-to-reach',
    keywordsEn: ['how do i reach', 'reach dua', 'directions', 'how to get'],
    keywordsMl: ['എങ്ങനെ എത്താം', 'വഴി'],
    answerEn: 'You can start the built-in Journey Experience and our map will guide you all the way to DUA.',
    answerMl: 'യാത്ര ആരംഭിച്ചാൽ ഞങ്ങളുടെ മാപ്പ് DUA വരെ വഴി കാണിക്കും.',
    action: 'startJourney',
  },
  {
    id: 'how-to-start-journey',
    keywordsEn: ['start journey', 'how do i start', 'journey experience'],
    keywordsMl: ['യാത്ര എങ്ങനെ', 'യാത്ര ആരംഭിക്കുക'],
    answerEn: 'Tap "Start My Journey" on the event details page, allow location access, and follow the live map.',
    answerMl: '"യാത്ര ആരംഭിക്കുക" ബട്ടൺ അമർത്തി ലൊക്കേഷൻ അനുവദിച്ച് മാപ്പ് പിന്തുടരുക.',
    action: 'startJourney',
  },
  {
    id: 'why-location',
    keywordsEn: ['why do you need my location', 'why location', 'privacy'],
    keywordsMl: ['എന്തിനാണ് ലൊക്കേഷൻ', 'സ്വകാര്യത'],
    answerEn: 'We only use your location during your Journey Experience so we can recognize your arrival and welcome you. It is never shown publicly.',
    answerMl: 'യാത്രാ അനുഭവത്തിനായി മാത്രം ലൊക്കേഷൻ ഉപയോഗിക്കുന്നു, ഇത് പരസ്യമായി കാണിക്കില്ല.',
  },
  {
    id: 'location-not-working',
    keywordsEn: ["what if location doesn't work", 'location not working', 'gps not working'],
    keywordsMl: ['ലൊക്കേഷൻ പ്രവർത്തിക്കുന്നില്ല'],
    answerEn: "No problem — you can still explore DUA without Journey Mode, and call or WhatsApp the hosts for directions.",
    answerMl: 'കുഴപ്പമില്ല — ജേർണി മോഡ് ഇല്ലാതെയും DUA കാണാം, ആതിഥേയരെ വിളിക്കുകയോ വാട്സ്ആപ്പ് ചെയ്യുകയോ ചെയ്യാം.',
    action: 'whatsappHost',
  },
  {
    id: 'contact-hosts',
    keywordsEn: ['contact', 'phone number', 'call', 'how can i contact'],
    keywordsMl: ['ബന്ധപ്പെടുക', 'ഫോൺ നമ്പർ', 'വിളിക്കുക'],
    answerEn: 'You can call or WhatsApp the hosts at 9847704490.',
    answerMl: 'ആതിഥേയരെ 9847704490 എന്ന നമ്പറിൽ വിളിക്കുകയോ വാട്സ്ആപ്പ് ചെയ്യുകയോ ചെയ്യാം.',
    action: 'callHost',
  },
  {
    id: 'house-name',
    keywordsEn: ['what is the house name', 'house name', 'dua meaning'],
    keywordsMl: ['വീടിന്റെ പേര്'],
    answerEn: 'The house is named "DUA".',
    answerMl: 'വീടിന്റെ പേര് "DUA" എന്നാണ്.',
  },
];

export function matchFaq(query: string, lang: 'en' | 'ml'): FaqEntry | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  let best: { entry: FaqEntry; score: number } | null = null;
  for (const entry of faqEntries) {
    const keywords = lang === 'en' ? entry.keywordsEn : entry.keywordsMl;
    for (const keyword of keywords) {
      const kw = keyword.toLowerCase();
      if (normalized.includes(kw)) {
        const score = kw.length;
        if (!best || score > best.score) best = { entry, score };
      }
    }
  }
  return best?.entry ?? null;
}
