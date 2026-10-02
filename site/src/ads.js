// Ad placements. Deliberately few: one per page plus one in the footer.
import { SITE } from './site-config.js';
import { t, L } from './i18n.js';
import { esc } from './format.js';

const preview = () => new URLSearchParams(location.search).has('adpreview');

// Placeholder for the future Pro licence check. Must verify a real licence
// (server-side token) before it may return true – never trust localStorage alone.
export function isPro() {
  return false;
}

let scriptLoaded = false;
function loadAdSense() {
  if (scriptLoaded || !SITE.ads.client) return;
  scriptLoaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(SITE.ads.client)}`;
  s.crossOrigin = 'anonymous';
  document.head.appendChild(s);
}

export function adsActive() {
  return !isPro() && (preview() || (SITE.ads.enabled && SITE.ads.client));
}

// Returns HTML for a slot; call fillAds() after inserting it into the DOM.
export function adSlot(name) {
  if (!adsActive()) return '';
  const pro = SITE.pro.enabled
    ? `<a class="ad-pro" href="#/pro">${esc(t('ads.removeWithPro'))} · ${esc(L(SITE.pro.price))}</a>`
    : '';
  return `<aside class="ad-slot" data-slot="${name}" aria-label="${esc(t('ads.label'))}">
    <div class="ad-head"><span>${esc(t('ads.label'))}</span>${pro}</div>
    <div class="ad-body"></div>
  </aside>`;
}

export function fillAds(root = document) {
  if (!adsActive()) return;
  root.querySelectorAll('.ad-slot:not([data-filled])').forEach((el) => {
    el.dataset.filled = '1';
    const body = el.querySelector('.ad-body');
    if (preview() && !(SITE.ads.enabled && SITE.ads.client)) {
      body.innerHTML = `<div class="ad-placeholder">${esc(t('ads.preview'))} · ${esc(el.dataset.slot)}</div>`;
      return;
    }
    loadAdSense();
    const unit = SITE.ads.slots[el.dataset.slot];
    body.innerHTML = `<ins class="adsbygoogle" style="display:block" data-ad-client="${esc(SITE.ads.client)}"
      ${unit ? `data-ad-slot="${esc(unit)}"` : ''} data-ad-format="auto" data-full-width-responsive="true"></ins>`;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* blocked by the user */ }
  });
}
