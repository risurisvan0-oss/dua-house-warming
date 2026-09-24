import { useEffect, useState } from 'react';
import type { EventConfig } from '../config/event';
import { getEffectiveEventConfig } from '../services/adminConfigService';

/**
 * Live event config: event.ts defaults merged with any local /admin
 * Event Settings overrides. Re-reads on the same-tab `dua:config-updated`
 * event (admin form) and the cross-tab `storage` event (another tab).
 */
export function useEventConfig(): EventConfig {
  const [config, setConfig] = useState<EventConfig>(() => getEffectiveEventConfig());

  useEffect(() => {
    const refresh = () => setConfig(getEffectiveEventConfig());
    window.addEventListener('storage', refresh);
    window.addEventListener('dua:config-updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('dua:config-updated', refresh);
    };
  }, []);

  return config;
}
