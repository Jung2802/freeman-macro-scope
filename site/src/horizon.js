// A slim ticker of the site's exchange rates drifting along the horizon of the earth photo, which CSS
// places still and centred on the right for the whole page.
import { num, signed } from './format.js';

// The photo's horizon, fitted as a circle (in pixels of the 744 × 511 original).
const PHOTO = { w: 744, h: 511, cx: 955.3, cy: 1350.0, r: 1339.3 };
const TICKER_PX_PER_S = 14;

async function rateTicks() {
  try {
    const list = await (await fetch('data/countries.json')).json();
    const pairs = list.filter((c) => /^[a-z]{6}$/.test(c.id) && c.currency?.includes('/'));
    const out = await Promise.all(pairs.map(async (c) => {
      const idx = await (await fetch(`data/${c.id}/index.json`)).json();
      if (!idx.indicators?.spot?.ok) return null;
      const v = (await (await fetch(`data/${c.id}/spot.json`)).json()).values;
      const last = v.at(-1)[1], prev = v.at(-2)[1];
      return { label: c.currency, value: num(last, last > 20 ? 2 : 4), chg: (last / prev - 1) * 100 };
    }));
    return out.filter(Boolean);
  } catch { return []; }
}

export function initHorizon(planet, layer) {
  const canvas = document.createElement('canvas');
  canvas.className = 'horizon-ticker';
  layer.append(canvas);
  const ctx = canvas.getContext('2d');
  let L = {}, text = '', textW = 0;
  const charW = new Map();
  const t0 = performance.now();

  // The photo is placed by CSS; read where it ended up so the ticker sits exactly on its horizon.
  const layout = () => {
    const w = innerWidth, h = innerHeight;
    const box = planet.getBoundingClientRect();
    const s = box.width / PHOTO.w;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    L = { w, h, dpr, bottom: box.top + box.height, cx: box.left + PHOTO.cx * s, cy: box.top + PHOTO.cy * s, r: PHOTO.r * s };
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  };
  layout();

  rateTicks().then((ticks) => {
    text = ticks.map((tk) => `${tk.label}  ${tk.value}  ${tk.chg >= 0 ? '▲' : '▼'} ${signed(tk.chg, 1)} %`).join('     ·     ');
    if (text) text += '     ·     ';
  });

  function render(now, scrollY, still) {
    const { w, h } = L;
    ctx.setTransform(L.dpr, 0, 0, L.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (!text) return;
    const near = Math.min(1, scrollY / ((innerHeight || 800) * 1.1));
    ctx.font = '400 10px Inter, system-ui, sans-serif';
    ctx.textBaseline = 'alphabetic';
    if (!textW) textW = ctx.measureText(text).width;
    const rr = L.r * 1.03;                       // just outside the glow of the horizon
    const secs = still ? 0 : (now - t0) / 1000;
    const offset = (secs * TICKER_PX_PER_S) % textW;
    // start where the horizon leaves the bottom of the screen
    const yStart = Math.min(h, L.bottom);
    const a0 = Math.atan2(yStart - L.cy, -Math.sqrt(Math.max(0, rr * rr - (yStart - L.cy) ** 2)));
    let s = -offset;
    for (let rep = 0; rep < 4 && s < rr * Math.PI * 0.6; rep++) {
      for (const ch of text) {
        if (!charW.has(ch)) charW.set(ch, ctx.measureText(ch).width);
        const cw = charW.get(ch);
        const ang = a0 + (s + cw / 2) / rr;
        s += cw;
        const x = L.cx + Math.cos(ang) * rr, y = L.cy + Math.sin(ang) * rr;
        if (x < -20 || x > w + 20 || y < -20 || y > h + 20) continue;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang + Math.PI / 2);
        ctx.globalAlpha = 0.5 * (1 - near * 0.3);
        ctx.fillStyle = ch === '▲' ? '#a3c4e8' : ch === '▼' ? '#c4a47c' : '#c9d3df';
        ctx.fillText(ch, -cw / 2, 0);
        ctx.restore();
      }
    }
  }

  return { render, resize: layout };
}
