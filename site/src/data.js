// Loading of the static JSON produced by pipeline/fetch.py.
import { score } from './analysis.js';

const cache = new Map();

async function getJSON(path) {
  if (!cache.has(path)) {
    cache.set(path, fetch(path, { cache: 'no-cache' }).then((r) => {
      if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
      return r.json();
    }).catch((err) => { cache.delete(path); throw err; }));
  }
  return cache.get(path);
}

export const loadCountries = () => getJSON('data/countries.json');
export const loadConfig = (c) => getJSON(`data/${c}/config.json`);
export const loadIndex = (c) => getJSON(`data/${c}/index.json`);
export const loadSeries = (c, id) => getJSON(`data/${c}/${id}.json`);
export const loadRecessions = (c) => getJSON(`data/${c}/recessions.json`).catch(() => []);

export function indicatorById(cfg, id) {
  return cfg.indicators.find((i) => i.id === id);
}

export function categoryOf(cfg, ind) {
  return cfg.categories.find((c) => c.id === ind.category);
}

// Everything the overview needs: series + score for every indicator.
export async function loadAll(country) {
  const cfg = await loadConfig(country);
  const [index, recessions, ...series] = await Promise.all([
    loadIndex(country),
    loadRecessions(country),
    ...cfg.indicators.map((i) => loadSeries(country, i.id).catch(() => null)),
  ]);
  const items = cfg.indicators.map((ind, k) => {
    const data = series[k];
    if (!data || !data.values?.length) return { ind, data: null, sc: null };
    return { ind, data, sc: score(data.values, ind) };
  });
  return { cfg, index, recessions, items };
}
