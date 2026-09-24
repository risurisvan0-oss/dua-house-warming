import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export function QrCode({ value, size = 160 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: '#3b2416', light: '#fffaf0' },
    }).catch(() => {});
  }, [value, size]);

  if (!value) return null;
  return <canvas ref={canvasRef} width={size} height={size} className="rounded-lg" />;
}
