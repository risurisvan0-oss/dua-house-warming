import { useLanguage } from '../hooks/useLanguage';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex rounded-full border border-forest/20 bg-ivory/80 p-1 text-sm font-semibold ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={`rounded-full px-3 py-1.5 transition-colors ${language === 'en' ? 'bg-forest text-ivory' : 'text-forest'}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('ml')}
        aria-pressed={language === 'ml'}
        className={`rounded-full px-3 py-1.5 transition-colors ${language === 'ml' ? 'bg-forest text-ivory' : 'text-forest'}`}
      >
        മലയാളം
      </button>
    </div>
  );
}
