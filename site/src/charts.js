// Chart.js helpers in the prototype's visual language (dark, IBM Plex Mono, thin lines).
/* global Chart */
import { periodIndex } from './analysis.js';

export const C = {
  bg: '#0b0e14', surface: '#131820', surface2: '#1a2130', border: '#252e3d',
  text: '#e2e8f0', text2: '#8b9ab0', text3: '#5b6b82',
  green: '#22c55e', red: '#ef4444', gold: '#f59e0b', blue: '#3b82f6', purple: '#a78bfa',
  sky: '#38bdf8', amber: '#f59e0b', grid: 'rgba(37,46,61,0.55)',
};

export function rgba(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

let defaultsSet = false;
export function setupDefaults() {
  if (defaultsSet || typeof Chart === 'undefined') return;
  defaultsSet = true;
  Chart.defaults.color = C.text2;
  Chart.defaults.borderColor = C.border;
  Chart.defaults.font.family = "'IBM Plex Mono', monospace";
  Chart.defaults.font.size = 10;
  Chart.defaults.animation.duration = 350;
  Chart.defaults.maintainAspectRatio = false;
  Object.assign(Chart.defaults.plugins.tooltip, {
    backgroundColor: C.surface, borderColor: C.border, borderWidth: 1,
    titleFont: { size: 10 }, bodyFont: { size: 12 }, padding: 10, displayColors: false,
  });
  Chart.defaults.plugins.legend.display = false;
}

// Colours for the two sides of the threshold.
// growth tone: above = green when "higher" is expansionary, red when contractionary.
// neutral tone (inflation, rates, money, fiscal): no good/bad colouring.
export function zoneColors(ind, category) {
  if (category?.tone === 'growth' && ind.direction !== 0) {
    return ind.direction > 0 ? { above: C.green, below: C.red } : { above: C.red, below: C.green };
  }
  return { above: C.sky, below: C.amber };
}

// ── plugins ─────────────────────────────────────────────────────────────────

export function zonePlugin(thr, colors) {
  return {
    id: 'zones',
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea: a, scales: { y } } = chart;
      if (!Number.isFinite(thr) || !a) return;
      const ty = Math.min(a.bottom, Math.max(a.top, y.getPixelForValue(thr)));
      ctx.save();
      ctx.fillStyle = rgba(colors.above, 0.06);
      ctx.fillRect(a.left, a.top, a.right - a.left, ty - a.top);
      ctx.fillStyle = rgba(colors.below, 0.06);
      ctx.fillRect(a.left, ty, a.right - a.left, a.bottom - ty);
      ctx.restore();
    },
  };
}

export function thresholdLine(thr, label, color = C.purple) {
  return {
    id: 'thrLine',
    afterDatasetsDraw(chart) {
      const { ctx, chartArea: a, scales: { y } } = chart;
      if (!Number.isFinite(thr) || !a) return;
      const ty = y.getPixelForValue(thr);
      if (ty < a.top || ty > a.bottom) return;
      ctx.save();
      ctx.beginPath(); ctx.setLineDash([6, 3]);
      ctx.strokeStyle = rgba(color, 0.55); ctx.lineWidth = 1.2;
      ctx.moveTo(a.left, ty); ctx.lineTo(a.right, ty); ctx.stroke();
      ctx.setLineDash([]);
      if (label) {
        ctx.font = "9px 'IBM Plex Mono', monospace";
        ctx.fillStyle = rgba(color, 0.85);
        ctx.textAlign = 'right';
        ctx.fillText(label, a.right - 4, ty - 4);
      }
      ctx.restore();
    },
  };
}

// Map NBER recession spans (monthly) onto chart label indexes.
export function recessionBands(labels, freq, recessions) {
  if (!recessions?.length) return [];
  const span = { M: 0, Q: 2, A: 11 }[freq];
  const recs = recessions.map(([s, e]) => [periodIndex(s, 'M'), e ? periodIndex(e, 'M') : Infinity]);
  const flags = labels.map((l) => {
    const start = freq === 'A' ? +l.slice(0, 4) * 12 : periodIndex(l.slice(0, 7), 'M');
    const end = start + span;
    return recs.some(([s, e]) => start <= e && end >= s);
  });
  const bands = [];
  let from = null;
  flags.forEach((f, i) => {
    if (f && from === null) from = i;
    if (!f && from !== null) { bands.push([from, i - 1]); from = null; }
  });
  if (from !== null) bands.push([from, flags.length - 1]);
  return bands;
}

export function recessionPlugin(bands) {
  return {
    id: 'recessions',
    beforeDatasetsDraw(chart) {
      if (!bands.length) return;
      const { ctx, chartArea: a, scales: { x } } = chart;
      const step = (x.getPixelForValue(1) - x.getPixelForValue(0)) || 0;
      ctx.save();
      ctx.fillStyle = 'rgba(148,163,184,0.10)';
      for (const [s, e] of bands) {
        if (e < x.min || s > x.max) continue;
        const x0 = Math.max(a.left, x.getPixelForValue(Math.max(s, x.min)) - step / 2);
        const x1 = Math.min(a.right, x.getPixelForValue(Math.min(e, x.max)) + step / 2);
        ctx.fillRect(x0, a.top, Math.max(1, x1 - x0), a.bottom - a.top);
      }
      ctx.restore();
    },
  };
}

