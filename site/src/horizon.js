// The earth behind every page: one photo per continent (the selected country's), or a neutral one for
// currency comparisons and the country radar. Each photo's horizon was fitted as a circle; every photo
// is placed so its horizon enters the screen at the same two anchor points, so the planet stays in the
// same spot when it changes. A slim ticker of the site's exchange rates drifts along that horizon.
import { num, signed } from './format.js';

// horizon circle per photo, in the photo's own pixels
const EARTHS = {
  'north-america': { w: 1536, h: 1024, cx: 1408.9, cy: 1114.8, r: 938.5 },
  'south-america': { w: 1536, h: 1024, cx: 1436.7, cy: 1140.1, r: 972.8 },
  europe: { w: 1536, h: 1024, cx: 1448.8, cy: 1148.9, r: 980.0 },
  africa: { w: 1536, h: 1024, cx: 1424.9, cy: 937.6, r: 772.3 },
  asia: { w: 1536, h: 1024, cx: 1456.3, cy: 1155.1, r: 989.2 },
  oceania: { w: 1536, h: 1024, cx: 1445.0, cy: 1005.2, r: 843.4 },
  neutral: { w: 1600, h: 900, cx: 2072.8, cy: 2344.3, r: 2294.6 },
};
const REF = 'europe';                  // its framing defines the anchor points
const TICKER_PX_PER_S = 14;
const SWAP_MS = 1100;

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

// Reference framing: the planet on the right, the photo as tall as the screen (on phones: wider than it).
function reference(vw, vh) {
  const E = EARTHS[REF], phone = vw < 900;
  const s = phone ? (vw * 1.55) / E.w : vh / E.h;
  const left = vw - E.w * s, top = phone ? vh * 0.01 : 0;
  const cx = left + E.cx * s, cy = top + E.cy * s, r = E.r * s, bottom = top + E.h * s;
  const A = [cx - Math.sqrt(Math.max(0, r * r - (bottom - cy) ** 2)), bottom]; // horizon meets the photo's bottom edge
  const B = [vw, cy - Math.sqrt(Math.max(0, r * r - (vw - cx) ** 2))];        // horizon meets the right edge
  return { s, A, B, phone, bottom };
}

// Place photo `key` so its horizon passes through A and B at scale s.
function placeAt(E, s, A, B) {
  const rho = E.r * s;
  const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy);
  if (rho < L / 2) return null;
  let nx = -dy / L, ny = dx / L;
  if (nx + ny < 0) { nx = -nx; ny = -ny; }          // the centre lies below and to the right
  const d = Math.sqrt(rho * rho - (L / 2) ** 2);
  const cx = mx + nx * d, cy = my + ny * d;
  return { left: cx - E.cx * s, top: cy - E.cy * s, width: E.w * s, height: E.h * s, cx, cy, r: rho };
}

function placement(key, vw, vh) {
  const E = EARTHS[key], ref = reference(vw, vh);
  const base = ref.phone ? (vw * 1.55) / E.w : vh / E.h;
  // grow a little if needed so the photo still reaches the right and top edges (never beyond 1.35×)
  for (let k = 1; k <= 1.35; k += 0.01) {
    const p = placeAt(E, base * k, ref.A, ref.B);
    if (p && p.left + p.width >= vw - 1 && p.top <= (ref.phone ? vh * 0.01 + 1 : 1)) return p;
  }
  return placeAt(E, base * 1.35, ref.A, ref.B) || placeAt(EARTHS[REF], ref.s, ref.A, ref.B);
}

export function initHorizon(planet, layer) {
  const imgs = [0, 1].map(() => {
    const im = document.createElement('img');
    im.className = 'earth-img';
    im.alt = '';
    im.decoding = 'async';
    planet.append(im);
    return im;
  });
  let front = 0, key = null, circle = null, from = null, swapAt = 0, wanted = null;
  const canvas = document.createElement('canvas');
  canvas.className = 'horizon-ticker';
  layer.append(canvas);
  const ctx = canvas.getContext('2d');
  let L = { w: 1, h: 1, dpr: 1 }, text = '', textW = 0;
  const charW = new Map();
  const t0 = performance.now();

  const apply = (im, p) => Object.assign(im.style, { left: `${p.left}px`, top: `${p.top}px`, width: `${p.width}px`, height: `${p.height}px` });

  const layout = () => {
    const w = innerWidth, h = innerHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    L = { w, h, dpr };
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    if (key) {
      const p = placement(key, w, h);
      apply(imgs[front], p);
      circle = p; from = null;
    }
  };

  async function setEarth(next) {
    if (!EARTHS[next]) next = 'neutral';
    wanted = next;
    if (next === key) return;
    const src = `assets/img/earth/${next}.webp`;
    const pre = new Image();
    pre.src = src;
    try { await pre.decode(); } catch { /* show it anyway */ }
    if (wanted !== next) return;                     // the visitor moved on in the meantime
    const p = placement(next, L.w, L.h);
    const back = imgs[1 - front];
    back.src = src;
    apply(back, p);
    back.classList.add('on');
    imgs[front].classList.remove('on');
    front = 1 - front;
    from = circle; circle = p; swapAt = performance.now();
    key = next;
  }

  rateTicks().then((ticks) => {
    text = ticks.map((tk) => `${tk.label}  ${tk.value}  ${tk.chg >= 0 ? '▲' : '▼'} ${signed(tk.chg, 1)} %`).join('     ·     ');
    if (text) text += '     ·     ';
  });

  function render(now, scrollY, still) {
    const { w, h } = L;
    ctx.setTransform(L.dpr, 0, 0, L.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (!text || !circle) return;
    // while the photo changes, the ticker glides from the old horizon to the new one
    const k = from && !still ? Math.min(1, (now - swapAt) / SWAP_MS) : 1;
    const e = k * k * (3 - 2 * k);
    const c = from && k < 1 ? { cx: from.cx + (circle.cx - from.cx) * e, cy: from.cy + (circle.cy - from.cy) * e, r: from.r + (circle.r - from.r) * e, bottom: circle.top + circle.height } : { ...circle, bottom: circle.top + circle.height };
    const near = Math.min(1, scrollY / ((innerHeight || 800) * 1.1));
    ctx.font = '400 10px Inter, system-ui, sans-serif';
    ctx.textBaseline = 'alphabetic';
    if (!textW) textW = ctx.measureText(text).width;
    const rr = c.r * 1.025 + 6;                      // just outside the glow of the horizon
    const secs = still ? 0 : (now - t0) / 1000;
    const offset = (secs * TICKER_PX_PER_S) % textW;
    const yStart = Math.min(h, c.bottom);
    const a0 = Math.atan2(yStart - c.cy, -Math.sqrt(Math.max(0, rr * rr - (yStart - c.cy) ** 2)));
    let s = -offset;
    for (let rep = 0; rep < 6 && s < rr * Math.PI * 0.6; rep++) {
      for (const ch of text) {
        if (!charW.has(ch)) charW.set(ch, ctx.measureText(ch).width);
        const cw = charW.get(ch);
        const ang = a0 + (s + cw / 2) / rr;
        s += cw;
        const x = c.cx + Math.cos(ang) * rr, y = c.cy + Math.sin(ang) * rr;
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

  layout();
  return { render, resize: layout, setEarth, preload: (keys) => keys.forEach((k) => { if (EARTHS[k]) new Image().src = `assets/img/earth/${k}.webp`; }) };
}
