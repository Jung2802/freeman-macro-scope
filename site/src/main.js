import { t, L, getLang, setLang, LANGS } from './i18n.js';
import { loadCountries } from './data.js';
import { esc } from './format.js';
import { SITE } from './site-config.js';
import { adSlot, fillAds } from './ads.js';
import { renderOverview } from './views/overview.js';
import { renderIndicator } from './views/indicator.js';
import { renderCompare } from './views/compare.js';
import { renderPage } from './views/pages.js';

const app = document.getElementById('app');
const PAGES = new Set(['methodik', 'quellen', 'impressum', 'datenschutz', 'disclaimer', 'pro']);
let cleanup = () => {};
let countries = [{ id: SITE.defaultCountry, name: { de: 'USA', en: 'United States' } }];
let country = SITE.defaultCountry;
let land = (() => { try { return localStorage.getItem('fms.land'); } catch { return null; } })();
const saveLand = () => { try { localStorage.setItem('fms.land', land); } catch { /* private mode */ } };

// Routes: #/  #/us  #/us/<indicator>[/<tab>]  #/us/compare?a=..&b=..  #/<page>
function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  const params = new URLSearchParams(query);
  if (!parts.length) return { view: 'overview', country };
  if (PAGES.has(parts[0])) return { view: 'page', name: parts[0], country };
  const c = countries.some((x) => x.id === parts[0]) ? parts[0] : null;
  if (!c) return { view: 'page', name: '404', country };
  if (!parts[1]) return { view: 'overview', country: c };
  if (parts[1] === 'compare') return { view: 'compare', country: c, params };
  return { view: 'indicator', country: c, id: parts[1], tab: parts[2] };
}

// Every dataset lists where it appears in the selector: land → group → (exogenous only) comparison currency.
const entries = () => countries.flatMap((c) => (c.selector?.length ? c.selector : [{ land: c.id, landName: c.name, group: 'endogenous' }]).map((s) => ({ ...s, id: c.id })));
const GROUPS = ['endogenous', 'exogenous'];

function currentEntry() {
  const all = entries();
  return all.find((e) => e.id === country && e.land === land) || all.find((e) => e.id === country) || all[0];
}

function pick({ land: l, group: g, vs }) {
  const all = entries().filter((e) => e.land === l);
  return all.find((e) => e.group === g && (!vs || e.vs === vs)) || all.find((e) => e.group === g) || all[0];
}

function selectors() {
  const cur = currentEntry();
  if (!cur) return '';
  const all = entries();
  const lands = [...new Map(all.map((e) => [e.land, e.landName])).entries()];
  const groupsHere = new Set(all.filter((e) => e.land === cur.land).map((e) => e.group));
  const vsHere = all.filter((e) => e.land === cur.land && e.group === 'exogenous');
  const opt = (v, label, sel, dis) => `<option value="${esc(v)}"${sel ? ' selected' : ''}${dis ? ' disabled' : ''}>${esc(label)}</option>`;
  return `
    <label class="sr-only" for="land-sel">${t('nav.country')}</label>
    <select id="land-sel" title="${esc(t('nav.country'))}">${lands.map(([id, n]) => opt(id, L(n), id === cur.land)).join('')}</select>
    <label class="sr-only" for="group-sel">${t('nav.group')}</label>
    <select id="group-sel" title="${esc(t('nav.group'))}">${GROUPS.map((g) => opt(g, t('group.' + g) + (groupsHere.has(g) ? '' : ` (${t('nav.soon')})`), g === cur.group, !groupsHere.has(g))).join('')}</select>
    ${cur.group === 'exogenous' ? `<label class="sr-only" for="vs-sel">${t('nav.vs')}</label>
    <select id="vs-sel" title="${esc(t('nav.vs'))}">${vsHere.map((e) => opt(e.vs, `${t('nav.vsShort')} ${e.vs}`, e.vs === cur.vs)).join('')}</select>` : ''}`;
}

