// Country radar: every endogenous dashboard side by side.
import { loadAll, loadCountries } from '../data.js';
import { values, lastYears, sum, quantile, SCORE_MAX } from '../analysis.js';
import { lineChart, sparkline, ChartSet, zeroLine, C, rgba } from '../charts.js';
import { t, L } from '../i18n.js';
import { num, signed, period, esc } from '../format.js';
import { countUp } from '../cosmos.js';
import { marketBoard, startMarketBoard } from '../market-board.js';

// One concept → the indicator id that carries it in each config (first match wins).
const KEYS = [
  { k: 'gdp', ids: ['gdp'], dec: 1 },
  { k: 'unemp', ids: ['unemp', 'unrate'], dec: 1 },
  { k: 'infl', ids: ['hicp', 'cpi', 'wb_cpi'], dec: 1 },
  { k: 'policy', ids: ['policy', 'fedfunds'], dec: 2 },
  { k: 't10', ids: ['t10'], dec: 2 },
  { k: 'curve', ids: ['curve'], dec: 2 },
  { k: 'hp', ids: ['hp', 'hpi'], dec: 1 },
  { k: 'retail', ids: ['retail'], dec: 1 },
  { k: 'credit', ids: ['credit', 'credit_gdp'], dec: 0 },
  { k: 'debt', ids: ['debt', 'debt_gdp'], dec: 0 },
  { k: 'jobs', ids: ['indeed'], dec: 0 },
];
const CHART_KEYS = ['gdp', 'unemp', 'infl', 'policy', 't10', 'curve', 'hp', 'credit'];
// Lines in the comparison chart: one muted hue per country of the selected group (at most ~12 at once).
const PALETTE = ['#ececec', '#a3c4e8', '#c4a47c', '#8fcfb2', '#b8a6e0', '#d9928f', '#e2c08d', '#6f8fb8', '#d8c27a', '#9fb7a0', '#c99fc1', '#7fb6c9', '#b9b0a2'];
// Groups for the chart and the key-figure table; the ranking and the heat map always show every country.
const GROUPS = {
  major: (c) => ['us', 'gb', 'de', 'fr', 'it', 'jp', 'ca', 'au'].includes(c.id),
  euro: (c) => c.currency === 'EUR',
  europe: (c) => c.continent === 'europe' && c.currency !== 'EUR',
  americas: (c) => c.continent === 'north-america' || c.continent === 'south-america',
  apac: (c) => ['asia', 'oceania', 'africa'].includes(c.continent),
};

const pctOf = (items) => {
  const sc = items.filter((x) => x.sc && x.sc.total !== null);
  if (!sc.length) return null;
  return {
    total: (sum(sc.map((x) => x.sc.total)) / (sc.length * SCORE_MAX)) * 100,
    short: (sum(sc.map((x) => x.sc.short)) / (sc.length * SCORE_MAX)) * 100,
    long: (sum(sc.map((x) => x.sc.long)) / (sc.length * SCORE_MAX)) * 100,
    n: sc.length,
  };
};

function bar(v, scale) {
  const p = Math.min(1, Math.abs(v) / scale) * 50;
  const side = v >= 0 ? `left:50%;--w:${p}%` : `right:50%;--w:${p}%`;
  return `<div class="divbar wide"><div class="divbar-mid"></div><div class="divbar-fill grow ${v > 0 ? 'pos' : v < 0 ? 'neg' : ''}" style="${side}"></div></div>`;
}

const heatBg = (v) => (v === null ? 'transparent' : rgba(v >= 0 ? C.sky : C.amber, Math.min(0.55, 0.06 + Math.abs(v) / 140)));

