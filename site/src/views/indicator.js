import { loadConfig, loadIndex, loadSeries, loadRecessions, indicatorById, categoryOf } from '../data.js';
import * as A from '../analysis.js';
import {
  C, rgba, ChartSet, lineChart, barChart, doughnut, scatter, gradient,
  zonePlugin, thresholdLine, recessionBands, recessionPlugin, zeroLine, zoneColors,
} from '../charts.js';
import { t, L } from '../i18n.js';
import { num, signed, pct, period, dateTime, esc, monthNames } from '../format.js';
import { adSlot, fillAds } from '../ads.js';
import { scoreChip, trendWord, trendArrow, zoneLabel, cyclesSection } from './overview.js';

const RANGES = [['1', 1], ['3', 3], ['5', 5], ['10', 10], ['20', 20], ['max', Infinity]];

export async function renderIndicator(el, { country, id, tab }) {
  const cfg = await loadConfig(country);
  const ind = indicatorById(cfg, id);
  if (!ind) { el.innerHTML = `<div class="empty">${t('err.notFound')}</div>`; return () => {}; }
  const cat = categoryOf(cfg, ind);
  const [data, index, recessions, gdpData] = await Promise.all([
    loadSeries(country, id),
    loadIndex(country),
    loadRecessions(country),
    ind.gdpRegression ? loadSeries(country, cfg.gdpIndicator).catch(() => null) : null,
  ]);

  const f = ind.frequency;
  const ppy = A.PERIODS_PER_YEAR[f];
  const series = data.values;
  const labels = A.labels(series);
  const vals = A.values(series);
  const d = ind.decimals;
  const unit = L(ind.unit);
  const sc = A.score(series, ind);
  const thr = sc.thr;
  const zc = zoneColors(ind, cat);
  const accent = cat?.color || C.purple;
  const fmtP = (l) => period(l, f);
  const fmtV = (v) => num(v, d);
  const isAbove = (v) => v >= thr;
  const zoneOf = (v) => L(isAbove(v) ? ind.zones.above : ind.zones.below);
  const thrLabel = `${t('ind.threshold')} ${fmtV(thr)}${typeof ind.threshold === 'string' ? ` (${t('thr.' + ind.threshold)})` : ''}`;
  const reg = gdpData ? A.gdpRegression(series, f, gdpData.values) : null;
  const regLead = gdpData ? A.gdpRegression(series, f, gdpData.values, { lead: 1 }) : null;
  const latest = vals[vals.length - 1];
  const prev = vals[vals.length - 2];
  const yAgo = vals.length > ppy ? vals[vals.length - 1 - ppy] : null;
  const last10 = A.lastYears(series, f, f === 'A' ? 30 : 10);
  const v10 = A.values(last10);
  const iMax = v10.indexOf(Math.max(...v10)), iMin = v10.indexOf(Math.min(...v10));
  const pctRank = A.percentileRank(vals, latest);
  const roll = A.rolling(series, f === 'A' ? 3 : ppy);
  const chg = A.changes(series);
  const bands = (lbls) => recessionBands(lbls, f, recessions);

  const tabs = [
    ['overview', t('tab.overview')],
    ['trend', t('tab.trend')],
    ...(f !== 'A' ? [['heatmap', t('tab.heatmap')]] : []),
    ['stats', t('tab.stats')],
    ...(reg ? [['gdp', t('tab.gdp')]] : []),
    ...(ind.cycles ? [['cycles', t('tab.cycles')]] : []),
    ['table', t('tab.table')],
    ['info', t('tab.info')],
  ];
  let active = tabs.some(([k]) => k === tab) ? tab : 'overview';

  const metric = (label, val, sub, cls = '') =>
    `<div class="metric-card"><div class="metric-label">${label}</div><div class="metric-value ${cls}">${val}</div><div class="metric-sub">${sub}</div></div>`;
  const zoneCls = (v) => (isAbove(v) ? 'z-above' : 'z-below');

  el.style.setProperty('--accent', accent);
  el.style.setProperty('--zone-above', zc.above);
  el.style.setProperty('--zone-below', zc.below);
  el.innerHTML = `
  <div class="page-head">
    <div>
      <a class="crumb" href="#/${country}">← ${esc(L(cfg.name))} · ${esc(L(cat.name))}</a>
      <h1>${esc(L(ind.name))}</h1>
      <p>${esc(unit)} · ${t('freq.' + f)} · ${t('ind.lastObs')} ${fmtP(data.last.slice(0, 7))}${data.partialLast ? ` <span class="badge-mini" title="${esc(t('ind.partialHint'))}">${t('ind.partial')}</span>` : ''}${data.stale ? ` <span class="badge-mini warn">${t('ind.stale')}</span>` : ''} · ${t('common.source')}: ${ind.sources.map((s) => esc(s.name.split(' – ')[0])).join(', ')}</p>
    </div>
    <span class="badge" style="--accent:${accent}">${esc(ind.code)}</span>
  </div>
  <nav class="tabs" role="tablist">${tabs.map(([k, n]) => `<button class="tab${k === active ? ' active' : ''}" data-tab="${k}" role="tab">${n}</button>`).join('')}</nav>
  <div class="tab-panels">${tabs.map(([k]) => `<section class="content${k === active ? ' active' : ''}" id="tab-${k}"></section>`).join('')}</div>`;

  const charts = new ChartSet();
  const built = new Set();
  const panel = (k) => el.querySelector(`#tab-${k}`);
  const canvas = (sel) => el.querySelector(sel);

  // Base options for time-series line charts of this indicator.
  const tsTooltip = {
    callbacks: {
      title: (items) => fmtP(items[0].label),
      label: (c) => (c.raw === null ? '' : ` ${c.dataset.label}: ${fmtV(c.raw)}`),
    },
  };

  function mainChart(cv, n) {
    const s = n === Infinity ? series : A.lastYears(series, f, n);
    const lb = A.labels(s);
    const ctx = cv.getContext('2d');
    return lineChart(cv, {
      labels: lb,
      datasets: [{ label: L(ind.short), data: A.values(s), borderColor: accent, borderWidth: 1.8, backgroundColor: gradient(ctx, accent), fill: true }],
      xFmt: fmtP, yFmt: (v) => num(v, Math.min(d, 2)),
      tooltip: { callbacks: { ...tsTooltip.callbacks, afterLabel: (c) => ` ${zoneOf(c.raw)}` } },
      plugins: [recessionPlugin(bands(lb)), zonePlugin(thr, zc), thresholdLine(thr, fmtV(thr))],
    });
  }

  const builders = {
    overview() {
      const p = panel('overview');
      const ch = latest - prev;
      p.innerHTML = `
        <div class="metrics">
          ${metric(t('m.latest'), fmtV(latest), `${fmtP(data.last.slice(0, 7))} · ${esc(zoneOf(latest))}`, zoneCls(latest))}
          ${metric(t('m.change'), signed(ch, d), t('m.vsPrior'), ch >= 0 ? 'up' : 'down')}
          ${yAgo !== null ? metric(t('m.change1y'), signed(latest - yAgo, d), t('m.vsYearAgo'), latest - yAgo >= 0 ? 'up' : 'down') : ''}
          ${metric(t('m.avg', { n: f === 'A' ? 30 : 10 }), fmtV(A.mean(v10)), `${fmtP(last10[0][0])} – ${fmtP(data.last.slice(0, 7))}`, 'blue')}
          ${metric(t('m.high', { n: f === 'A' ? 30 : 10 }), fmtV(v10[iMax]), fmtP(last10[iMax][0]), 'gold')}
          ${metric(t('m.low', { n: f === 'A' ? 30 : 10 }), fmtV(v10[iMin]), fmtP(last10[iMin][0]), 'gold')}
          ${metric(t('m.percentile'), num(pctRank, 0), t('m.percentileSub', { from: fmtP(labels[0]) }), 'purple')}
          ${sc.total !== null ? metric(t('score.total'), signed(sc.total, 0), `${t('score.short')} ${signed(sc.short, 0)} · ${t('score.long')} ${signed(sc.long, 0)}`, sc.total > 0 ? 'pos' : sc.total < 0 ? 'neg' : '') : metric(t('score.total'), '–', t('ov.unscored'))}
        </div>
        <div class="chart-card">
          <div class="chart-title"><span class="dot" style="background:${accent}"></span>${esc(L(ind.short))}
            <div class="range-btns" data-for="main">${RANGES.map(([k, n]) => `<button class="range-btn${n === 10 ? ' active' : ''}" data-n="${n}">${k === 'max' ? t('range.max') : t('range.y', { n: k })}</button>`).join('')}</div>
          </div>
          <div class="legend">
            <span class="legend-item"><span class="legend-box" style="background:${accent}"></span>${esc(L(ind.short))}</span>
            <span class="legend-item"><span class="legend-box" style="background:${rgba(zc.above, 0.35)}"></span>${esc(L(ind.zones.above))} (≥ ${fmtV(thr)})</span>
            <span class="legend-item"><span class="legend-box" style="background:${rgba(zc.below, 0.35)}"></span>${esc(L(ind.zones.below))} (&lt; ${fmtV(thr)})</span>
            <span class="legend-item"><span class="legend-box" style="background:rgba(148,163,184,0.3)"></span>${t('ind.recession')}</span>
          </div>
          <div class="chart-box h-lg"><canvas id="c-main"></canvas></div>
        </div>
        ${adSlot('indicator')}
        <div class="charts-grid">
          <div class="chart-card"><div class="chart-title"><span class="dot" style="background:${C.red}"></span>${t('c.change')}</div><div class="chart-box"><canvas id="c-change"></canvas></div></div>
          <div class="chart-card"><div class="chart-title"><span class="dot" style="background:${C.blue}"></span>${t('c.rolling', { n: f === 'A' ? 3 : ppy, u: t('unit.' + f) })}</div><div class="chart-box"><canvas id="c-rolling"></canvas></div></div>
        </div>
        <div class="info-box">
          <strong>${t('ind.whatIs')}</strong> ${esc(L(ind.description))}<br>
          <strong>${t('ind.reading')}</strong> ${esc(L(ind.interpretation))}
          ${ind.replaces ? `<br><strong>${t('ind.note')}</strong> ${esc(L(ind.replaces))}` : ''}
        </div>`;
      let main = charts.add(mainChart(canvas('#c-main'), 10));
      p.querySelector('[data-for="main"]').addEventListener('click', (e) => {
        const b = e.target.closest('.range-btn');
        if (!b) return;
        p.querySelectorAll('[data-for="main"] .range-btn').forEach((x) => x.classList.toggle('active', x === b));
        main.destroy();
        main = charts.add(mainChart(canvas('#c-main'), +b.dataset.n || Infinity));
      });
      const s10 = A.lastYears(series, f, f === 'A' ? 30 : 10);
      const off = series.length - s10.length;
      const lb10 = A.labels(s10);
      const ch10 = chg.slice(off);
      charts.add(barChart(canvas('#c-change'), {
        labels: lb10, data: ch10,
        colors: ch10.map((v) => (v === null ? 'transparent' : v >= 0 ? rgba(C.green, 0.7) : rgba(C.red, 0.7))),
        xFmt: fmtP, xDisplay: false, yFmt: (v) => signed(v, Math.min(d, 2)),
        tooltip: { callbacks: { title: (i) => fmtP(i[0].label), label: (c) => ` Δ ${signed(c.raw, d)}` } },
      }));
      charts.add(lineChart(canvas('#c-rolling'), {
        labels: lb10,
        datasets: [
          { label: L(ind.short), data: A.values(s10), borderColor: rgba(accent, 0.25), borderWidth: 1 },
          { label: t('c.avg'), data: roll.slice(off), borderColor: C.blue, borderWidth: 2 },
        ],
        xFmt: fmtP, yFmt: (v) => num(v, Math.min(d, 2)), tooltip: tsTooltip,
        plugins: [zonePlugin(thr, zc)],
      }));
      fillAds(p);
    },

    trend() {
      const p = panel('trend');
      const st = A.streaks(vals, thr);
      const h = A.MOMENTUM_H[f];
      const mom = A.changes(series, h);
      const allMax = Math.max(...vals), allMin = Math.min(...vals);
      const seasonal = f !== 'A' ? A.seasonalYears(series, f, 3) : [];
      const sahm = ind.sahm ? A.sahm(series) : null;
      const curRun = st[st.length - 1];
      p.innerHTML = `
        <div class="info-box">
          <strong>${esc(thrLabel)}</strong> — ${t('trend.thrText', { above: L(ind.zones.above), below: L(ind.zones.below) })}<br>
          <strong>${t('trend.current')}</strong> ${t('trend.runText', { n: Math.abs(curRun), u: t('unit.' + f + (Math.abs(curRun) === 1 ? '1' : '')), zone: zoneOf(latest) })}
          · <strong>${t('trend.momentum', { h, u: t('unit.' + f) })}</strong> ${signed(latest - vals[vals.length - 1 - h], d)} (${trendArrow(sc.trend)} ${esc(trendWord(sc.trend))}, z = ${num(sc.zShort, 2)})<br>
          <strong>${t('trend.allTime')}</strong> ${t('trend.high')} ${fmtV(allMax)} (${fmtP(labels[vals.indexOf(allMax)])}) · ${t('trend.low')} ${fmtV(allMin)} (${fmtP(labels[vals.indexOf(allMin)])})
        </div>
        <div class="charts-grid">
          <div class="chart-card"><div class="chart-title"><span class="dot" style="background:${C.green}"></span>${t('c.streak', { thr: fmtV(thr) })}</div><div class="chart-box"><canvas id="c-streak"></canvas></div></div>
          ${seasonal.length ? `<div class="chart-card"><div class="chart-title"><span class="dot" style="background:${C.gold}"></span>${t('c.seasonal')}</div><div class="chart-box"><canvas id="c-seasonal"></canvas></div></div>` : ''}
        </div>
        <div class="chart-card"><div class="chart-title"><span class="dot" style="background:${C.purple}"></span>${t('c.momentum', { h, u: t('unit.' + f) })}</div><div class="chart-box"><canvas id="c-mom"></canvas></div></div>
        ${sahm ? `<div class="chart-card"><div class="chart-title"><span class="dot" style="background:${C.red}"></span>${t('c.sahm')}</div>
          <div class="chart-box"><canvas id="c-sahm"></canvas></div>
          <p class="source-note">${t('sahm.note', { v: num(sahm[sahm.length - 1], 2) })}</p></div>` : ''}
        ${data.base ? `<div class="chart-card"><div class="chart-title"><span class="dot" style="background:${C.blue}"></span>${t('c.base')} (${esc(L(ind.base.unit))})</div><div class="chart-box"><canvas id="c-base"></canvas></div></div>` : ''}
        ${data.base && ind.base.showChange ? `<div class="chart-card"><div class="chart-title"><span class="dot" style="background:${C.green}"></span>${t('c.baseChange')} (${esc(L(ind.base.unit))})</div><div class="chart-box"><canvas id="c-basechg"></canvas></div></div>` : ''}`;

      const n10 = Math.min(series.length, (f === 'A' ? 30 : 10) * ppy);
      const lb = labels.slice(-n10);
      const stv = st.slice(-n10);
      charts.add(barChart(canvas('#c-streak'), {
        labels: lb, data: stv, xDisplay: false,
        colors: stv.map((v) => (v > 0 ? rgba(zc.above, 0.65) : rgba(zc.below, 0.65))),
        yFmt: (v) => `${v > 0 ? '+' : ''}${v}`,
        tooltip: { callbacks: { title: (i) => fmtP(i[0].label), label: (c) => ` ${Math.abs(c.raw)} ${t('unit.' + f)} ${c.raw > 0 ? '≥' : '<'} ${fmtV(thr)}` } },
      }));
      if (seasonal.length) {
        const cols = f === 'Q' ? ['Q1', 'Q2', 'Q3', 'Q4'] : monthNames();
        const colors = [rgba(accent, 0.4), C.gold, C.green];
        charts.add(lineChart(canvas('#c-seasonal'), {
          labels: cols, legend: true,
          datasets: seasonal.map((row, i) => ({ label: row.year, data: row.cells, borderColor: colors[i + 3 - seasonal.length], borderWidth: i === seasonal.length - 1 ? 2.2 : 1.5, borderDash: i === seasonal.length - 1 ? [] : [4, 2], pointRadius: 2, spanGaps: true })),
          yFmt: (v) => num(v, Math.min(d, 2)),
          tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${c.raw === null ? '—' : fmtV(c.raw)}` } },
          plugins: [zonePlugin(thr, zc)],
        }));
      }
      const momv = mom.slice(-n10);
      charts.add(barChart(canvas('#c-mom'), {
        labels: lb, data: momv, xFmt: fmtP,
        colors: momv.map((v) => (v === null ? 'transparent' : v >= 0 ? rgba(C.green, 0.65) : rgba(C.red, 0.65))),
        yFmt: (v) => signed(v, Math.min(d, 2)),
        tooltip: { callbacks: { title: (i) => fmtP(i[0].label), label: (c) => ` Δ${h}: ${signed(c.raw, d)}` } },
        plugins: [recessionPlugin(bands(lb))],
      }));
      if (sahm) {
        const lbs = labels.slice(-Math.min(series.length, 50 * 12));
        charts.add(lineChart(canvas('#c-sahm'), {
          labels: lbs,
          datasets: [{ label: 'Sahm', data: sahm.slice(-lbs.length), borderColor: C.red, borderWidth: 1.6 }],
          xFmt: fmtP, yFmt: (v) => num(v, 1),
          tooltip: { callbacks: { title: (i) => fmtP(i[0].label), label: (c) => ` Sahm: ${num(c.raw, 2)}` } },
          plugins: [recessionPlugin(bands(lbs)), thresholdLine(0.5, '0,5', C.red)],
        }));
      }
      if (data.base) {
        const bs = data.base.slice(-n10 - ppy);
        const bd = ind.base.decimals;
        charts.add(lineChart(canvas('#c-base'), {
          labels: A.labels(bs),
          datasets: [{ label: L(ind.base.unit), data: A.values(bs), borderColor: C.blue, borderWidth: 1.8, backgroundColor: gradient(canvas('#c-base').getContext('2d'), C.blue, 260, 0.2), fill: true }],
          xFmt: fmtP, yFmt: (v) => num(v, 0),
          tooltip: { callbacks: { title: (i) => fmtP(i[0].label), label: (c) => ` ${num(c.raw, bd)}` } },
          plugins: [recessionPlugin(bands(A.labels(bs)))],
        }));
        if (ind.base.showChange) {
          const b5 = data.base.slice(-61);
          const bc = A.changes(b5).slice(1);
          charts.add(barChart(canvas('#c-basechg'), {
            labels: A.labels(b5).slice(1), data: bc, xFmt: fmtP,
            colors: bc.map((v) => (v >= 0 ? rgba(C.green, 0.7) : rgba(C.red, 0.7))),
            yFmt: (v) => signed(v, 0),
            tooltip: { callbacks: { title: (i) => fmtP(i[0].label), label: (c) => ` Δ ${signed(c.raw, bd)}` } },
          }));
        }
      }
    },

    heatmap() {
      const p = panel('heatmap');
      const sd = A.std(vals);
      const steps = [
        [2, t('hm.far', { s: '≥ +2σ' })], [1, '+1σ … +2σ'], [0, '0 … +1σ'], [-1, '−1σ … 0'], [-2, '−2σ … −1σ'], [-Infinity, t('hm.far', { s: '≤ −2σ' })],
      ];
      const color = (v) => {
        const z = (v - thr) / sd;
        const base = z >= 0 ? zc.above : zc.below;
        const a = Math.min(0.9, 0.18 + Math.abs(z) * 0.32);
        return rgba(base, a);
      };
      const grid = A.heatGrid(series, f);
      const cols = f === 'Q' ? ['Q1', 'Q2', 'Q3', 'Q4'] : monthNames();
      const render = (all) => {
        const rows = all ? grid : grid.slice(-30);
        return `<div class="heatmap" style="--cols:${cols.length}">
          <div class="hm-row hm-head"><div></div>${cols.map((c) => `<div>${c}</div>`).join('')}<div>Ø</div></div>
          ${[...rows].reverse().map((r) => {
            const xs = r.cells.filter((x) => x !== null);
            const avg = A.mean(xs);
            return `<div class="hm-row"><div class="hm-year">${r.year}</div>${r.cells.map((v, i) => v === null ? '<div class="hm-cell empty"></div>' : `<div class="hm-cell" style="background:${color(v)}" title="${esc(`${period(`${r.year}-${String(f === 'Q' ? i * 3 + 1 : i + 1).padStart(2, '0')}`, f)}: ${fmtV(v)} · ${zoneOf(v)}`)}">${num(v, Math.min(d, 1))}</div>`).join('')}<div class="hm-cell avg" style="background:${color(avg)}">${num(avg, Math.min(d, 1))}</div></div>`;
          }).join('')}
        </div>`;
      };
      p.innerHTML = `
        <div class="info-box">${t('hm.info', { thr: fmtV(thr), above: L(ind.zones.above), below: L(ind.zones.below), sd: num(sd, Math.min(d + 1, 2)) })}</div>
        <div class="legend">${steps.map(([z, lab]) => `<span class="legend-item"><span class="legend-box" style="background:${color(thr + (z === -Infinity ? -2.5 : z === 2 ? 2.5 : z + 0.5) * sd)}"></span>${lab}</span>`).join('')}</div>
        ${grid.length > 30 ? `<div class="range-btns"><button class="range-btn active" data-all="0">${t('hm.last30')}</button><button class="range-btn" data-all="1">${t('hm.all', { n: grid.length })}</button></div>` : ''}
        <div class="table-wrap" id="hm-wrap">${render(false)}</div>`;
      p.querySelectorAll('[data-all]').forEach((b) => b.addEventListener('click', () => {
        p.querySelectorAll('[data-all]').forEach((x) => x.classList.toggle('active', x === b));
        p.querySelector('#hm-wrap').innerHTML = render(b.dataset.all === '1');
      }));
    },

    stats() {
      const p = panel('stats');
      const ch = chg.filter((x) => x !== null);
      const ds = A.describe(ch);
      const lv = A.describe(vals);
      const above = vals.filter(isAbove).length;
      const hist = A.niceHistogram(vals);
      const chist = A.niceHistogram(ch, 24, 0.01);
      const annual = A.annualAverages(series).slice(-40);
      const dc = Math.min(d + 1, 3);
      const kurtText = ds.kurtosis > 1 ? t('st.kurtHigh') : ds.kurtosis < -0.5 ? t('st.kurtLow') : t('st.kurtNormal');
      const skewText = ds.skew > 0.5 ? t('st.skewPos') : ds.skew < -0.5 ? t('st.skewNeg') : t('st.skewSym');
      const row = (k, v) => `<tr><td>${k}</td><td class="num">${v}</td></tr>`;
      p.innerHTML = `
        <div class="charts-grid">
          <div class="chart-card"><div class="chart-title"><span class="dot" style="background:${accent}"></span>${t('c.histLevel')}</div><div class="chart-box"><canvas id="c-hist"></canvas></div></div>
          <div class="chart-card"><div class="chart-title"><span class="dot" style="background:${zc.above}"></span>${t('c.aboveBelow')}</div><div class="chart-box"><canvas id="c-pie"></canvas></div></div>
        </div>
        <div class="chart-card"><div class="chart-title"><span class="dot" style="background:${C.blue}"></span>${t('c.annual')}</div><div class="chart-box h-sm"><canvas id="c-annual"></canvas></div></div>
        <div class="chart-card">
          <div class="chart-title"><span class="dot" style="background:${C.purple}"></span>${t('st.changeTitle')}</div>
          <p class="fine">${t('st.changeIntro', { u: t('unit.' + f) })}</p>
          <div class="charts-grid">
            <div class="chart-box h-md"><canvas id="c-chist"></canvas></div>
            <div>
              <div class="table-wrap"><table class="stat-table"><tbody>
                ${row(t('st.n'), ds.n)}
                ${row(t('st.mean'), signed(ds.mean, dc))}
                ${row(t('st.median'), signed(ds.median, dc))}
                ${row(t('st.std'), num(ds.std, dc))}
                ${row(t('st.stderr'), num(ds.stderr, dc + 1))}
                ${row(t('st.var'), num(ds.variance, dc + 1))}
                ${row(t('st.skew'), num(ds.skew, 2))}
                ${row(t('st.kurt'), num(ds.kurtosis, 2))}
                ${row(t('st.min'), signed(ds.min, dc))}
                ${row(t('st.max'), signed(ds.max, dc))}
                ${row(t('st.posNeg'), `${ds.pos} / ${ds.neg} / ${ds.zero}`)}
                ${row(t('st.avgPos'), signed(ds.avgPos, dc))}
                ${row(t('st.avgNeg'), signed(ds.avgNeg, dc))}
                ${row(t('st.ratio'), num(ds.ratioPN, 2))}
              </tbody></table></div>
            </div>
          </div>
          <div class="table-wrap"><table>
            <thead><tr><th>${t('st.band')}</th><th>${t('st.range')}</th><th>${t('st.actual')}</th><th>${t('st.normal')}</th><th>${t('st.diff')}</th></tr></thead>
            <tbody>${ds.sigma.map((s) => `<tr><td>±${s.k}σ</td><td class="mono">${signed(s.lo, dc)} … ${signed(s.hi, dc)}</td><td class="num">${pct(s.actual, 1)}</td><td class="num muted">${pct(s.normal, 1)}</td><td class="num">${signed((s.actual - s.normal) * 100, 1)} pp</td></tr>`).join('')}</tbody>
          </table></div>
          <div class="info-box"><strong>${t('st.reading')}</strong> ${skewText} ${kurtText} ${t('st.latestChange', { v: signed(chg[chg.length - 1], d), z: num((chg[chg.length - 1] - ds.mean) / ds.std, 2) })}</div>
        </div>
        <div class="chart-card">
          <div class="chart-title"><span class="dot" style="background:${accent}"></span>${t('st.levelTitle')}</div>
          <div class="metrics">
            ${metric(t('st.mean'), fmtV(lv.mean), t('st.fullHistory'))}
            ${metric(t('st.median'), fmtV(lv.median), t('st.fullHistory'))}
            ${metric(t('st.std'), num(lv.std, d), t('st.fullHistory'))}
            ${metric(t('m.percentile'), num(pctRank, 0), t('m.percentileSub', { from: fmtP(labels[0]) }), 'purple')}
            ${metric(t('st.zLevel'), num(sc.zLong, 2), t('st.zLevelSub'))}
          </div>
        </div>`;
      charts.add(barChart(canvas('#c-hist'), {
        labels: hist.map((b) => num(b.from, Math.min(d, 1))), data: hist.map((b) => b.count),
        colors: hist.map((b) => rgba((b.from + b.to) / 2 >= thr ? zc.above : zc.below, 0.65)),
        tooltip: { callbacks: { title: (i) => `${num(hist[i[0].dataIndex].from, d)} – ${num(hist[i[0].dataIndex].to, d)}`, label: (c) => ` ${c.raw} ${t('unit.' + f)}` } },
      }));
      charts.add(doughnut(canvas('#c-pie'), {
        labels: [`${L(ind.zones.above)} (≥ ${fmtV(thr)})`, `${L(ind.zones.below)} (< ${fmtV(thr)})`],
        data: [above, vals.length - above], colors: [rgba(zc.above, 0.75), rgba(zc.below, 0.75)],
        tooltip: { callbacks: { label: (c) => ` ${c.raw} ${t('unit.' + f)} (${num((c.raw / vals.length) * 100, 0)} %)` } },
      }));
      charts.add(barChart(canvas('#c-annual'), {
        labels: annual.map((a) => a.year), data: annual.map((a) => a.avg),
        colors: annual.map((a) => rgba(a.avg >= thr ? zc.above : zc.below, 0.7)),
        yFmt: (v) => num(v, Math.min(d, 1)),
        tooltip: { callbacks: { label: (c) => ` Ø ${fmtV(c.raw)}` } },
        plugins: [thresholdLine(thr, fmtV(thr))],
      }));
      const w = chist[0] ? chist[0].to - chist[0].from : 1;
      charts.add(barChart(canvas('#c-chist'), {
        labels: chist.map((b) => num(b.from, Math.min(d + 1, 2))),
        datasets: [
          { type: 'bar', label: t('st.actual'), data: chist.map((b) => b.count), backgroundColor: chist.map((b) => rgba((b.from + b.to) / 2 >= 0 ? C.green : C.red, 0.6)), borderWidth: 0, borderRadius: 2, order: 2 },
          { type: 'line', label: t('st.normal'), data: chist.map((b) => A.normalPdf((b.from + b.to) / 2, ds.mean, ds.std) * w * ds.n), borderColor: C.gold, borderWidth: 1.5, pointRadius: 0, tension: 0.4, order: 1 },
        ],
        tooltip: { callbacks: { title: (i) => `Δ ${num(chist[i[0].dataIndex].from, dc)} … ${num(chist[i[0].dataIndex].to, dc)}`, label: (c) => ` ${c.dataset.label}: ${num(c.raw, c.datasetIndex ? 1 : 0)}` } },
      }));
    },

    gdp() {
      const p = panel('gdp');
      const gd = gdpData.values;
      const q = A.toQuarterly(series, f);
      const gdpMap = new Map(gd);
      const impliedNow = A.implied(reg, latest);
      const q20 = q.slice(-80);
      const steps = scorecardSteps(vals, d);
      p.innerHTML = `
        <div class="info-box">
          <strong>${t('gdp.title', { name: L(ind.short) })}</strong> — ${t('gdp.method', { from: reg.from, n: reg.n })}<br>
          ${t('gdp.formula')} <span class="mono">GDP ≈ ${num(reg.a, 2)} ${reg.b >= 0 ? '+' : '−'} ${num(Math.abs(reg.b), 3)} × x</span> · R² ${num(reg.r2, 2)}
          ${reg.r2 < 0.2 ? `<br><span class="warn-text">${t('gdp.weak')}</span>` : ''}
        </div>
        <div class="metrics">
          ${metric(t('gdp.implied'), `${signed(impliedNow, 1)} %`, t('gdp.impliedSub', { v: fmtV(latest) }), impliedNow >= 0 ? 'pos' : 'neg')}
          ${metric(t('gdp.actual'), `${signed(gd[gd.length - 1][1], 1)} %`, period(gd[gd.length - 1][0], 'Q'), 'blue')}
          ${metric('R²', num(reg.r2, 2), t('gdp.r2Sub'), 'purple')}
          ${metric(t('gdp.slope'), signed(reg.b, 3), t('gdp.slopeSub', { u: unit }))}
          ${metric(t('gdp.se'), `± ${num(reg.se, 1)} pp`, t('gdp.seSub'))}
          ${regLead ? metric(t('gdp.lead'), num(regLead.r2, 2), t('gdp.leadSub')) : ''}
        </div>
        <div class="chart-card">
          <div class="chart-title"><span class="dot" style="background:${C.green}"></span>${t('gdp.chart')}</div>
          <div class="legend">
            <span class="legend-item"><span class="legend-box" style="background:${C.green}"></span>${t('gdp.impliedLine')}</span>
            <span class="legend-item"><span class="legend-box" style="background:${C.text2}"></span>${t('gdp.actualBars')}</span>
          </div>
          <div class="chart-box h-lg"><canvas id="c-gdp"></canvas></div>
        </div>
        <div class="charts-grid">
          <div class="chart-card"><div class="chart-title"><span class="dot" style="background:${accent}"></span>${t('gdp.scatter')}</div><div class="chart-box h-md"><canvas id="c-scatter"></canvas></div></div>
          <div class="chart-card">
            <div class="chart-title"><span class="dot" style="background:${C.gold}"></span>${t('gdp.scorecard')}</div>
            <p class="fine">${t('gdp.scorecardIntro')}</p>
            <div class="scorecard-wrap"><table class="scorecard-table">
              <thead><tr><th>${esc(ind.code)}</th>${steps.map((s) => `<th class="${Math.abs(s - latest) === Math.min(...steps.map((x) => Math.abs(x - latest))) ? 'current' : ''}">${num(s, Math.min(d, 1))}</th>`).join('')}</tr></thead>
              <tbody><tr><th>^GDP %</th>${steps.map((s) => { const g = A.implied(reg, s); return `<td class="${g > 0 ? 'sc-good' : g < 0 ? 'sc-bad' : ''}">${signed(g, 1)}</td>`; }).join('')}</tr></tbody>
            </table></div>
          </div>
        </div>
        <p class="source-note">${t('gdp.disclaimer')}</p>`;
      const lb = q20.map((x) => x[0]);
      charts.add(barChart(canvas('#c-gdp'), {
        labels: lb, xFmt: (l) => period(l, 'Q'),
        datasets: [
          { type: 'bar', label: t('gdp.actualBars'), data: lb.map((l) => (A.GDP_OUTLIERS.has(l) ? null : gdpMap.get(l) ?? null)), backgroundColor: rgba(C.text2, 0.35), borderWidth: 0, borderRadius: 2, order: 2 },
          { type: 'line', label: t('gdp.impliedLine'), data: q20.map((x) => A.implied(reg, x[1])), borderColor: C.green, borderWidth: 1.8, pointRadius: 0, tension: 0.3, order: 1 },
        ],
        yFmt: (v) => `${signed(v, 0)}%`,
        tooltip: { callbacks: { title: (i) => period(i[0].label, 'Q'), label: (c) => ` ${c.dataset.label}: ${c.raw === null ? '—' : signed(c.raw, 1) + ' %'}` } },
        plugins: [recessionPlugin(recessionBands(lb, 'Q', recessions)), zeroLine()],
      }));
      const xs = reg.points.map((pt) => pt.x);
      const lo = Math.min(...xs), hi = Math.max(...xs);
      charts.add(scatter(canvas('#c-scatter'), {
        datasets: [
          { label: t('gdp.quarters'), data: reg.points.map((pt) => ({ x: pt.x, y: pt.y, d: pt.d })), backgroundColor: rgba(accent, 0.45), pointRadius: 2.5 },
          { label: t('gdp.fit'), type: 'line', data: [{ x: lo, y: A.implied(reg, lo) }, { x: hi, y: A.implied(reg, hi) }], borderColor: C.gold, borderWidth: 1.5, pointRadius: 0 },
          { label: t('gdp.now'), data: [{ x: latest, y: impliedNow }], backgroundColor: C.green, pointRadius: 6, pointStyle: 'rectRot' },
        ],
        xFmt: (v) => num(v, Math.min(d, 1)), yFmt: (v) => `${v}%`,
        tooltip: { callbacks: { label: (c) => ` ${c.raw.d ? period(c.raw.d, 'Q') + ': ' : ''}x ${fmtV(c.raw.x)} → GDP ${signed(c.raw.y, 1)} %` } },
        plugins: [zeroLine()],
      }));
    },

    cycles() {
      const latestMonth = labels[labels.length - 1];
      panel('cycles').innerHTML = cyclesSection(cfg, recessions, latestMonth);
    },

    table() {
      const p = panel('table');
      const baseMap = data.base ? new Map(data.base) : null;
      const baseKeys = data.base ? data.base.map((x) => x[0]) : [];
      const baseIdx = new Map(baseKeys.map((k, i) => [k, i]));
      const bd = ind.base?.decimals ?? 0;
      const rows = [...series].map((pt, i) => ({ pt, i })).reverse();
      const baseChange = (l) => {
        const j = baseIdx.get(l);
        return j > 0 ? data.base[j][1] - data.base[j - 1][1] : null;
      };
      p.innerHTML = `
        <div class="toolbar"><button class="btn primary" id="csv">${t('tbl.csv')}</button><span class="fine">${t('tbl.rows', { n: series.length })}</span></div>
        <div class="table-wrap table-scroll"><table>
          <thead><tr>
            <th>${t('tbl.period')}</th><th>${esc(L(ind.short))}</th><th>Δ</th>
            ${baseMap ? `<th>${esc(L(ind.base.unit))}</th>${ind.base.showChange ? `<th>Δ ${esc(L(ind.base.unit))}</th>` : ''}` : ''}
            <th>${t('tbl.zone')}</th><th>${t('c.avg')}</th>${reg ? '<th>Impl. ^GDP %</th>' : ''}
          </tr></thead>
          <tbody>${rows.map(({ pt: [l, v], i }) => {
            const c = chg[i];
            const bc = baseMap && ind.base.showChange ? baseChange(l) : null;
            return `<tr><td>${fmtP(l)}</td><td class="num">${fmtV(v)}</td><td class="num ${c === null ? '' : c >= 0 ? 'pos' : 'neg'}">${c === null ? '—' : signed(c, d)}</td>
              ${baseMap ? `<td class="num muted">${baseMap.has(l) ? num(baseMap.get(l), bd) : '—'}</td>${ind.base.showChange ? `<td class="num ${bc === null ? '' : bc >= 0 ? 'pos' : 'neg'}">${bc === null ? '—' : signed(bc, bd)}</td>` : ''}` : ''}
              <td class="${zoneCls(v)}">${esc(zoneOf(v))}</td><td class="num muted">${roll[i] === null ? '—' : fmtV(roll[i])}</td>
              ${reg ? `<td class="num">${signed(A.implied(reg, v), 1)}</td>` : ''}</tr>`;
          }).join('')}</tbody>
        </table></div>`;
      p.querySelector('#csv').addEventListener('click', () => {
        const head = ['period', ind.id, 'change', ...(baseMap ? ['base'] : []), 'zone', 'rolling_avg', ...(reg ? ['implied_gdp'] : [])];
        const lines = series.map(([l, v], i) => [l, v, chg[i] ?? '', ...(baseMap ? [baseMap.get(l) ?? ''] : []), isAbove(v) ? 'above' : 'below', roll[i] ?? '', ...(reg ? [A.implied(reg, v).toFixed(2)] : [])].join(','));
        const src = `# ${L(ind.name)} – ${ind.sources.map((s) => s.name).join('; ')} – via FreemanMacroScope\n`;
        const blob = new Blob([src + head.join(',') + '\n' + lines.join('\n')], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${country}_${ind.id}.csv`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      });
    },

    info() {
      const p = panel('info');
      const dirText = ind.direction > 0 ? t('info.dirPos') : ind.direction < 0 ? t('info.dirNeg') : t('info.dirNone');
      p.innerHTML = `
        <div class="charts-grid">
          <div class="chart-card">
            <div class="chart-title">${t('ind.whatIs')}</div>
            <p class="prose">${esc(L(ind.description))}</p>
            <div class="chart-title">${t('ind.reading')}</div>
            <p class="prose">${esc(L(ind.interpretation))}</p>
            ${ind.replaces ? `<div class="chart-title">${t('ind.note')}</div><p class="prose">${esc(L(ind.replaces))}</p>` : ''}
          </div>
          <div class="chart-card">
            <div class="chart-title">${t('info.facts')}</div>
            <table class="stat-table"><tbody>
              <tr><td>${t('info.unit')}</td><td>${esc(unit)}</td></tr>
              <tr><td>${t('info.freq')}</td><td>${t('freq.' + f)}</td></tr>
              <tr><td>${t('info.transform')}</td><td>${ind.transform === 'yoy' ? t('info.yoy') : t('info.level')}</td></tr>
              <tr><td>${t('info.range')}</td><td>${fmtP(labels[0])} – ${fmtP(labels[labels.length - 1])} (${series.length})</td></tr>
              <tr><td>${t('ind.threshold')}</td><td>${fmtV(thr)}${typeof ind.threshold === 'string' ? ` (${t('thr.' + ind.threshold)})` : ''}</td></tr>
              <tr><td>${t('info.direction')}</td><td>${dirText}</td></tr>
              <tr><td>${t('info.fetched')}</td><td>${dateTime(index.fetchedAt)}</td></tr>
              <tr><td>${t('info.license')}</td><td>${t('lic.' + (ind.license || 'public'))}</td></tr>
            </tbody></table>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">${t('info.sources')}</div>
          <ul class="src-list">${ind.sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`).join('')}</ul>
          <div class="chart-title">${t('info.rawSeries')}</div>
          <ul class="src-list">${data.inputs.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">FRED: ${esc(s.fred)}</a> <span class="muted">${s.first} – ${s.last}</span></li>`).join('')}</ul>
          <p class="source-note">${t('info.fredNote')} <a href="#/methodik">${t('nav.method')} →</a></p>
        </div>`;
    },
  };

  function show(k) {
    active = k;
    el.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === k));
    el.querySelectorAll('.content').forEach((s) => s.classList.toggle('active', s.id === `tab-${k}`));
    if (!built.has(k)) { built.add(k); builders[k](); }
    const target = `#/${country}/${id}${k === 'overview' ? '' : '/' + k}`;
    if (location.hash !== target) history.replaceState(null, '', target);
  }
  el.querySelector('.tabs').addEventListener('click', (e) => {
    const b = e.target.closest('.tab');
    if (b) show(b.dataset.tab);
  });
  show(active);
  document.title = `${L(ind.short)} · ${L(cfg.name)} · FreemanMacroScope`;
  return () => charts.destroy();
}

// Round levels across the 5–95 % range of the history, like the Excel scorecard rows.
function scorecardSteps(vals, decimals) {
  const lo = A.quantile(vals, 0.05), hi = A.quantile(vals, 0.95);
  const step = A.niceStep(hi - lo, 12);
  const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9 && out.length < 16; v += step) out.push(+v.toFixed(Math.max(decimals, 4)));
  return out;
}
