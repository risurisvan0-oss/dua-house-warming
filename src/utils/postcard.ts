export interface PostcardOptions {
  houseName: string;
  hostNames: string;
  guestName: string | null;
  arrivedAt: Date;
}

const WIDTH = 1080;
const HEIGHT = 1350;

async function ensureFontsLoaded(): Promise<void> {
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('150px "Cormorant Garamond"'),
        document.fonts.load('italic 400 46px "Jost"'),
        document.fonts.load('500 30px "Jost"'),
      ]),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  } catch {
    // best-effort — canvas text still renders with a fallback serif/sans
  }
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const CLAY = '#5a3a22';
const TERRACOTTA = '#a4502a';
const TEAL = '#3b2416';
const GOLD = '#b88a3e';
const GOLD_DEEP = '#a06a2c';

function drawHouse(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // body
  ctx.fillStyle = '#fffaf0';
  ctx.strokeStyle = CLAY;
  ctx.fillRect(-84, 30, 168, 92);
  ctx.strokeRect(-84, 30, 168, 92);

  // tiled roof
  ctx.beginPath();
  ctx.moveTo(-108, 34);
  ctx.lineTo(0, -60);
  ctx.lineTo(108, 34);
  ctx.closePath();
  ctx.fillStyle = TERRACOTTA;
  ctx.fill();
  ctx.stroke();

  // door
  ctx.beginPath();
  ctx.moveTo(-18, 122);
  ctx.lineTo(-18, 78);
  ctx.arcTo(0, 56, 18, 78, 18);
  ctx.lineTo(18, 122);
  ctx.closePath();
  ctx.fillStyle = TEAL;
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.stroke();

  // windows
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 2.5;
  ctx.fillStyle = '#e4f0ee';
  for (const x of [-64, 36]) {
    ctx.fillRect(x, 50, 28, 32);
    ctx.strokeRect(x, 50, 28, 32);
  }

  // lanterns either side of the door
  ctx.fillStyle = GOLD;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(side * 40, 38, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // finial lantern at the ridge
  ctx.beginPath();
  ctx.arc(0, -68, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawLattice(ctx: CanvasRenderingContext2D, y: number, up: boolean) {
  ctx.save();
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 3;
  ctx.beginPath();
  const step = 52;
  const h = 26;
  for (let x = 0; x <= WIDTH; x += step) {
    const y0 = up ? y + h : y;
    const y1 = up ? y : y + h;
    if (x === 0) ctx.moveTo(x, y0);
    ctx.lineTo(x + step / 2, y1);
    ctx.lineTo(x + step, y0);
  }
  ctx.stroke();
  ctx.restore();
}

function drawDivider(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const gold = GOLD_DEEP;
  ctx.save();
  ctx.strokeStyle = gold;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 130, cy);
  ctx.lineTo(cx - 30, cy);
  ctx.moveTo(cx + 30, cy);
  ctx.lineTo(cx + 130, cy);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = gold;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-6, -6, 12, 12);
  ctx.restore();
  ctx.restore();
}

/**
 * Renders a shareable "I arrived at DUA" keepsake entirely client-side
 * (Canvas 2D — no server, no image assets). Resolves null if canvas
 * export fails for any reason (unsupported browser, etc).
 */
export async function generateArrivalPostcard(opts: PostcardOptions): Promise<Blob | null> {
  await ensureFontsLoaded();

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // background
  const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  bg.addColorStop(0, '#efe4d0');
  bg.addColorStop(1, '#e6d3b0');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Kerala lattice trim, top and bottom
  drawLattice(ctx, 0, true);
  drawLattice(ctx, HEIGHT - 26, false);

  // fine gold frame
  ctx.strokeStyle = 'rgba(160,106,44,0.4)';
  ctx.lineWidth = 2;
  roundedRectPath(ctx, 56, 70, WIDTH - 112, HEIGHT - 140, 4);
  ctx.stroke();

  const centerX = WIDTH / 2;
  ctx.textAlign = 'center';

  drawHouse(ctx, centerX, 300);

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = TEAL;
  ctx.save();
  ctx.font = '600 26px Jost, system-ui, sans-serif';
  ctx.letterSpacing = '8px';
  ctx.fillText("YOU'VE ARRIVED AT", centerX, 490);
  ctx.restore();

  ctx.fillStyle = CLAY;
  ctx.font = '150px "Cormorant Garamond", Georgia, serif';
  ctx.fillText(opts.houseName, centerX, 650);

  if (opts.guestName) {
    ctx.fillStyle = '#2a1c12';
    ctx.font = 'italic 400 46px Jost, system-ui, sans-serif';
    ctx.fillText(opts.guestName, centerX, 725);
    ctx.fillStyle = 'rgba(42,28,18,0.6)';
    ctx.font = '400 26px Jost, system-ui, sans-serif';
    ctx.fillText('was here', centerX, 768);
  }

  drawDivider(ctx, centerX, opts.guestName ? 830 : 760);

  const dateLabel = opts.arrivedAt.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeLabel = opts.arrivedAt.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
  });

  ctx.fillStyle = '#2a1c12';
  ctx.font = '400 32px Jost, system-ui, sans-serif';
  ctx.fillText(`${dateLabel} · ${timeLabel}`, centerX, opts.guestName ? 900 : 830);

  ctx.fillStyle = 'rgba(42,28,18,0.6)';
  ctx.font = '400 26px Jost, system-ui, sans-serif';
  ctx.fillText(`Hosted by ${opts.hostNames}`, centerX, opts.guestName ? 950 : 880);

  ctx.fillStyle = GOLD_DEEP;
  ctx.font = 'italic 400 26px Jost, system-ui, sans-serif';
  ctx.fillText('An invitation that travelled with me', centerX, HEIGHT - 100);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
  });
}
