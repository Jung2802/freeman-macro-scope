import { loadAll, categoryOf } from '../data.js';
import { cycles, lastYears, values, SCORE_MAX, sum } from '../analysis.js';
import { sparkline, zoneColors, C } from '../charts.js';
import { t, L } from '../i18n.js';
import { num, signed, period, dateTime, esc } from '../format.js';
import { adSlot, fillAds } from '../ads.js';

export const scoreClass = (s) => (s === null || s === undefined ? 'na' : s > 0 ? 'pos' : s < 0 ? 'neg' : 'zero');
export const scoreChip = (s, title = '') =>
  `<span class="sc ${scoreClass(s)}" title="${esc(title)}">${s === null || s === undefined ? '–' : signed(s, 0)}</span>`;

export function trendWord(tr) {
  return tr > 0 ? t('trend.up') : tr < 0 ? t('trend.down') : t('trend.flat');
}
export const trendArrow = (tr) => (tr > 0 ? '▲' : tr < 0 ? '▼' : '▶');

export function zoneLabel(ind, sc) {
  return L(sc.above ? ind.zones.above : ind.zones.below);
}

// Diverging bar: value in [-max, max] → filled half-bar.
function divBar(v, max) {
  const p = max ? Math.min(1, Math.abs(v) / max) * 50 : 0;
  const side = v >= 0 ? `left:50%;width:${p}%` : `left:${50 - p}%;width:${p}%`;
  return `<div class="divbar"><div class="divbar-mid"></div><div class="divbar-fill ${scoreClass(v)}" style="${side}"></div></div>`;
}

function gauge(v, max) {
  const pos = max ? ((v + max) / (2 * max)) * 100 : 50;
  return `<div class="gauge">
    <div class="gauge-track"></div>
    <div class="gauge-marker" style="left:${pos}%"><span>${signed(v, 0)}</span></div>
    <div class="gauge-scale"><span>−${max}</span><span>0</span><span>+${max}</span></div>
  </div>`;
}

// Business cycles (Excel sheet "Cycles"), shared with the GDP indicator page.
export function cyclesSection(cfg, recessions, latestMonth) {
  const cyc = cycles(recessions, '1948');
  if (!cyc.rows.length) return '';
  const lastRec = recessions[recessions.length - 1];
  const currentExp = lastRec?.[1] && latestMonth
    ? (+latestMonth.slice(0, 4) * 12 + +latestMonth.slice(5, 7)) - (+lastRec[1].slice(0, 4) * 12 + +lastRec[1].slice(5, 7))
    : null;
  return `<section class="chart-card">
    <div class="chart-title"><span class="dot" style="background:${C.text2}"></span>${t('cyc.title')}</div>
    <div class="metrics">
      <div class="metric-card"><div class="metric-label">${t('cyc.count')}</div><div class="metric-value">${cyc.rows.length}</div><div class="metric-sub">${t('cyc.since', { y: 1948 })}</div></div>
      <div class="metric-card"><div class="metric-label">${t('cyc.avgRec')}</div><div class="metric-value">${num(cyc.avgRecession, 1)}</div><div class="metric-sub">${t('cyc.months')}</div></div>
      <div class="metric-card"><div class="metric-label">${t('cyc.avgExp')}</div><div class="metric-value">${num(cyc.avgExpansion, 0)}</div><div class="metric-sub">${t('cyc.months')}</div></div>
      ${currentExp !== null ? `<div class="metric-card"><div class="metric-label">${t('cyc.current')}</div><div class="metric-value">${currentExp}</div><div class="metric-sub">${t('cyc.sinceEnd', { d: period(lastRec[1], 'M') })}</div></div>` : ''}
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>${t('cyc.start')}</th><th>${t('cyc.end')}</th><th>${t('cyc.length')}</th><th>${t('cyc.expBefore')}</th></tr></thead>
      <tbody>${[...cyc.rows].reverse().map((r) => `<tr><td>${period(r.start, 'M')}</td><td>${r.end ? period(r.end, 'M') : t('cyc.ongoing')}</td><td class="num">${r.months ?? '—'}</td><td class="num muted">${r.expansionBefore ?? '—'}</td></tr>`).join('')}</tbody>
    </table></div>
    <p class="source-note">${t('cyc.note')} · ${t('common.source')}: <a href="${esc(cfg.recession.source.url)}" target="_blank" rel="noopener">${esc(cfg.recession.source.name)}</a></p>
  </section>`;
}

