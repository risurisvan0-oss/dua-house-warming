import { useState } from 'react';
import { Button } from '../../components/Button';
import { useLanguage } from '../../hooks/useLanguage';
import { useEventConfig } from '../../hooks/useEventConfig';
import { storageService } from '../../services/storageService';
import { generateArrivalPostcard } from '../../utils/postcard';

export function ArrivalPostcardButton() {
  const { t } = useLanguage();
  const eventConfig = useEventConfig();
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle');

  const handleSave = async () => {
    setStatus('working');
    try {
      const arrivedAt = storageService.getArrivedAt();
      const blob = await generateArrivalPostcard({
        houseName: eventConfig.houseName,
        hostNames: eventConfig.hostNames,
        guestName: storageService.getGuestName(),
        arrivedAt: arrivedAt ? new Date(arrivedAt) : new Date(),
      });
      if (!blob) throw new Error('no blob');

      const file = new File([blob], 'dua-arrival-keepsake.png', { type: 'image/png' });
      const canShareFile =
        typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

      if (canShareFile && navigator.share) {
        await navigator.share({
          files: [file],
          title: `Arrived at ${eventConfig.houseName} 🏡`,
          text: `I arrived at ${eventConfig.houseName} ❤️`,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'dua-arrival-keepsake.png';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      }
      setStatus('done');
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  return (
    <div className="w-full max-w-sm text-center">
      <Button variant="outline" fullWidth onClick={handleSave} disabled={status === 'working'}>
        {status === 'working'
          ? t('keepsakeGenerating')
          : status === 'done'
            ? t('keepsakeReady')
            : `📸 ${t('saveArrivalKeepsake')}`}
      </Button>
      {status === 'error' && <p className="mt-2 text-xs text-red-600">{t('keepsakeFailed')}</p>}
      {status === 'idle' && <p className="mt-2 text-xs text-charcoal/45">{t('keepsakeDescription')}</p>}
    </div>
  );
}
