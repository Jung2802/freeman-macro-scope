// "World exchanges now": which of the dashboard countries' stock exchanges are trading at this moment.
import { EXCHANGES, status } from './markets.js';
import { t, L } from './i18n.js';
import { esc } from './format.js';

function rows(now) {
  return EXCHANGES.map((e) => {
    const s = status(e, now);
    return `<li class="mk-item ${s.open ? 'open' : ''}" title="${esc(`${e.ex} · ${L(e.city)}`)}">
      <span class="mk-dot"></span><span class="mk-ex">${esc(e.ex)}</span><span class="mk-time">${s.local}</span></li>`;
  }).join('');
}

export function marketBoard() {
  const now = new Date();
  const n = EXCHANGES.filter((e) => status(e, now).open).length;
  return `<aside class="market-board" aria-label="${esc(t('mk.title'))}">
    <div class="mk-head"><span class="live-dot"></span>${t('mk.title')}<span class="mk-count">${t('mk.count', { n, m: EXCHANGES.length })}</span></div>
    <ul class="mk-list">${rows(now)}</ul>
    <p class="mk-note">${t('mk.note')}</p>
  </aside>`;
}

// Refreshes every board on the page; returns the cleanup.
export function startMarketBoard(el) {
  const tick = () => {
    const now = new Date();
    el.querySelectorAll('.market-board').forEach((b) => {
      b.querySelector('.mk-list').innerHTML = rows(now);
      b.querySelector('.mk-count').textContent = t('mk.count', { n: EXCHANGES.filter((e) => status(e, now).open).length, m: EXCHANGES.length });
    });
  };
  const id = setInterval(tick, 30000);
  return () => clearInterval(id);
}