export async function renderWorld(el) {
  const list = (await loadCountries()).filter((c) => (c.selector?.length ? c.selector : [{ group: 'endogenous' }]).some((s) => s.group === 'endogenous'));
  const all = (await Promise.all(list.map((c) => loadAll(c.id).then((d) => ({ id: c.id, ...d })).catch(() => null)))).filter(Boolean);
  const rows = all.map((d) => {
    const ok = d.items.filter((x) => x.data);
    const cats = Object.fromEntries(d.cfg.categories.map((cat) => [cat.id, pctOf(ok.filter((x) => x.ind.category === cat.id))]));
    const pick = (ids) => ids.map((id) => ok.find((x) => x.ind.id === id)).find(Boolean) || null;
    return { id: d.id, cfg: d.cfg, ok, score: pctOf(ok), cats, key: Object.fromEntries(KEYS.map((k) => [k.k, pick(k.ids)])) };
  });
  const ranked = [...rows].filter((r) => r.score).sort((a, b) => b.score.total - a.score.total);
  const catDefs = [...new Map(rows.flatMap((r) => r.cfg.categories.map((c) => [c.id, c]))).values()];
  const nInd = sum(rows.map((r) => r.ok.length));
  const avg = ranked.length ? sum(ranked.map((r) => r.score.total)) / ranked.length : 0;
  const leader = ranked[0], laggard = ranked[ranked.length - 1];
  // Bars use the widest country as full length (at least ±20 %) so differences stay visible.
  const barScale = Math.max(20, ...ranked.map((r) => Math.abs(r.score.total)));

  const code = (r) => `<span class="cc">${esc(r.id.toUpperCase())}</span>`;
  let group = 'major';
  const inGroup = () => ranked.filter((r) => GROUPS[group](r.cfg));
  const groupBtns = (id) => `<div class="range-btns" id="${id}">${Object.keys(GROUPS).map((g) => `<button class="range-btn${g === group ? ' active' : ''}" data-g="${g}">${t('world.g.' + g)}</button>`).join('')}</div>`;
  const keyCell = (r, k) => {
    const it = r.key[k.k];
    if (!it) return '<td class="num muted">—</td>';
    const v = values(it.data.values).at(-1);
    return `<td class="num"><a class="kv" href="#/${r.id}/${it.ind.id}" title="${esc(L(it.ind.name))}">${num(v, k.dec)}</a>
      <canvas class="spark mini" data-c="${r.id}" data-k="${k.k}"></canvas>
      <small>${period(it.data.last.slice(0, 7), it.ind.frequency)}</small></td>`;
  };

  el.innerHTML = `
  <section class="hero hero-world">
    <div class="hero-copy">
      <p class="eyebrow">${t('world.eyebrow')}</p>
      <h1>${t('world.title', { n: rows.length })}<br><span class="h1-line">${t('world.titleLine')}</span></h1>
      <p class="hero-sub">${t('world.intro')}</p>
      ${marketBoard()}
    </div>
  </section>

  <section class="feature-row world-stats">
    <div class="feature reveal">
      <h2>${t('world.count')}</h2>
      <div class="feature-value" data-count="${rows.length}" data-dec="0">${rows.length}</div>
      <p>${t('world.indicators', { n: nInd })}</p>
    </div>
    <div class="feature reveal">
      <h2>${t('world.leader')}</h2>
      <div class="feature-value">${leader ? `${esc(L(leader.cfg.name))}` : '—'}</div>
      <p>${leader ? `${signed(leader.score.total, 0)} % · ${t('world.avg')}: ${signed(avg, 0)} %` : ''}</p>
    </div>
    <div class="feature reveal">
      <h2>${t('world.laggard')}</h2>
      <div class="feature-value">${laggard ? `${esc(L(laggard.cfg.name))}` : '—'}</div>
      <p>${laggard ? `${signed(laggard.score.total, 0)} %` : ''}</p>
    </div>
  </section>

  <section class="chart-card glass reveal">
    <div class="chart-title"><span class="dot" style="background:${C.purple}"></span>${t('world.ranking')}</div>
    <p class="fine">${t('world.rankingHint')}</p>
    <div class="rank-list">
      ${ranked.map((r, i) => `<a class="rank-row" href="#/${r.id}" style="--i:${i}">
        <span class="rank-pos">${i + 1}</span>
        <span class="rank-name">${code(r)}${esc(L(r.cfg.name))}</span>
        ${bar(r.score.total, barScale)}
        <span class="rank-val ${r.score.total >= 0 ? 'pos' : 'neg'}" data-count="${r.score.total.toFixed(1)}" data-dec="0" data-signed="1" data-suffix=" %">${signed(r.score.total, 0)} %</span>
        <span class="rank-sub muted">${t('score.short')} ${signed(r.score.short, 0)} · ${t('score.long')} ${signed(r.score.long, 0)} · ${t('world.indicators', { n: r.score.n })}</span>
      </a>`).join('')}
    </div>
  </section>

  <section class="chart-card glass reveal">
    <div class="chart-title"><span class="dot" style="background:${C.sky}"></span>${t('world.heat')}</div>
    <p class="fine">${t('world.heatHint')}</p>
    <div class="table-wrap"><table class="heat-table">
      <thead><tr><th>${t('world.country')}</th>${catDefs.map((c) => `<th>${esc(L(c.name))}</th>`).join('')}<th>${t('world.scoreShort')}</th></tr></thead>
      <tbody>${ranked.map((r) => `<tr data-href="#/${r.id}">
        <td class="heat-name">${code(r)}${esc(L(r.cfg.name))}</td>
        ${catDefs.map((c) => { const v = r.cats[c.id]?.total ?? null; return `<td class="heat-cell" style="background:${heatBg(v)}">${v === null ? '<span class="muted">·</span>' : signed(v, 0)}</td>`; }).join('')}
        <td class="heat-cell strong" style="background:${heatBg(r.score.total)}">${signed(r.score.total, 0)}</td>
      </tr>`).join('')}</tbody>
    </table></div>
  </section>

  <section class="chart-card glass reveal">
    <div class="chart-title"><span class="dot" style="background:${C.gold}"></span>${t('world.chart')}
      <div class="range-btns" id="w-keys">${CHART_KEYS.map((k, i) => `<button class="range-btn${i === 0 ? ' active' : ''}" data-k="${k}">${t('world.k.' + k)}</button>`).join('')}</div>
    </div>
    ${groupBtns('w-groups')}
    <div class="range-btns" id="w-years">${[5, 10, 20].map((n) => `<button class="range-btn${n === 10 ? ' active' : ''}" data-n="${n}">${t('world.years', { n })}</button>`).join('')}</div>
    <div class="chart-box h-lg"><canvas id="w-chart"></canvas></div>
  </section>

  <section class="chart-card glass reveal">
    <div class="chart-title"><span class="dot" style="background:${C.green}"></span>${t('world.key')}</div>
    <p class="fine">${t('world.keyHint')} ${t('world.note.us')}</p>
    ${groupBtns('w-groups2')}
    <div class="table-wrap" id="w-key"></div>
  </section>`;

  const drawKeys = () => {
    const list = inGroup();
    el.querySelector('#w-key').innerHTML = `<table class="key-table">
      <thead><tr><th></th>${list.map((r) => `<th class="num" title="${esc(L(r.cfg.name))}">${code(r)}</th>`).join('')}</tr></thead>
      <tbody>${KEYS.map((k) => `<tr><td class="key-name">${t('world.k.' + k.k)}</td>${list.map((r) => keyCell(r, k)).join('')}</tr>`).join('')}</tbody>
    </table>`;
    el.querySelectorAll('#w-key canvas.spark.mini').forEach((cv) => {
      const r = rows.find((x) => x.id === cv.dataset.c);
      const it = r?.key[cv.dataset.k];
      if (!it) return;
      sparkline(cv, values(lastYears(it.data.values, it.ind.frequency, it.ind.frequency === 'A' ? 15 : 5)), { color: C.text2 });
    });
  };
  el.querySelectorAll('tr[data-href]').forEach((tr) => tr.addEventListener('click', () => { location.hash = tr.dataset.href; }));

  const charts = new ChartSet();
  let curKey = CHART_KEYS[0], years = 10;
  const draw = () => {
    charts.destroy();
    const k = KEYS.find((x) => x.k === curKey);
    // Annual readings sit mid-year so they line up with monthly and quarterly ones.
    const norm = (l) => (l.length === 4 ? `${l}-07` : l);
    const cutoff = `${new Date().getFullYear() - years}`;
    const series = inGroup().map((r) => ({ r, it: r.key[curKey] })).filter((x) => x.it);
    const lbls = [...new Set(series.flatMap(({ it }) => it.data.values.map((p) => norm(p[0])).filter((l) => l >= cutoff)))].sort();
    const datasets = series.map(({ r, it }, i) => {
      const m = new Map(it.data.values.map((p) => [norm(p[0]), p[1]]));
      return { label: L(r.cfg.name), data: lbls.map((l) => m.get(l) ?? null), borderColor: PALETTE[i % PALETTE.length], borderWidth: i === 0 ? 2 : 1.5, spanGaps: true, pointRadius: 0 };
    });
    // Pandemic quarters (GDP ±30–90 % annualised) would flatten everything else: clip the axis to
    // the bulk of the data when single readings sit far outside it.
    const all = datasets.flatMap((d) => d.data).filter((v) => v !== null);
    const lo = quantile(all, 0.05), hi = quantile(all, 0.95), span = (hi - lo) || 1;
    const clip = all.length && (Math.min(...all) < lo - span || Math.max(...all) > hi + span);
    charts.add(lineChart(el.querySelector('#w-chart'), {
      labels: lbls, datasets, legend: true,
      ...(clip ? { yMin: Math.floor(lo - span * 0.3), yMax: Math.ceil(hi + span * 0.3) } : {}), xFmt: (l) => period(l, 'M'), yFmt: (v) => num(v, k.dec),
      tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.raw === null ? '—' : num(c.raw, k.dec)}` }, displayColors: true },
      plugins: [zeroLine()],
    }));
  };
  el.querySelector('#w-keys').addEventListener('click', (e) => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    curKey = b.dataset.k;
    el.querySelectorAll('#w-keys .range-btn').forEach((x) => x.classList.toggle('active', x === b));
    draw();
  });
  el.querySelector('#w-years').addEventListener('click', (e) => {
    const b = e.target.closest('[data-n]'); if (!b) return;
    years = +b.dataset.n;
    el.querySelectorAll('#w-years .range-btn').forEach((x) => x.classList.toggle('active', x === b));
    draw();
  });
  const setGroup = (e) => {
    const b = e.target.closest('[data-g]'); if (!b) return;
    group = b.dataset.g;
    el.querySelectorAll('[data-g]').forEach((x) => x.classList.toggle('active', x.dataset.g === group));
    draw(); drawKeys();
  };
  el.querySelector('#w-groups').addEventListener('click', setGroup);
  el.querySelector('#w-groups2').addEventListener('click', setGroup);
  draw(); drawKeys();
  countUp(el);
  document.title = `${t('nav.world')} · FreemanMacroScope`;
  const stopBoard = startMarketBoard(el);
  return () => { charts.destroy(); stopBoard(); };
}
