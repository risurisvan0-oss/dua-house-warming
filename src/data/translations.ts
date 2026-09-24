export type Language = 'en' | 'ml';

export type TranslationKey = keyof typeof translations;

export const bismillahArabic = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

export const translations = {
  // ---- Opening ----
  bismillahTranslation: {
    en: 'In the name of Allah, the Most Gracious, the Most Merciful',
    ml: 'പരമകാരുണികനും കരുണാനിധിയുമായ അല്ലാഹുവിന്റെ നാമത്തിൽ',
  },
  youAreInvited: { en: 'You are warmly invited', ml: 'താങ്കൾക്ക് സ്നേഹപൂർവ്വം ക്ഷണം' },
  houseWarmingCeremony: { en: 'House Warming Ceremony', ml: 'ഗൃഹപ്രവേശന ചടങ്ങ്' },
  enterInvitation: { en: 'Enter Invitation', ml: 'ക്ഷണം തുറക്കുക' },
  aSpecialInvitationFor: { en: 'A special invitation for', ml: 'ഒരു പ്രത്യേക ക്ഷണം' },
  gratitudeInvite: {
    en: 'With hearts full of gratitude, we cordially invite you',
    ml: 'നിറഞ്ഞ മനസ്സോടെ ഞങ്ങൾ താങ്കളെ സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു',
  },
  dragDoorsHint: { en: 'Drag the doors apart to enter', ml: 'അകത്തേക്ക് കടക്കാൻ വാതിലുകൾ വശങ്ങളിലേക്ക് വലിക്കുക' },
  openDoors: { en: 'Open the doors', ml: 'വാതിൽ തുറക്കുക' },
  chapterCourtyard: { en: 'Chapter I · The Courtyard', ml: 'അധ്യായം I · മുറ്റം' },
  chapterVeranda: { en: 'Chapter II · The Veranda', ml: 'അധ്യായം II · വരാന്ത' },
  chapterMajlis: { en: 'Chapter III · The Majlis', ml: 'അധ്യായം III · മജ്ലിസ്' },
  chapterGate: { en: 'Chapter IV · The Gate', ml: 'അധ്യായം IV · ഗേറ്റ്' },
  scrollToVeranda: { en: 'Scroll to the veranda', ml: 'വരാന്തയിലേക്ക് സ്ക്രോൾ ചെയ്യുക' },
  howManyOfYou: { en: 'How many of you?', ml: 'എത്ര പേർ?' },
  includingYou: { en: 'Including you', ml: 'താങ്കൾ ഉൾപ്പെടെ' },
  guestsWord: { en: 'guests', ml: 'പേരെ' },
  timeLabel: { en: 'Time', ml: 'സമയം' },
  placeLabel: { en: 'Place', ml: 'സ്ഥലം' },

  // ---- Welcome ----
  welcomeToDua: { en: 'Welcome to DUA', ml: 'DUA-യിലേക്ക് സ്വാഗതം' },
  exploreInvitation: { en: 'Explore Invitation', ml: 'ക്ഷണം കാണുക' },
  dearGuest: { en: 'Dear', ml: 'പ്രിയപ്പെട്ട' },

  // ---- Event details ----
  sunday: { en: 'Sunday', ml: 'ഞായറാഴ്ച' },
  hijriDate: { en: 'Islamic date', ml: 'ഹിജ്റ തീയതി' },
  weatherAtDua: { en: 'Weather at DUA right now', ml: 'DUA-യിലെ ഇപ്പോഴത്തെ കാലാവസ്ഥ' },
  eventIsLiveToday: { en: "🎉 It's happening today!", ml: '🎉 ഇന്നാണ് ചടങ്ങ്!' },
  saveTheDate: { en: 'Save the Date', ml: 'തീയതി സേവ് ചെയ്യുക' },
  contactHosts: { en: 'Contact Hosts', ml: 'ആതിഥേയരെ ബന്ധപ്പെടുക' },
  startMyJourney: { en: 'Start My Journey', ml: 'യാത്ര ആരംഭിക്കുക' },
  callHost: { en: 'Call Host', ml: 'വിളിക്കുക' },
  whatsappHost: { en: 'WhatsApp Host', ml: 'വാട്സ്ആപ്പ്' },

  // ---- RSVP ----
  willYouJoinUs: { en: 'Will you be joining us?', ml: 'താങ്കൾ പങ്കെടുക്കുമോ?' },
  rsvpYes: { en: "Yes, I'll be there ❤️", ml: 'ഉവ്വ്, ഞാൻ വരും ❤️' },
  rsvpMaybe: { en: 'Maybe', ml: 'ഒരുപക്ഷേ' },
  rsvpNo: { en: "Sorry, can't make it", ml: 'ക്ഷമിക്കണം, വരാൻ കഴിയില്ല' },
  rsvpYesResponse: {
    en: "Wonderful ❤️ We can't wait to welcome you to DUA.",
    ml: 'സന്തോഷം ❤️ താങ്കളെ DUA-യിലേക്ക് സ്വാഗതം ചെയ്യാൻ ഞങ്ങൾ കാത്തിരിക്കുന്നു.',
  },
  rsvpMaybeResponse: {
    en: 'Thank you ❤️ We hope to see you.',
    ml: 'നന്ദി ❤️ താങ്കളെ കാണാൻ ഞങ്ങൾ പ്രതീക്ഷിക്കുന്നു.',
  },
  rsvpNoResponse: {
    en: 'You will be warmly missed ❤️',
    ml: 'താങ്കളെ ഞങ്ങൾ ഏറെ മിസ് ചെയ്യും ❤️',
  },
  continueLabel: { en: 'Continue', ml: 'തുടരുക' },

  // ---- Journey intro ----
  readyToCome: { en: 'Ready to come to DUA?', ml: 'DUA-യിലേക്ക് വരാൻ തയ്യാറാണോ?' },
  letUsWelcomeYou: { en: 'Let us welcome you when you arrive.', ml: 'താങ്കൾ എത്തുമ്പോൾ ഞങ്ങൾ സ്വാഗതം ചെയ്യട്ടെ.' },
  journeyIntroDescription: {
    en: 'Start your Journey Experience and follow the route to DUA using our interactive map.',
    ml: 'യാത്ര ആരംഭിച്ച് ഞങ്ങളുടെ ഇന്ററാക്ടീവ് മാപ്പ് ഉപയോഗിച്ച് DUA-യിലേക്കുള്ള വഴി പിന്തുടരുക.',
  },
  startMyJourneyEmoji: { en: 'Start My Journey 🚗', ml: 'യാത്ര ആരംഭിക്കുക 🚗' },
  notNow: { en: 'Not Now', ml: 'ഇപ്പോൾ വേണ്ട' },

  // ---- Location permission ----
  journeyExperience: { en: 'Journey Experience', ml: 'യാത്രാ അനുഭവം' },
  locationPermissionCopy: {
    en: 'Allow location access while you travel so we can recognize when you arrive at DUA and show you a special welcome.',
    ml: 'താങ്കൾ യാത്ര ചെയ്യുമ്പോൾ ലൊക്കേഷൻ ആക്‌സസ് അനുവദിക്കുക, അതുവഴി DUA-യിൽ എത്തുമ്പോൾ ഞങ്ങൾക്ക് പ്രത്യേക സ്വാഗതം നൽകാനാകും.',
  },
  locationPrivacyCopy: {
    en: 'Your location is used only for your Journey Experience. Your exact location is not shown publicly or to other guests.',
    ml: 'താങ്കളുടെ ലൊക്കേഷൻ യാത്രാ അനുഭവത്തിന് മാത്രമായി ഉപയോഗിക്കുന്നു. ഇത് പരസ്യമായോ മറ്റ് അതിഥികൾക്കോ കാണിക്കില്ല.',
  },
  allowAndStartJourney: { en: 'Allow & Start Journey', ml: 'അനുവദിച്ച് ആരംഭിക്കുക' },
  locationDeniedCopy: {
    en: 'No problem ❤️ You can still explore DUA without Journey Mode.',
    ml: 'കുഴപ്പമില്ല ❤️ ജേർണി മോഡ് ഇല്ലാതെയും DUA കാണാം.',
  },

  // ---- Journey map ----
  yourJourneyToDua: { en: 'Your Journey to DUA', ml: 'DUA-യിലേക്കുള്ള താങ്കളുടെ യാത്ര' },
  distance: { en: 'Distance', ml: 'ദൂരം' },
  estimatedTime: { en: 'Estimated time', ml: 'ഏകദേശ സമയം' },
  journeyStatus: { en: 'Journey status', ml: 'യാത്രയുടെ അവസ്ഥ' },
  stopJourney: { en: 'Stop Journey', ml: 'യാത്ര നിർത്തുക' },
  resumeJourney: { en: 'Resume Journey', ml: 'യാത്ര തുടരുക' },
  keepPageOpenNotice: {
    en: 'For the best Journey Experience, keep this page open while travelling.',
    ml: 'മികച്ച അനുഭവത്തിനായി യാത്രയിൽ ഈ പേജ് തുറന്ന് വെക്കുക.',
  },
  journeyPausedNotice: {
    en: 'Your journey is paused because location updates are unavailable.',
    ml: 'ലൊക്കേഷൻ അപ്ഡേറ്റുകൾ ലഭ്യമല്ലാത്തതിനാൽ യാത്ര താൽക്കാലികമായി നിർത്തിയിരിക്കുന്നു.',
  },
  routeLoadingNotice: { en: 'Your route is taking a moment to load ❤️', ml: 'വഴി ലോഡ് ചെയ്യാൻ അല്പം സമയമെടുക്കുന്നു ❤️' },
  mapLoadingNotice: { en: 'Your map is taking a moment to load ❤️', ml: 'മാപ്പ് ലോഡ് ചെയ്യാൻ അല്പം സമയമെടുക്കുന്നു ❤️' },

  // ---- Distance / journey states ----
  journeyBegun: { en: 'Your journey has begun ❤️', ml: 'താങ്കളുടെ യാത്ര ആരംഭിച്ചു ❤️' },
  gettingCloser: { en: "You're getting closer", ml: 'താങ്കൾ അടുത്തെത്തുന്നു' },
  duaGettingCloser: { en: 'DUA is getting closer', ml: 'DUA അടുത്തെത്തുന്നു' },
  almostThere: { en: 'Almost there', ml: 'ഏകദേശം എത്തി' },
  justALittleFurther: { en: 'Just a little further…', ml: 'ഇനി അല്പം കൂടി…' },
  duaIsNear: { en: 'DUA is near ❤️', ml: 'DUA അടുത്താണ് ❤️' },
  cantWaitToSeeYou: { en: "We can't wait to see you.", ml: 'താങ്കളെ കാണാൻ ഞങ്ങൾ കാത്തിരിക്കുന്നു.' },
  almostHere: { en: "You're almost here", ml: 'താങ്കൾ ഏകദേശം എത്തി' },

  // ---- Arrival ----
  arrived: { en: 'Arrived', ml: 'എത്തിച്ചേർന്നു' },
  youveArrived: { en: "You've Arrived", ml: 'താങ്കൾ എത്തിച്ചേർന്നു' },
  welcomeToDuaHeart: { en: 'Welcome to DUA ❤️', ml: 'DUA-യിലേക്ക് സ്വാഗതം ❤️' },
  enterDua: { en: 'Enter DUA', ml: 'DUA-യിലേക്ക് പ്രവേശിക്കുക' },

  // ---- Event mode ----
  welcomeHome: { en: 'Welcome Home ❤️', ml: 'വീട്ടിലേക്ക് സ്വാഗതം ❤️' },
  makeYourselfAtHome: { en: 'Make yourself at home.', ml: 'സ്വന്തം വീടായി കരുതുക.' },
  saveArrivalKeepsake: { en: 'Save Your Arrival Keepsake', ml: 'നിങ്ങളുടെ ഓർമ്മക്കുറിപ്പ് സേവ് ചെയ്യുക' },
  keepsakeDescription: {
    en: 'A little memento of the moment you arrived at DUA — yours to keep or share.',
    ml: 'DUA-യിൽ എത്തിയ നിമിഷത്തിന്റെ ഒരു ചെറിയ ഓർമ്മക്കുറിപ്പ്.',
  },
  keepsakeGenerating: { en: 'Creating your keepsake…', ml: 'തയ്യാറാക്കുന്നു…' },
  keepsakeReady: { en: 'Keepsake saved ❤️', ml: 'സേവ് ചെയ്തു ❤️' },
  keepsakeFailed: {
    en: "Couldn't create the keepsake — please try again.",
    ml: 'ഓർമ്മക്കുറിപ്പ് ഉണ്ടാക്കാൻ കഴിഞ്ഞില്ല — വീണ്ടും ശ്രമിക്കുക.',
  },

  // ---- Thank you ----
  thankYouForComing: { en: 'Thank You for Coming', ml: 'വന്നതിന് നന്ദി' },
  thankYouLine1: {
    en: 'Your presence made our house-warming even more special.',
    ml: 'താങ്കളുടെ സാന്നിധ്യം ഞങ്ങളുടെ ഗൃഹപ്രവേശനത്തെ കൂടുതൽ പ്രത്യേകമാക്കി.',
  },
  thankYouLine2: {
    en: 'Thank you for taking the time to celebrate this beautiful beginning with us.',
    ml: 'ഈ മനോഹരമായ തുടക്കത്തിൽ പങ്കുചേർന്നതിന് ഹൃദയം നിറഞ്ഞ നന്ദി.',
  },
  thankYouBlessing: {
    en: 'May Allah bless you and your family with happiness, peace and barakah.',
    ml: 'അല്ലാഹു നിങ്ങളെയും കുടുംബത്തെയും സന്തോഷത്തോടെയും സമാധാനത്തോടെയും ബറക്കത്തോടെയും അനുഗ്രഹിക്കട്ടെ.',
  },
  leaveAMessage: { en: 'Leave a Message ❤️', ml: 'ഒരു സന്ദേശം നൽകുക ❤️' },

  // ---- Guestbook ----
  guestbookTitle: { en: 'Leave a Message', ml: 'സന്ദേശം എഴുതുക' },
  yourName: { en: 'Your Name', ml: 'താങ്കളുടെ പേര്' },
  yourMessage: { en: 'Your Message', ml: 'സന്ദേശം' },
  submit: { en: 'Submit', ml: 'സമർപ്പിക്കുക' },
  guestbookThankYou: { en: 'Thank you for your beautiful message ❤️', ml: 'മനോഹരമായ സന്ദേശത്തിന് നന്ദി ❤️' },
  guestbookLocalNotice: {
    en: 'This message is saved only on your device — there is no live server yet.',
    ml: 'ഈ സന്ദേശം താങ്കളുടെ ഉപകരണത്തിൽ മാത്രമേ സൂക്ഷിക്കുന്നുള്ളൂ.',
  },
  orRecordVoiceMessage: { en: 'Or record a voice message (optional)', ml: 'അല്ലെങ്കിൽ ശബ്ദ സന്ദേശം റെക്കോർഡ് ചെയ്യുക' },
  startRecording: { en: 'Start Recording', ml: 'റെക്കോർഡ് ആരംഭിക്കുക' },
  stopRecording: { en: 'Stop', ml: 'നിർത്തുക' },
  reRecord: { en: 'Re-record', ml: 'വീണ്ടും റെക്കോർഡ് ചെയ്യുക' },
  recordingUnsupported: {
    en: "This browser can't record audio — you can still leave a written message.",
    ml: 'ഈ ബ്രൗസറിൽ ശബ്ദം റെക്കോർഡ് ചെയ്യാനാവില്ല — എഴുതിയ സന്ദേശം നൽകാം.',
  },
  recordingDenied: {
    en: 'Microphone access was not granted — you can still leave a written message.',
    ml: 'മൈക്രോഫോൺ അനുമതി ലഭിച്ചില്ല — എഴുതിയ സന്ദേശം നൽകാം.',
  },

  // ---- Journey progress card ----
  yourJourney: { en: 'Your Journey', ml: 'താങ്കളുടെ യാത്ര' },
  invitationOpened: { en: 'Invitation Opened', ml: 'ക്ഷണം തുറന്നു' },
  journeyStarted: { en: 'Journey Started', ml: 'യാത്ര ആരംഭിച്ചു' },
  onTheWay: { en: 'On the Way', ml: 'യാത്രയിൽ' },
  arrivedAtDua: { en: 'Arrived at DUA', ml: 'DUA-യിൽ എത്തി' },
  thankYouHeart: { en: 'Thank You ❤️', ml: 'നന്ദി ❤️' },

  // ---- Errors ----
  errorLocationDenied: {
    en: 'Location access was not granted. You can still explore DUA without Journey Mode.',
    ml: 'ലൊക്കേഷൻ അനുമതി ലഭിച്ചില്ല. ജേർണി മോഡ് ഇല്ലാതെയും DUA കാണാം.',
  },
  errorGpsUnavailable: {
    en: 'We could not get a location signal right now. Please try again in a moment.',
    ml: 'ഇപ്പോൾ ലൊക്കേഷൻ ലഭിച്ചില്ല. അല്പം കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക.',
  },
  errorMapUnavailable: {
    en: 'Your map is taking a moment to load ❤️',
    ml: 'മാപ്പ് ലോഡ് ചെയ്യാൻ അല്പം സമയമെടുക്കുന്നു ❤️',
  },
  errorRouteUnavailable: { en: 'Your route is taking a moment to load ❤️', ml: 'വഴി ലോഡ് ചെയ്യാൻ അല്പം സമയമെടുക്കുന്നു ❤️' },
  errorNetworkUnavailable: {
    en: "You're offline right now. Some features may be limited.",
    ml: 'ഇപ്പോൾ ഇന്റർനെറ്റ് ഇല്ല. ചില സവിശേഷതകൾ പരിമിതമായിരിക്കും.',
  },
  errorLocationNotConfigured: {
    en: 'The house location is being finalised — please check back soon.',
    ml: 'വീടിന്റെ ലൊക്കേഷൻ ഉടൻ ചേർക്കുന്നതാണ് — അല്പം കഴിഞ്ഞ് വീണ്ടും നോക്കുക.',
  },
  errorBrowserUnsupported: {
    en: 'Your browser does not support this feature. Please try Chrome or Safari.',
    ml: 'താങ്കളുടെ ബ്രൗസർ ഈ സവിശേഷത പിന്തുണയ്ക്കുന്നില്ല. Chrome അല്ലെങ്കിൽ Safari ഉപയോഗിക്കുക.',
  },
  tryAgain: { en: 'Try Again', ml: 'വീണ്ടും ശ്രമിക്കുക' },

  // ---- Ask DUA ----
  askDua: { en: 'Ask DUA', ml: 'DUA-യോട് ചോദിക്കൂ' },
  askDuaPlaceholder: { en: 'Ask a question…', ml: 'ഒരു ചോദ്യം ചോദിക്കൂ…' },
  askDuaNoMatch: {
    en: "I'm not sure about that yet — try asking about the address, date, time, or how to start your journey.",
    ml: 'അതിനെക്കുറിച്ച് എനിക്ക് ഉറപ്പില്ല — വിലാസം, തീയതി, സമയം അല്ലെങ്കിൽ യാത്ര എങ്ങനെ തുടങ്ങാം എന്ന് ചോദിക്കൂ.',
  },

  // ---- Language ----
  language: { en: 'Language', ml: 'ഭാഷ' },

  // ---- Share ----
  shareInvitation: { en: 'Share Invitation', ml: 'ക്ഷണം പങ്കിടുക' },
  linkCopied: { en: 'Invitation link copied ❤️', ml: 'ലിങ്ക് പകർത്തി ❤️' },

  // ---- Admin ----
  eventControlCenter: { en: 'Event Control Center', ml: 'ഇവന്റ് കൺട്രോൾ സെന്റർ' },
  demoData: { en: 'DEMO DATA', ml: 'ഡെമോ ഡാറ്റ' },
  demoJourney: { en: 'Demo Journey', ml: 'ഡെമോ യാത്ര' },
  eventSettings: { en: 'Event Settings', ml: 'ഇവന്റ് സെറ്റിംഗ്സ്' },
} as const;

export function translate(key: TranslationKey, lang: Language): string {
  return translations[key][lang];
}