export function zeroLine() {
  return {
    id: 'zero',
    afterDatasetsDraw(chart) {
      const { ctx, chartArea: a, scales: { y } } = chart;
      const y0 = y.getPixelForValue(0);
      if (y0 < a.top || y0 > a.bottom) return;
      ctx.save(); ctx.beginPath(); ctx.setLineDash([5, 3]);
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1;
      ctx.moveTo(a.left, y0); ctx.lineTo(a.right, y0); ctx.stroke(); ctx.restore();
    },
  };
}

// ── factories ───────────────────────────────────────────────────────────────

export class ChartSet {
  constructor() { this.charts = []; }
  add(chart) { this.charts.push(chart); return chart; }
  destroy() { this.charts.forEach((c) => { try { c.destroy(); } catch { /* already gone */ } }); this.charts = []; }
}

export function gradient(ctx, color, height = 320, top = 0.32) {
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, rgba(color, top));
  g.addColorStop(1, rgba(color, 0));
  return g;
}

const baseScales = (yFmt, xTicks = 12) => ({
  x: { grid: { color: C.grid }, ticks: { maxTicksLimit: xTicks, maxRotation: 0, autoSkipPadding: 12 } },
  y: { grid: { color: C.grid }, ticks: { callback: yFmt } },
});

export function lineChart(canvas, { labels, datasets, yFmt = (v) => v, xFmt, tooltip = {}, plugins = [], xTicks = 12, yMin, yMax, legend = false }) {
  setupDefaults();
  const scales = baseScales(yFmt, xTicks);
  if (xFmt) scales.x.ticks.callback = function (v) { return xFmt(this.getLabelForValue(v)); };
  if (yMin !== undefined) scales.y.min = yMin;
  if (yMax !== undefined) scales.y.max = yMax;
  return new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: legend, position: 'top', labels: { boxWidth: 8, font: { size: 10 } } }, tooltip },
      scales,
      elements: { point: { radius: 0, hoverRadius: 4 }, line: { tension: 0.25 } },
    },
    plugins,
  });
}

export function barChart(canvas, { labels, data, colors, yFmt = (v) => v, xFmt, tooltip = {}, plugins = [], xTicks = 12, xDisplay = true, datasets }) {
  setupDefaults();
  const scales = baseScales(yFmt, xTicks);
  scales.x.display = xDisplay;
  if (xFmt) scales.x.ticks.callback = function (v) { return xFmt(this.getLabelForValue(v)); };
  return new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: { labels, datasets: datasets || [{ data, backgroundColor: colors, borderWidth: 0, borderRadius: 2 }] },
    options: { responsive: true, interaction: { mode: 'index', intersect: false }, plugins: { tooltip }, scales },
    plugins,
  });
}

export function doughnut(canvas, { labels, data, colors, tooltip = {} }) {
  setupDefaults();
  return new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
    options: { responsive: true, cutout: '62%', plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }, tooltip } },
  });
}

export function scatter(canvas, { datasets, xFmt = (v) => v, yFmt = (v) => v, tooltip = {}, plugins = [] }) {
  setupDefaults();
  return new Chart(canvas.getContext('2d'), {
    type: 'scatter',
    data: { datasets },
    options: {
      responsive: true,
      plugins: { tooltip, legend: { display: true, position: 'top', labels: { boxWidth: 8, font: { size: 10 } } } },
      scales: { x: { grid: { color: C.grid }, ticks: { callback: xFmt } }, y: { grid: { color: C.grid }, ticks: { callback: yFmt } } },
    },
    plugins,
  });
}

// Lightweight sparkline without Chart.js (used for many cards at once).
export function sparkline(canvas, vals, { color = C.purple, thr = null } = {}) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 160, h = canvas.clientHeight || 40;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const lo = Math.min(...vals, thr ?? Infinity), hi = Math.max(...vals, thr ?? -Infinity);
  const pad = 3, sx = (w - 2 * pad) / Math.max(1, vals.length - 1), sy = (h - 2 * pad) / ((hi - lo) || 1);
  const Y = (v) => h - pad - (v - lo) * sy;
  if (thr !== null && Number.isFinite(thr)) {
    ctx.strokeStyle = 'rgba(139,154,176,0.35)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, Y(thr)); ctx.lineTo(w - pad, Y(thr)); ctx.stroke(); ctx.setLineDash([]);
  }
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, rgba(color, 0.28)); g.addColorStop(1, rgba(color, 0));
  ctx.beginPath();
  vals.forEach((v, i) => (i ? ctx.lineTo(pad + i * sx, Y(v)) : ctx.moveTo(pad, Y(v))));
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.lineTo(pad + (vals.length - 1) * sx, h); ctx.lineTo(pad, h); ctx.closePath();
  ctx.fillStyle = g; ctx.fill();
  const lx = pad + (vals.length - 1) * sx, ly = Y(vals[vals.length - 1]);
  ctx.beginPath(); ctx.arc(lx, ly, 2.4, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
}
