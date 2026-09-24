import { Button } from '../../components/Button';
import { useLanguage } from '../../hooks/useLanguage';
import { telLink, whatsappLink } from '../../utils/contact';

export function ContactButtons({ className = '' }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <div className={`flex gap-3 ${className}`}>
      <a href={telLink()} className="flex-1">
        <Button variant="outline" fullWidth>
          📞 {t('callHost')}
        </Button>
      </a>
      <a href={whatsappLink()} target="_blank" rel="noreferrer" className="flex-1">
        <Button variant="outline" fullWidth>
          💬 {t('whatsappHost')}
        </Button>
      </a>
    </div>
  );
}
