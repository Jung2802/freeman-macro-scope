import { getLang } from './i18n.js';

const LOCALE = { de: 'de-CH', en: 'en-US' };
const locale = () => LOCALE[getLang()] || 'en-US';

const nfCache = new Map();
function nf(decimals) {
  const key = `${locale()}|${decimals}`;
  if (!nfCache.has(key)) nfCache.set(key, new Intl.NumberFormat(locale(), { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
  return nfCache.get(key);
}

export function num(v, decimals = 1) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  const s = nf(decimals).format(v);
  // Values that round to zero should not show a sign ("-0.0").
  return /^[-−]?0([.,']0*)?$/.test(s) ? s.replace(/^[-−]/, '') : s;
}

export function signed(v, decimals = 1) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  const s = num(v, decimals);
  return v > 0 && /[1-9]/.test(s) ? `+${s}` : s;
}

export const pct = (v, decimals = 0) => (Number.isFinite(v) ? `${num(v * 100, decimals)} %` : '—');

const MONTHS = {
  de: ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
export const monthNames = () => MONTHS[getLang()] || MONTHS.en;

// Period label for display. Data labels are "YYYY-MM" (M, Q) or "YYYY" (A).
export function period(label, freq) {
  if (!label) return '—';
  if (freq === 'A' || label.length === 4) return label.slice(0, 4);
  const y = label.slice(0, 4), m = +label.slice(5, 7);
  if (freq === 'Q') return `Q${Math.floor((m - 1) / 3) + 1} ${y}`;
  return `${monthNames()[m - 1]} ${y}`;
}

export function dateTime(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(locale(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
