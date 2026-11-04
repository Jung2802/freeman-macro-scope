// The backdrop shared by every page: the earth (the selected country's continent, fixed on the right)
// with a ticker of exchange rates along its horizon, a parallax starfield with the odd shooting star,
// a scroll-progress line, reveal-on-scroll and count-up numbers.
import { signed, num } from './format.js';
import { initHorizon } from './horizon.js';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let horizon = null;

// Shows the earth photo for a continent ('europe', 'asia', …) or 'neutral'.
export const setEarth = (key) => horizon?.setEarth(key);
export const preloadEarths = (keys) => horizon?.preload(keys);

export function initCosmos() {
  if (document.querySelector('.cosmos')) return;
  const root = document.createElement('div');
  root.className = 'cosmos';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = `
    <canvas class="stars"></canvas>
    <div class="planet"></div>
    <div class="aurora"></div>
    <div class="horizon-layer"></div>
    <div class="cosmos-shade"></div>`;
  document.body.prepend(root);
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);
  document.documentElement.classList.add('has-cosmos');
  if (!reduced()) document.documentElement.classList.add('motion');

  const planet = root.querySelector('.planet');
  const canvas = root.querySelector('.stars');
  const stars = makeStars();
  const meteors = [];
  horizon = initHorizon(planet, root.querySelector('.horizon-layer'));
  let y = window.scrollY, raf = 0, timer = 0, running = !document.hidden;

  const onScroll = () => {
    y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    bar.style.transform = `scaleX(${Math.min(1, y / max).toFixed(4)})`;
    // The earth stays where it is; it only dims a little behind the content.
    const near = Math.min(1, y / ((innerHeight || 800) * 1.1));
    planet.style.setProperty('--glow', (1 - near * 0.62).toFixed(3));
    if (reduced()) horizon.render(performance.now(), y, true);
    else schedule();
  };

  // ~30 fps while the tab is visible keeps phones cool.
  const schedule = () => { if (!raf && !timer && running) raf = requestAnimationFrame(frame); };
  function frame(ts) {
    raf = 0;
    drawStars(canvas, stars, y, ts / 1000, meteors);
    horizon.render(ts, y, false);
    if (running && !reduced()) timer = setTimeout(() => { timer = 0; schedule(); }, 33);
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => {
    sizeCanvas(canvas);
    horizon.resize();
    onScroll();
    drawStars(canvas, stars, y, performance.now() / 1000, meteors);
    horizon.render(performance.now(), y, reduced());
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) schedule();
  });
  sizeCanvas(canvas);
  onScroll();
  drawStars(canvas, stars, y, 0, meteors);
  if (reduced()) setTimeout(() => horizon.render(performance.now(), y, true), 800); // once the rates have loaded
  else schedule();
}

function makeStars() {
  // Deterministic field so it looks the same on every visit.
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const n = Math.round(Math.min(220, Math.max(90, (innerWidth * innerHeight) / 7000)));
  return Array.from({ length: n }, () => {
    const z = rnd() < 0.6 ? 0.15 : rnd() < 0.75 ? 0.35 : 0.7;
    return { x: rnd(), y: rnd(), z, r: 0.35 + z * 1.1 + rnd() * 0.4, ph: rnd() * Math.PI * 2, sp: 0.6 + rnd() * 1.8 };
  });
}

function sizeCanvas(cv) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
  cv.style.width = `${innerWidth}px`; cv.style.height = `${innerHeight}px`;
  cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawStars(cv, stars, scrollY, t, meteors) {
  const ctx = cv.getContext('2d');
  const w = innerWidth, h = innerHeight;
  ctx.clearRect(0, 0, w, h);
  for (const st of stars) {
    // nearer stars move faster with the scroll: depth parallax
    const yy = (((st.y * h - scrollY * st.z * 0.35) % h) + h) % h;
    const xx = (st.x * w + t * st.z * 2.2) % w;
    const tw = 0.55 + 0.45 * Math.sin(t * st.sp + st.ph);
    ctx.globalAlpha = (0.18 + st.z * 0.75) * tw;
    ctx.fillStyle = st.z > 0.5 ? '#dfe9f5' : '#b9c6d6';
    ctx.beginPath(); ctx.arc(xx, yy, st.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (!meteors || reduced()) return;
  // a shooting star every 5–14 s, falling from the upper left towards the planet
  if (!meteors.next) meteors.next = t + 2.5;
  if (t > meteors.next) {
    meteors.push({ x: Math.random() * w * 0.7, y: Math.random() * h * 0.35, born: t, life: 0.75 + Math.random() * 0.5, len: 90 + Math.random() * 140, ang: (18 + Math.random() * 22) * Math.PI / 180 });
    meteors.next = t + 5 + Math.random() * 9;
  }
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i], k = (t - m.born) / m.life;
    if (k >= 1) { meteors.splice(i, 1); continue; }
    const dist = k * m.len * 2.4;
    const hx = m.x + Math.cos(m.ang) * dist, hy = m.y + Math.sin(m.ang) * dist;
    const tx = hx - Math.cos(m.ang) * m.len * Math.min(1, k * 3), ty = hy - Math.sin(m.ang) * m.len * Math.min(1, k * 3);
    const a = Math.sin(Math.PI * k);
    const g = ctx.createLinearGradient(tx, ty, hx, hy);
    g.addColorStop(0, 'rgba(220,232,250,0)'); g.addColorStop(1, `rgba(235,242,255,${0.85 * a})`);
    ctx.strokeStyle = g; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = `rgba(255,255,255,${0.9 * a})`;
    ctx.beginPath(); ctx.arc(hx, hy, 1.4, 0, Math.PI * 2); ctx.fill();
  }
}

// Fade/slide elements in as they enter the viewport. Without motion everything is shown at once.
export function reveal(el) {
  const items = el.querySelectorAll('.reveal, .ind-card, .cat-head, .chart-card, .feature');
  if (reduced() || !('IntersectionObserver' in window)) { items.forEach((n) => n.classList.add('in')); return () => {}; }
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  items.forEach((n, i) => {
    n.classList.add('reveal');
    // stagger siblings inside a grid
    const idx = n.parentElement ? [...n.parentElement.children].indexOf(n) : i;
    n.style.setProperty('--d', `${Math.min(idx, 8) * 45}ms`);
    io.observe(n);
  });
  return () => io.disconnect();
}

// Numbers count up from zero once: <x data-count="12.3" data-dec="1" data-signed="1" data-suffix=" %">.
export function countUp(el) {
  const nodes = el.querySelectorAll('[data-count]');
  if (reduced()) return;
  nodes.forEach((n) => {
    const target = +n.dataset.count, dec = +(n.dataset.dec || 0), sgn = n.dataset.signed === '1';
    const suffix = n.dataset.suffix || '', tail = n.querySelector('small')?.outerHTML || '';
    if (!Number.isFinite(target)) return;
    const fmt = (v) => (sgn ? signed(v, dec) : num(v, dec)) + suffix + tail;
    const t0 = performance.now(), dur = 1100;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - (1 - k) ** 3;
      n.innerHTML = fmt(target * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
