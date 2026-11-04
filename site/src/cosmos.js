// The live backdrop shared by every page: a fixed earth that rises and turns with the scroll,
// a parallax starfield, a scroll-progress line, reveal-on-scroll and count-up numbers.
import { signed, num } from './format.js';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initCosmos() {
  if (document.querySelector('.cosmos')) return;
  const root = document.createElement('div');
  root.className = 'cosmos';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = `
    <canvas class="stars"></canvas>
    <div class="planet"><img src="assets/img/earth.webp" alt="" width="744" height="511" fetchpriority="high" decoding="async"></div>
    <div class="aurora"></div>
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
  let y = window.scrollY, raf = 0, last = 0, running = !document.hidden;

  const onScroll = () => {
    y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = Math.min(1, y / max);
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
    if (reduced()) return;
    // The planet rises slower than the page, grows and turns around its own centre (far below the
    // frame), so the horizon slides along itself. It never leaves: it settles as a dim backdrop.
    const vh = innerHeight || 800;
    const near = Math.min(1, y / (vh * 1.4));
    planet.style.setProperty('--rise', `${(-near * vh * 0.22).toFixed(1)}px`);
    planet.style.setProperty('--turn', `${(-p * 18 - near * 6).toFixed(2)}deg`);
    planet.style.setProperty('--grow', (1 + near * 0.28 + p * 0.12).toFixed(3));
    planet.style.setProperty('--glow', (1 - near * 0.62).toFixed(3));
    if (!raf && running) raf = requestAnimationFrame(frame);
  };

  function frame(ts) {
    raf = 0;
    drawStars(canvas, stars, y, ts / 1000);
    // keep twinkling while the tab is visible, at ~30 fps to stay light on phones
    if (running && !reduced()) setTimeout(() => { if (!raf) raf = requestAnimationFrame(frame); }, Math.max(0, 33 - (ts - last)));
    last = ts;
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { sizeCanvas(canvas); onScroll(); drawStars(canvas, stars, y, performance.now() / 1000); }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running && !raf) raf = requestAnimationFrame(frame);
  });
  sizeCanvas(canvas);
  onScroll();
  drawStars(canvas, stars, y, 0);
  if (!reduced()) raf = requestAnimationFrame(frame);
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

function drawStars(cv, stars, scrollY, t) {
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