export async function renderOverview(el, { country }) {
  const { cfg, index, recessions, items } = await loadAll(country);
  const ok = items.filter((x) => x.data);
  const scored = ok.filter((x) => x.sc.total !== null);
  const max = scored.length * SCORE_MAX;
  const total = sum(scored.map((x) => x.sc.total));
  const totShort = sum(scored.map((x) => x.sc.short));
  const totLong = sum(scored.map((x) => x.sc.long));
  const nPos = scored.filter((x) => x.sc.total > 0).length;
  const nNeg = scored.filter((x) => x.sc.total < 0).length;
  const group = cfg.groups[0];

  const latestMonth = ok.filter((x) => x.ind.frequency === 'M').map((x) => x.data.last).sort().pop()?.slice(0, 7);

  const catBlocks = cfg.categories.map((cat) => {
    const its = ok.filter((x) => x.ind.category === cat.id);
    if (!its.length) return '';
    const sc = its.filter((x) => x.sc.total !== null);
    const catScore = sum(sc.map((x) => x.sc.total));
    return `<section class="cat-section" data-cat="${cat.id}" style="--cat:${cat.color}">
      <div class="cat-head">
        <h2><span class="dot" style="background:${cat.color}"></span>${esc(L(cat.name))}</h2>
        ${sc.length ? `<span class="cat-score" title="${esc(t('ov.catScoreHint'))}">${t('ov.score')} ${scoreChip(catScore)} <small>/ ±${sc.length * SCORE_MAX}</small></span>` : ''}
      </div>
      <div class="card-grid">
        ${its.map(({ ind, data, sc: s }) => {
          const vals = values(data.values);
          const prev = vals[vals.length - 2];
          return `<a class="ind-card" href="#/${country}/${ind.id}" data-search="${esc((L(ind.name) + ' ' + ind.code + ' ' + L(ind.short)).toLowerCase())}">
            <div class="ind-top">
              <span class="ind-code">${esc(ind.code)}</span>
              <span class="zone-chip ${s.above ? 'above' : 'below'}" style="--zc:${s.above ? zoneColors(ind, cat).above : zoneColors(ind, cat).below}">${esc(zoneLabel(ind, s))}</span>
            </div>
            <div class="ind-name">${esc(L(ind.short))}</div>
            <div class="ind-val">${num(s.latest, ind.decimals)}<span class="unit">${esc(L(ind.unit))}</span></div>
            <div class="ind-sub">${period(data.last.slice(0, 7), ind.frequency)}${data.partialLast ? ` <span class="badge-mini" title="${esc(t('ind.partialHint'))}">${t('ind.partial')}</span>` : ''} · Δ ${signed(s.latest - prev, ind.decimals)} · ${trendArrow(s.trend)} ${esc(trendWord(s.trend))}</div>
            <canvas class="spark" data-id="${ind.id}"></canvas>
            <div class="ind-scores">
              ${s.total === null ? `<span class="muted">${t('ov.unscored')}</span>` : `
              <span>${t('score.short')} ${scoreChip(s.short)}</span>
              <span>${t('score.long')} ${scoreChip(s.long)}</span>
              <span class="ind-total">${t('score.total')} ${scoreChip(s.total)}</span>`}
            </div>
          </a>`;
        }).join('')}
      </div>
    </section>`;
  }).filter(Boolean);
  // One ad placement after the first three categories.
  const catHtml = [...catBlocks.slice(0, 3), adSlot('overview'), ...catBlocks.slice(3)].join('');

  const catBars = cfg.categories.map((cat) => {
    const sc = ok.filter((x) => x.ind.category === cat.id && x.sc.total !== null);
    if (!sc.length) return '';
    const v = sum(sc.map((x) => x.sc.total));
    return `<div class="catbar-row">
      <span class="catbar-name"><span class="dot" style="background:${cat.color}"></span>${esc(L(cat.name))}</span>
      ${divBar(v, sc.length * SCORE_MAX)}
      <span class="catbar-val">${scoreChip(v)}<small>/ ±${sc.length * SCORE_MAX}</small></span>
    </div>`;
  }).join('');

  const tableRows = cfg.categories.flatMap((cat) => ok.filter((x) => x.ind.category === cat.id).map(({ ind, data, sc: s }, k, arr) => {
    const vals = values(data.values);
    return `<tr data-href="#/${country}/${ind.id}">
      ${k === 0 ? `<td class="cat-cell" rowspan="${arr.length}" style="--cat:${cat.color}">${esc(L(cat.name))}</td>` : ''}
      <td><a href="#/${country}/${ind.id}">${esc(L(ind.short))}</a></td>
      <td class="mono muted">${esc(ind.code)}</td>
      <td class="num">${num(s.latest, ind.decimals)}</td>
      <td class="num ${scoreClass(s.latest - vals[vals.length - 2])}">${signed(s.latest - vals[vals.length - 2], ind.decimals)}</td>
      <td class="muted">${period(data.last.slice(0, 7), ind.frequency)}</td>
      <td class="num">${scoreChip(s.short)}</td>
      <td class="num">${scoreChip(s.long)}</td>
      <td class="num">${scoreChip(s.total)}</td>
      <td>${esc(zoneLabel(ind, s))} · ${trendArrow(s.trend)} ${esc(trendWord(s.trend))}</td>
      <td class="src">${ind.sources.map((src) => `<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.name.split(' – ')[0])}</a>`).join('<br>')}</td>
    </tr>`;
  })).join('');

  el.innerHTML = `
  <section class="hero">
    <div>
      <h1>${t('ov.title', { country: L(cfg.name) })}</h1>
      <p class="hero-sub">${t('ov.subtitle')}</p>
      <p class="group-note"><span class="group-tag">${esc(L(group.name))}</span> ${esc(L(group.description))}</p>
    </div>
    <div class="hero-meta">
      <div>${t('ov.dataAsOf')} <strong>${dateTime(index.fetchedAt)}</strong></div>
      <div class="muted">${t('ov.autoUpdate')}</div>
    </div>
  </section>

  <section class="score-panel">
    <div class="score-main">
      <div class="metric-label">${t('ov.totalScore')}</div>
      ${gauge(total, max)}
      <p class="score-text">${t('ov.scoreSentence', { pos: nPos, neg: nNeg, n: scored.length })}</p>
      <div class="score-split">
        <div><div class="metric-label">${t('score.shortLong')}</div><div class="metric-value">${signed(totShort, 0)}</div><div class="metric-sub">${t('ov.shortHint')}</div></div>
        <div><div class="metric-label">${t('score.longLong')}</div><div class="metric-value">${signed(totLong, 0)}</div><div class="metric-sub">${t('ov.longHint')}</div></div>
        <div><div class="metric-label">${t('ov.indicators')}</div><div class="metric-value">${ok.length}</div><div class="metric-sub">${t('ov.scoredOf', { n: scored.length })}</div></div>
      </div>
      <p class="fine">${t('ov.scoreLegend')} <a href="#/methodik">${t('nav.method')} →</a></p>
    </div>
    <div class="score-cats">
      <div class="metric-label">${t('ov.byCategory')}</div>
      ${catBars}
    </div>
  </section>

  <div class="toolbar">
    <input type="search" id="ind-filter" placeholder="${esc(t('ov.filter'))}" aria-label="${esc(t('ov.filter'))}">
    <a class="btn" href="#/${country}/compare">${t('nav.compare')} →</a>
  </div>

  ${catHtml}

  <section class="chart-card">
    <div class="chart-title"><span class="dot" style="background:${C.purple}"></span>${t('ov.scoreTable')}</div>
    <div class="table-wrap">
      <table class="score-table">
        <thead><tr>
          <th>${t('tbl.category')}</th><th>${t('tbl.indicator')}</th><th>${t('tbl.code')}</th><th>${t('tbl.value')}</th><th>Δ</th><th>${t('tbl.period')}</th>
          <th title="${esc(t('ov.shortHint'))}">${t('score.short')}</th><th title="${esc(t('ov.longHint'))}">${t('score.long')}</th><th>${t('score.total')}</th><th>${t('tbl.state')}</th><th>${t('tbl.source')}</th>
        </tr></thead>
        <tbody>${tableRows}</tbody>
        <tfoot><tr><td colspan="6">${t('ov.sum')}</td><td class="num">${scoreChip(totShort)}</td><td class="num">${scoreChip(totLong)}</td><td class="num">${scoreChip(total)}</td><td colspan="2" class="muted">${t('ov.scale', { max })}</td></tr></tfoot>
      </table>
    </div>
  </section>

  ${cyclesSection(cfg, recessions, latestMonth)}`;

  // Sparklines: last 10 years
  el.querySelectorAll('canvas.spark').forEach((cv) => {
    const it = ok.find((x) => x.ind.id === cv.dataset.id);
    const vals = values(lastYears(it.data.values, it.ind.frequency, it.ind.frequency === 'A' ? 30 : 10));
    sparkline(cv, vals, { color: categoryOf(cfg, it.ind)?.color || C.purple, thr: it.sc.thr });
  });

  const filter = el.querySelector('#ind-filter');
  filter.addEventListener('input', () => {
    const q = filter.value.trim().toLowerCase();
    el.querySelectorAll('.ind-card').forEach((c) => { c.hidden = q && !c.dataset.search.includes(q); });
    el.querySelectorAll('.cat-section').forEach((s) => { s.hidden = ![...s.querySelectorAll('.ind-card')].some((c) => !c.hidden); });
  });
  el.querySelectorAll('tr[data-href]').forEach((tr) => tr.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    location.hash = tr.dataset.href;
  }));
  fillAds(el);
  return () => {};
}
