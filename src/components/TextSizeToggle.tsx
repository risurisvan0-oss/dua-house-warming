import { useTextScale } from '../hooks/useTextScale';
import { useLanguage } from '../hooks/useLanguage';

export function TextSizeToggle({ className = '' }: { className?: string }) {
  const { large, toggle } = useTextScale();
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={large}
      aria-label={t('toggleTextSize')}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition-colors ${
        large ? 'border-forest bg-forest text-ivory' : 'border-forest/20 bg-ivory/80 text-forest'
      } ${className}`}
    >
      A
      <span className="text-[10px] align-super">+</span>
    </button>
  );
}
