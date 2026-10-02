import { loadConfig, loadSeries, loadRecessions, indicatorById, categoryOf } from '../data.js';
import * as A from '../analysis.js';
import { C, rgba, ChartSet, lineChart, barChart, recessionBands, recessionPlugin, zeroLine } from '../charts.js';
import { t, L } from '../i18n.js';
import { num, signed, period, esc } from '../format.js';

const ORDER = { M: 0, Q: 1, A: 2 };

// Bring a series to a coarser frequency (M → Q → A) by averaging complete periods.
function toFreq(series, from, to) {
  if (from === to) return series;
  if (to === 'Q') return A.toQuarterly(series, from);
  const per = A.PERIODS_PER_YEAR[from];
  return A.annualAverages(series).filter((r) => r.n === per).map((r) => [r.year, r.avg]);
}

const zscores = (xs) => {
  const m = A.mean(xs), s = A.std(xs);
  return xs.map((x) => (x - m) / s);
};

export async function renderCompare(el, { country, params }) {
  const cfg = await loadConfig(country);
  const recessions = await loadRecessions(country);
  const ids = cfg.indicators.map((i) => i.id);
  let a = ids.includes(params.get('a')) ? params.get('a') : 'mfg_regional';
  let b = ids.includes(params.get('b')) ? params.get('b') : 'claims';
  let years = 20;
  let normalize = true;

  const options = (sel) => cfg.categories.map((cat) => {
    const its = cfg.indicators.filter((i) => i.category === cat.id);
    return `<optgroup label="${esc(L(cat.name))}">${its.map((i) => `<option value="${i.id}"${i.id === sel ? ' selected' : ''}>${esc(L(i.short))}</option>`).join('')}</optgroup>`;
  }).join('');

  el.innerHTML = `
  <div class="page-head">
    <div>
      <a class="crumb" href="#/${country}">← ${esc(L(cfg.name))}</a>
      <h1>${t('cmp.title')}</h1>
      <p>${t('cmp.intro')}</p>
    </div>
  </div>
  <div class="toolbar cmp-bar">
    <label>A <select id="sel-a">${options(a)}</select></label>
    <label>B <select id="sel-b">${options(b)}</select></label>
    <div class="range-btns" id="cmp-range">${[5, 10, 20, 40].map((n) => `<button class="range-btn${n === years ? ' active' : ''}" data-n="${n}">${t('range.y', { n })}</button>`).join('')}<button class="range-btn" data-n="0">${t('range.max')}</button></div>
    <label class="check"><input type="checkbox" id="norm" checked> ${t('cmp.normalize')}</label>
  </div>
  <div id="cmp-body"></div>`;

  const charts = new ChartSet();
  const body = el.querySelector('#cmp-body');

  async function draw() {
    charts.destroy();
    history.replaceState(null, '', `#/${country}/compare?a=${a}&b=${b}`);
    const ia = indicatorById(cfg, a), ib = indicatorById(cfg, b);
    const [da, db] = await Promise.all([loadSeries(country, a), loadSeries(country, b)]);
    const freq = ORDER[ia.frequency] >= ORDER[ib.frequency] ? ia.frequency : ib.frequency;
    let sa = toFreq(da.values, ia.frequency, freq);
    let sb = toFreq(db.values, ib.frequency, freq);
    const joined = A.align(sa, sb);
    const span = years ? years * A.PERIODS_PER_YEAR[freq] : Infinity;
    const win = joined.slice(-span);
    if (win.length < 8) {
      body.innerHTML = `<div class="empty">${t('cmp.noOverlap')}</div>`;
      return;
    }
    const lb = win.map((r) => r[0]);
    const xa = win.map((r) => r[1]), xb = win.map((r) => r[2]);
    const ca = A.changes(win.map((r) => [r[0], r[1]])).slice(1), cb = A.changes(win.map((r) => [r[0], r[2]])).slice(1);
    const rLevel = A.correlation(xa, xb);
    const rChange = A.correlation(ca, cb);
    const maxLag = { M: 18, Q: 8, A: 4 }[freq];
    sa = win.map((r) => [r[0], r[1]]);
    sb = win.map((r) => [r[0], r[2]]);
    const cc = A.crossCorrelation(sa, sb, maxLag).filter((x) => Number.isFinite(x.r));
    const best = cc.reduce((m, x) => (Math.abs(x.r) > Math.abs(m.r) ? x : m), cc[0]);
    const unitF = t('unit.' + freq);
    const leadText = best.lag === 0 ? t('cmp.leadNone')
      : best.lag > 0 ? t('cmp.leadA', { n: best.lag, u: unitF, a: L(ia.short), b: L(ib.short) })
        : t('cmp.leadB', { n: -best.lag, u: unitF, a: L(ia.short), b: L(ib.short) });
    const colA = categoryOf(cfg, ia)?.color || C.purple;
    let colB = categoryOf(cfg, ib)?.color || C.gold;
    if (colB === colA) colB = C.gold;

    body.innerHTML = `
      <div class="metrics">
        <div class="metric-card"><div class="metric-label">${t('cmp.rLevel')}</div><div class="metric-value purple">${num(rLevel, 2)}</div><div class="metric-sub">${t('cmp.obs', { n: win.length })}</div></div>
        <div class="metric-card"><div class="metric-label">${t('cmp.rChange')}</div><div class="metric-value blue">${num(rChange, 2)}</div><div class="metric-sub">${t('cmp.changesSub', { u: t('unit.' + freq + '1') })}</div></div>
        <div class="metric-card"><div class="metric-label">${t('cmp.bestLag')}</div><div class="metric-value gold">${signed(best.lag, 0)}</div><div class="metric-sub">${unitF} · r = ${num(best.r, 2)}</div></div>
        <div class="metric-card"><div class="metric-label">${t('cmp.freq')}</div><div class="metric-value">${t('freq.' + freq)}</div><div class="metric-sub">${period(lb[0], freq)} – ${period(lb[lb.length - 1], freq)}</div></div>
      </div>
      <div class="chart-card">
        <div class="chart-title"><span class="dot" style="background:${colA}"></span>${esc(L(ia.short))} <span class="muted">vs.</span> <span class="dot" style="background:${colB}"></span>${esc(L(ib.short))}</div>
        <div class="chart-box h-lg"><canvas id="c-cmp"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-title"><span class="dot" style="background:${C.gold}"></span>${t('cmp.cc')}</div>
        <div class="chart-box"><canvas id="c-cc"></canvas></div>
        <div class="info-box"><strong>${t('cmp.reading')}</strong> ${esc(leadText)} ${t('cmp.ccNote')}</div>
      </div>`;

    const datasets = normalize
      ? [
        { label: `${L(ia.short)} (z)`, data: zscores(xa), borderColor: colA, borderWidth: 1.8 },
        { label: `${L(ib.short)} (z)`, data: zscores(xb), borderColor: colB, borderWidth: 1.8 },
      ]
      : [
        { label: L(ia.short), data: xa, borderColor: colA, borderWidth: 1.8, yAxisID: 'y' },
        { label: L(ib.short), data: xb, borderColor: colB, borderWidth: 1.8, yAxisID: 'y1' },
      ];
    const chart = lineChart(el.querySelector('#c-cmp'), {
      labels: lb, datasets, legend: true, xFmt: (l) => period(l, freq),
      yFmt: (v) => num(v, 1),
      tooltip: { callbacks: { title: (i) => period(i[0].label, freq), label: (c) => ` ${c.dataset.label}: ${num(c.raw, 2)}` } },
      plugins: [recessionPlugin(recessionBands(lb, freq, recessions)), ...(normalize ? [zeroLine()] : [])],
    });
    if (!normalize) {
      chart.options.scales.y1 = { position: 'right', grid: { drawOnChartArea: false }, ticks: { callback: (v) => num(v, 1) } };
      chart.update();
    }
    charts.add(chart);
    charts.add(barChart(el.querySelector('#c-cc'), {
      labels: cc.map((x) => String(x.lag)), data: cc.map((x) => x.r),
      colors: cc.map((x) => (x.lag === best.lag ? C.gold : rgba(x.r >= 0 ? C.sky : C.amber, 0.6))),
      yFmt: (v) => num(v, 1),
      tooltip: { callbacks: { title: (i) => `${t('cmp.lag')} ${i[0].label} ${unitF}`, label: (c) => ` r = ${num(c.raw, 3)}` } },
      plugins: [zeroLine()],
    }));
  }

  el.querySelector('#sel-a').addEventListener('change', (e) => { a = e.target.value; draw(); });
  el.querySelector('#sel-b').addEventListener('change', (e) => { b = e.target.value; draw(); });
  el.querySelector('#norm').addEventListener('change', (e) => { normalize = e.target.checked; draw(); });
  el.querySelector('#cmp-range').addEventListener('click', (e) => {
    const btn = e.target.closest('.range-btn');
    if (!btn) return;
    el.querySelectorAll('#cmp-range .range-btn').forEach((x) => x.classList.toggle('active', x === btn));
    years = +btn.dataset.n;
    draw();
  });
  await draw();
  document.title = `${t('cmp.title')} · FreemanMacroScope`;
  return () => charts.destroy();
}
