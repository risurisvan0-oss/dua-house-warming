import { useEffect, useState } from 'react';

export interface CountdownParts {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function computeParts(target: Date): CountdownParts {
  const totalSeconds = Math.floor((target.getTime() - Date.now()) / 1000);
  const isPast = totalSeconds <= 0;
  const abs = Math.abs(totalSeconds);
  return {
    totalSeconds,
    isPast,
    days: Math.floor(abs / 86400),
    hours: Math.floor((abs % 86400) / 3600),
    minutes: Math.floor((abs % 3600) / 60),
    seconds: Math.floor(abs % 60),
  };
}

/** Live countdown to a target Date, ticking once a second. */
export function useCountdown(target: Date): CountdownParts {
  const [parts, setParts] = useState(() => computeParts(target));

  useEffect(() => {
    const id = setInterval(() => setParts(computeParts(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return parts;
}
