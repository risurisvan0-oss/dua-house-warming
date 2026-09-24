import { Button } from '../../components/Button';
import { useLanguage } from '../../hooks/useLanguage';
import { useEventConfig } from '../../hooks/useEventConfig';
import { telLink, whatsappLink, hostVCardDataUrl } from '../../utils/contact';

export function ContactButtons({ className = '' }: { className?: string }) {
  const { t } = useLanguage();
  const eventConfig = useEventConfig();
  return (
    <div className={className}>
      <div className="flex gap-3">
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
      <a href={hostVCardDataUrl()} download={`${eventConfig.hostNames}.vcf`} className="mt-2.5 block">
        <Button variant="ghost" fullWidth>
          {t('saveContact')}
        </Button>
      </a>
    </div>
  );
}