function header() {
  const r = parseRoute();
  const nav = [
    [`#/${country}`, t('nav.overview'), r.view === 'overview' || r.view === 'indicator'],
    [`#/${country}/compare`, t('nav.compare'), r.view === 'compare'],
    ['#/methodik', t('nav.method'), r.name === 'methodik'],
    ['#/quellen', t('nav.sources'), r.name === 'quellen'],
  ];
  document.getElementById('topbar').innerHTML = `
    <a class="brand" href="#/${country}" aria-label="${SITE.name}">
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><rect width="32" height="32" rx="7" fill="#131820"/><circle cx="16" cy="16" r="9.5" fill="none" stroke="#a78bfa" stroke-width="2"/><path d="M8 19l4.5-5 3.5 3 4-6 4 4" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span>Freeman<b>Macro</b>Scope</span>
    </a>
    <nav class="mainnav">${nav.map(([h, n, a]) => `<a href="${h}" class="${a ? 'active' : ''}">${n}</a>`).join('')}</nav>
    <div class="top-controls">
      ${selectors()}
      <div class="lang-switch" role="group" aria-label="${esc(t('nav.lang'))}">${LANGS.map((l) => `<button data-lang="${l}" class="${l === getLang() ? 'active' : ''}">${l.toUpperCase()}</button>`).join('')}</div>
    </div>`;
}

function footer() {
  document.getElementById('footer').innerHTML = `
    ${adSlot('footer')}
    <div class="foot-inner">
      <div>
        <strong>${SITE.name}</strong> · ${t('app.tagline')}<br>
        <span>${t('foot.disclaimer')}</span><br>
        <span class="muted">${t('foot.data')}</span>
      </div>
      <nav class="foot-links">
        <a href="#/methodik">${t('nav.method')}</a><a href="#/quellen">${t('nav.sources')}</a>
        <a href="#/disclaimer">${t('legal.disclaimer')}</a><a href="#/datenschutz">${t('legal.privacy')}</a><a href="#/impressum">${t('legal.imprint')}</a>
      </nav>
    </div>`;
  fillAds(document.getElementById('footer'));
}

let renderSeq = 0;
async function render() {
  const seq = ++renderSeq;
  const r = parseRoute();
  if (r.country) country = r.country;
  if (!entries().some((e) => e.id === country && e.land === land)) land = entries().find((e) => e.id === country)?.land ?? null;
  header();
  cleanup();
  cleanup = () => {};
  // The view is attached before rendering so charts measure a real container.
  const view = document.createElement('div');
  view.className = 'view';
  view.innerHTML = `<div class="loading"><div class="spinner"></div>${t('app.loading')}</div>`;
  app.replaceChildren(view);
  window.scrollTo({ top: 0 });
  try {
    const fn = { overview: renderOverview, indicator: renderIndicator, compare: renderCompare }[r.view] || renderPage;
    const c = await fn(view, r);
    if (seq !== renderSeq) { c?.(); return; }
    cleanup = c || (() => {});
    if (r.view !== 'indicator' && r.view !== 'compare') document.title = `${SITE.name} · ${t('app.tagline')}`;
  } catch (err) {
    console.error(err);
    if (seq === renderSeq) view.innerHTML = `<div class="empty">${t('err.load')}<br><small class="muted">${esc(err.message)}</small></div>`;
  }
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-lang]');
  if (!b) return;
  setLang(b.dataset.lang);
  footer();
  render();
});
document.addEventListener('change', (e) => {
  const cur = currentEntry();
  if (!cur) return;
  let next = null;
  if (e.target.id === 'land-sel') next = pick({ land: e.target.value, group: cur.group, vs: cur.vs });
  else if (e.target.id === 'group-sel') next = pick({ land: cur.land, group: e.target.value });
  else if (e.target.id === 'vs-sel') next = pick({ land: cur.land, group: 'exogenous', vs: e.target.value });
  if (!next) return;
  land = next.land;
  saveLand();
  if (next.id === country) header();
  else location.hash = `#/${next.id}`;
});
window.addEventListener('hashchange', render);

(async function init() {
  document.documentElement.lang = getLang();
  try { countries = await loadCountries(); } catch { /* keep default */ }
  footer();
  await render();
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
