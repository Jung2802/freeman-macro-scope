// Pure analysis functions. No DOM, no Chart.js – unit-tested in tests/analysis.test.mjs.
// A series is an array of [label, value] where label is "YYYY-MM" (M and Q) or "YYYY" (A).

export const PERIODS_PER_YEAR = { M: 12, Q: 4, A: 1 };
// Horizon for the short-term (momentum) signal, in periods: ~6 months.
export const MOMENTUM_H = { M: 6, Q: 2, A: 1 };

// ── basic statistics ────────────────────────────────────────────────────────

export const sum = (xs) => xs.reduce((a, b) => a + b, 0);
export const mean = (xs) => (xs.length ? sum(xs) / xs.length : NaN);

export function median(xs) {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function std(xs, sample = true) {
  if (xs.length < 2) return NaN;
  const m = mean(xs);
  return Math.sqrt(sum(xs.map((x) => (x - m) ** 2)) / (xs.length - (sample ? 1 : 0)));
}

export function skewness(xs) {
  const n = xs.length;
  if (n < 3) return NaN;
  const m = mean(xs), s = std(xs);
  return (n / ((n - 1) * (n - 2))) * sum(xs.map((x) => ((x - m) / s) ** 3));
}

// Excess kurtosis (0 = normal distribution), same definition as Excel's KURT().
export function kurtosis(xs) {
  const n = xs.length;
  if (n < 4) return NaN;
  const m = mean(xs), s = std(xs);
  const k = sum(xs.map((x) => ((x - m) / s) ** 4));
  return (n * (n + 1) * k) / ((n - 1) * (n - 2) * (n - 3)) - (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
}

export function percentileRank(xs, v) {
  if (!xs.length) return NaN;
  const below = xs.filter((x) => x < v).length;
  const equal = xs.filter((x) => x === v).length;
  return ((below + equal / 2) / xs.length) * 100;
}

export function quantile(xs, q) {
  const s = [...xs].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// ── series helpers ──────────────────────────────────────────────────────────

export const values = (series) => series.map((p) => p[1]);
export const labels = (series) => series.map((p) => p[0]);

export function periodIndex(label, freq) {
  const y = +label.slice(0, 4);
  if (freq === 'A') return y;
  const m = +label.slice(5, 7);
  return freq === 'Q' ? y * 4 + Math.floor((m - 1) / 3) : y * 12 + m - 1;
}

export function changes(series, lag = 1) {
  return series.map((p, i) => (i < lag ? null : p[1] - series[i - lag][1]));
}

export function rolling(series, n) {
  const out = [];
  let acc = 0;
  for (let i = 0; i < series.length; i++) {
    acc += series[i][1];
    if (i >= n) acc -= series[i - n][1];
    out.push(i >= n - 1 ? acc / n : null);
  }
  return out;
}

export function lastYears(series, freq, years) {
  return series.slice(-years * PERIODS_PER_YEAR[freq]);
}

export function resolveThreshold(threshold, vals) {
  if (typeof threshold === 'number') return threshold;
  if (threshold === 'median') return median(vals);
  if (threshold === 'mean') return mean(vals);
  return NaN;
}

// Signed run length above (+) / below (−) the threshold at each point.
export function streaks(vals, thr) {
  const out = [];
  let run = 0;
  for (let i = 0; i < vals.length; i++) {
    const above = vals[i] >= thr;
    if (i > 0 && (vals[i - 1] >= thr) === above) run += above ? 1 : -1;
    else run = above ? 1 : -1;
    out.push(run);
  }
  return out;
}

export function annualAverages(series) {
  const byYear = new Map();
  for (const [d, v] of series) {
    const y = d.slice(0, 4);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(v);
  }
  return [...byYear.entries()].map(([y, xs]) => ({ year: y, avg: mean(xs), n: xs.length }));
}

// Year × period grid for the heat map: rows sorted by year, cells[period] = value | null.
export function heatGrid(series, freq) {
  const cols = freq === 'Q' ? 4 : 12;
  const rows = new Map();
  for (const [d, v] of series) {
    const y = d.slice(0, 4);
    const m = +d.slice(5, 7);
    const c = freq === 'Q' ? Math.floor((m - 1) / 3) : m - 1;
    if (!rows.has(y)) rows.set(y, new Array(cols).fill(null));
    rows.get(y)[c] = v;
  }
  return [...rows.entries()].map(([year, cells]) => ({ year, cells }));
}

// Seasonal overlay: the last n calendar years, each as an array over periods.
export function seasonalYears(series, freq, n = 3) {
  const grid = heatGrid(series, freq);
  return grid.slice(-n);
}

// ── distribution / descriptive stats (mirrors the Excel analysis sheets) ───

export function describe(xs) {
  const pos = xs.filter((x) => x > 0), neg = xs.filter((x) => x < 0);
  const m = mean(xs), s = std(xs);
  const within = (k) => xs.filter((x) => Math.abs(x - m) <= k * s).length / xs.length;
  return {
    n: xs.length,
    mean: m,
    median: median(xs),
    std: s,
    variance: s * s,
    skew: skewness(xs),
    kurtosis: kurtosis(xs),
    min: Math.min(...xs),
    max: Math.max(...xs),
    stderr: s / Math.sqrt(xs.length),
    pos: pos.length, neg: neg.length, zero: xs.length - pos.length - neg.length,
    avgPos: mean(pos), avgNeg: mean(neg),
    ratioPN: neg.length ? pos.length / neg.length : NaN,
    // share of observations within ±1/2/3 σ vs. a normal distribution
    sigma: [1, 2, 3].map((k) => ({ k, actual: within(k), normal: [0.6827, 0.9545, 0.9973][k - 1], lo: m - k * s, hi: m + k * s })),
  };
}

export function histogram(xs, bins = 20, lo = null, hi = null) {
  const a = lo ?? Math.min(...xs), b = hi ?? Math.max(...xs);
  const w = (b - a) / bins || 1;
  const out = Array.from({ length: bins }, (_, i) => ({ from: a + i * w, to: a + (i + 1) * w, count: 0 }));
  for (const x of xs) {
    const i = Math.min(bins - 1, Math.max(0, Math.floor((x - a) / w)));
    out[i].count++;
  }
  return out;
}

export const normalPdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));

// "Nice" bin edges so histogram labels read cleanly.
export function niceStep(range, target = 18) {
  const raw = range / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  return (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
}

// trim: share cut off at each tail and counted in the outer bins (keeps outliers from squashing the chart).
export function niceHistogram(xs, target = 18, trim = 0) {
  const lo = trim ? quantile(xs, trim) : Math.min(...xs);
  const hi = trim ? quantile(xs, 1 - trim) : Math.max(...xs);
  const step = niceStep(hi - lo || 1, target);
  const a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step + (hi % step === 0 ? step : 0);
  const n = Math.max(1, Math.round((b - a) / step));
  return histogram(xs, n, a, a + n * step);
}

// ── score (transparent, neutral) ────────────────────────────────────────────
// Long-term signal: distance of the latest value from the threshold, in standard
//   deviations of the full history. 2σ → ±10.
// Short-term signal: change over ~6 months, in standard deviations of all
//   historical 6-month changes. 2σ → ±10.
// Both are multiplied by the indicator's direction (+1: higher = expansionary /
// inflationary impulse, −1: higher = restrictive / contractionary, 0: unscored).

export const SCORE_MAX = 10;
// Round half away from zero so mirrored inputs give mirrored scores (Math.round(-6.5) = -6).
export const roundSym = (x) => Math.sign(x) * Math.round(Math.abs(x)) + 0; // + 0 turns -0 into 0
const toScore = (z) => clamp(roundSym(z * 5), -SCORE_MAX, SCORE_MAX);

export function score(series, ind) {
  const vals = values(series);
  const thr = resolveThreshold(ind.threshold, vals);
  const latest = vals[vals.length - 1];
  const h = MOMENTUM_H[ind.frequency];
  const ch = changes(series, h).filter((x) => x !== null);
  const sL = std(vals), sM = std(ch);
  const zLong = (latest - thr) / sL;
  const zShort = vals.length > h ? (latest - vals[vals.length - 1 - h]) / sM : 0;
  const dir = ind.direction ?? 0;
  const res = { thr, zLong, zShort, latest, horizon: h, trend: Math.abs(zShort) < 0.25 ? 0 : Math.sign(zShort), above: latest >= thr };
  if (!dir) return { ...res, long: null, short: null, total: null };
  const long = toScore(dir * zLong), short = toScore(dir * zShort);
  return { ...res, long, short, total: roundSym((long + short) / 2) };
}

// ── regression vs. real GDP growth ("implied GDP" scorecard) ───────────────

export function toQuarterly(series, freq) {
  if (freq === 'Q') return series;
  if (freq !== 'M') return [];
  const q = new Map();
  for (const [d, v] of series) {
    const y = d.slice(0, 4), m = +d.slice(5, 7);
    const key = `${y}-${String(Math.floor((m - 1) / 3) * 3 + 1).padStart(2, '0')}`;
    if (!q.has(key)) q.set(key, []);
    q.get(key).push(v);
  }
  return [...q.entries()].filter(([, xs]) => xs.length === 3).map(([k, xs]) => [k, mean(xs)]);
}

export function ols(xs, ys) {
  const mx = mean(xs), my = mean(ys);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < xs.length; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  const b = sxy / sxx, a = my - b * mx;
  const r = sxy / Math.sqrt(sxx * syy);
  const resid = xs.map((x, i) => ys[i] - (a + b * x));
  return { a, b, r, r2: r * r, n: xs.length, se: std(resid) };
}

// Pandemic quarters distort any linear fit (−28 % / +35 % annualised).
export const GDP_OUTLIERS = new Set(['2020-04', '2020-07']);

export function gdpRegression(series, freq, gdpSeries, { lead = 0, from = '1985' } = {}) {
  const qs = toQuarterly(series, freq);
  const gdp = new Map(gdpSeries.map(([d, v]) => [d, v]));
  const gdpLabels = gdpSeries.map((p) => p[0]);
  const xs = [], ys = [], pts = [];
  for (const [d, x] of qs) {
    if (d < from) continue;
    const i = gdpLabels.indexOf(d);
    if (i < 0 || i + lead >= gdpLabels.length) continue;
    const target = gdpLabels[i + lead];
    if (GDP_OUTLIERS.has(target) || GDP_OUTLIERS.has(d)) continue;
    xs.push(x); ys.push(gdp.get(target)); pts.push({ d, x, y: gdp.get(target) });
  }
  if (xs.length < 12) return null;
  return { ...ols(xs, ys), points: pts, lead, from };
}

export const implied = (reg, x) => reg.a + reg.b * x;

// ── labour market: Sahm rule ────────────────────────────────────────────────

export function sahm(series) {
  const ma3 = rolling(series, 3);
  return series.map((p, i) => {
    if (ma3[i] === null || i < 14) return null;
    const prior = ma3.slice(i - 12, i).filter((x) => x !== null);
    return ma3[i] - Math.min(...prior);
  });
}

// ── business cycles (NBER recessions) ───────────────────────────────────────

export function monthsBetween(a, b) {
  return periodIndex(b, 'M') - periodIndex(a, 'M') + 1;
}

export function cycles(recessions, from = '1948') {
  const rows = recessions.filter(([s]) => s >= from).map(([s, e]) => ({ start: s, end: e, months: e ? monthsBetween(s, e) : null }));
  // Expansion = months from the end of one recession to the start of the next.
  for (let i = 0; i < rows.length; i++) {
    const prev = i > 0 ? rows[i - 1] : null;
    rows[i].expansionBefore = prev && prev.end ? monthsBetween(prev.end, rows[i].start) - 2 : null;
  }
  const done = rows.filter((r) => r.months !== null);
  const exp = rows.map((r) => r.expansionBefore).filter((x) => x !== null);
  return { rows, avgRecession: mean(done.map((r) => r.months)), avgExpansion: mean(exp) };
}

// ── cross-correlation for the comparison view ───────────────────────────────

export function align(a, b) {
  const mb = new Map(b);
  const out = [];
  for (const [d, v] of a) if (mb.has(d)) out.push([d, v, mb.get(d)]);
  return out;
}

export function correlation(xs, ys) {
  return xs.length > 2 ? ols(xs, ys).r : NaN;
}

// corr(a[t], b[t+lag]) for lag in [-maxLag, maxLag]. Positive lag: a leads b.
export function crossCorrelation(a, b, maxLag = 12) {
  const out = [];
  const keys = a.map((p) => p[0]);
  const bIdx = new Map(b.map((p, i) => [p[0], i]));
  for (let lag = -maxLag; lag <= maxLag; lag++) {
    const xs = [], ys = [];
    for (let i = 0; i < a.length; i++) {
      const j = bIdx.get(keys[i]);
      if (j === undefined) continue;
      const k = j + lag;
      if (k < 0 || k >= b.length) continue;
      xs.push(a[i][1]); ys.push(b[k][1]);
    }
    out.push({ lag, r: xs.length > 12 ? ols(xs, ys).r : NaN, n: xs.length });
  }
  return out;
}
