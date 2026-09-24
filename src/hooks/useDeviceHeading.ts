import { useCallback, useEffect, useState } from 'react';

/** Non-standard iOS extension + the requestPermission static, untyped in lib.dom. */
interface IosDeviceOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}
interface IosDeviceOrientationEventConstructor {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

export type CompassPermission = 'idle' | 'granted' | 'denied' | 'unsupported';

/**
 * Live compass heading (0–360°, 0 = North), for the AR-style "point
 * toward DUA" arrow. iOS Safari requires an explicit user-gesture
 * permission request (`requestPermission`); most other browsers fire
 * the event without one. Resolves to null whenever a heading isn't
 * available — callers should simply hide the arrow in that case rather
 * than showing a wrong direction.
 */
export function useDeviceHeading() {
  const [heading, setHeading] = useState<number | null>(null);
  const [permission, setPermission] = useState<CompassPermission>('idle');

  const requestPermission = useCallback(async () => {
    const ctor = window.DeviceOrientationEvent as unknown as IosDeviceOrientationEventConstructor | undefined;
    if (ctor?.requestPermission) {
      try {
        const result = await ctor.requestPermission();
        setPermission(result === 'granted' ? 'granted' : 'denied');
        return result === 'granted';
      } catch {
        setPermission('denied');
        return false;
      }
    }
    if (!('DeviceOrientationEvent' in window)) {
      setPermission('unsupported');
      return false;
    }
    // No explicit permission gate on this browser — events just start firing.
    setPermission('granted');
    return true;
  }, []);

  useEffect(() => {
    if (permission !== 'granted') return;
    const handler = (e: DeviceOrientationEvent) => {
      const iosHeading = (e as IosDeviceOrientationEvent).webkitCompassHeading;
      if (typeof iosHeading === 'number') {
        setHeading(iosHeading);
        return;
      }
      if (typeof e.alpha === 'number') {
        setHeading((360 - e.alpha) % 360);
      }
    };
    const eventName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(eventName, handler as EventListener);
    return () => window.removeEventListener(eventName, handler as EventListener);
  }, [permission]);

  return { heading, permission, requestPermission };
}
