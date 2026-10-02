import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as A from '../site/src/analysis.js';

const close = (a, b, eps = 1e-4) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const load = (id) => JSON.parse(readFileSync(new URL(`../site/data/us/${id}.json`, import.meta.url)));

test('descriptive statistics match Excel (KURT/SKEW doc examples)', () => {
  const xs = [3, 4, 5, 2, 3, 4, 5, 6, 4, 7];
  close(A.kurtosis(xs), -0.151799637);
  close(A.skewness(xs), 0.359543071);
  close(A.median([5, 1, 3]), 3);
  close(A.median([4, 1, 3, 2]), 2.5);
  close(A.std([2, 4, 4, 4, 5, 5, 7, 9], false), 2);
});

test('describe: sigma bands and pos/neg split', () => {
  const d = A.describe([-2, -1, 0, 1, 2, 3]);
  assert.equal(d.pos, 3);
  assert.equal(d.neg, 2);
  assert.equal(d.zero, 1);
  close(d.ratioPN, 1.5);
  assert.equal(d.sigma.length, 3);
  assert.ok(d.sigma[2].actual === 1);
});

test('rolling, changes, streaks', () => {
  const s = [['2020-01', 1], ['2020-02', 2], ['2020-03', 3], ['2020-04', 4]];
  assert.deepEqual(A.rolling(s, 2), [null, 1.5, 2.5, 3.5]);
  assert.deepEqual(A.changes(s, 2), [null, null, 2, 2]);
  assert.deepEqual(A.streaks([1, 2, -1, -2, -3, 5], 0), [1, 2, -1, -2, -3, 1]);
});

test('heat grid places months and quarters correctly', () => {
  const g = A.heatGrid([['2020-01', 1], ['2020-12', 2], ['2021-04', 3]], 'M');
  assert.equal(g.length, 2);
  assert.equal(g[0].cells[0], 1);
  assert.equal(g[0].cells[11], 2);
  assert.equal(g[1].cells[3], 3);
  const q = A.heatGrid([['2020-07', 5]], 'Q');
  assert.equal(q[0].cells[2], 5);
});

test('threshold resolution', () => {
  close(A.resolveThreshold(50, [1, 2]), 50);
  close(A.resolveThreshold('median', [1, 2, 9]), 2);
  close(A.resolveThreshold('mean', [1, 2, 9]), 4);
});

test('score: direction flips sign, unscored indicators return null', () => {
  const series = Array.from({ length: 120 }, (_, i) => [`${2000 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`, i < 110 ? 0 + (i % 3) : 10 + i]);
  const up = A.score(series, { threshold: 'mean', direction: 1, frequency: 'M' });
  const down = A.score(series, { threshold: 'mean', direction: -1, frequency: 'M' });
  assert.ok(up.total > 0);
  assert.equal(down.total, -up.total);
  assert.ok(Math.abs(up.long) <= A.SCORE_MAX && Math.abs(up.short) <= A.SCORE_MAX);
  const none = A.score(series, { threshold: 'mean', direction: 0, frequency: 'M' });
  assert.equal(none.total, null);
});

test('OLS recovers an exact line', () => {
  const r = A.ols([1, 2, 3, 4], [3, 5, 7, 9]);
  close(r.a, 1);
  close(r.b, 2);
  close(r.r2, 1);
});

test('monthly → quarterly keeps only complete quarters', () => {
  const q = A.toQuarterly([['2020-01', 1], ['2020-02', 2], ['2020-03', 3], ['2020-04', 9]], 'M');
  assert.deepEqual(q, [['2020-01', 2]]);
});

test('Sahm rule: flat series gives 0, a jump shows up', () => {
  const s = Array.from({ length: 24 }, (_, i) => [`x${i}`, i < 20 ? 4 : 5]);
  const out = A.sahm(s);
  assert.equal(out[13], null);
  close(out[19], 0);
  close(out[23], 1);
});

test('NBER cycle lengths from the real recession file', () => {
  const rec = JSON.parse(readFileSync(new URL('../site/data/us/recessions.json', import.meta.url)));
  const c = A.cycles(rec, '1948');
  const gfc = c.rows.find((r) => r.start === '2008-01');
  assert.equal(gfc.months, 18); // NBER: Dec 2007 peak → Jun 2009 trough = 18 months
  const covid = c.rows.find((r) => r.start === '2020-03');
  assert.equal(covid.months, 2); // NBER: Feb 2020 → Apr 2020 = 2 months
  assert.equal(covid.expansionBefore, 128); // NBER: Jun 2009 → Feb 2020 = 128 months
});

test('cross-correlation: series leading itself by 2 peaks at lag 2', () => {
  const base = Array.from({ length: 80 }, (_, i) => Math.sin(i / 3) + (i % 7) / 10);
  const a = base.map((v, i) => [`k${String(i).padStart(3, '0')}`, v]);
  const b = base.map((_, i) => [`k${String(i).padStart(3, '0')}`, base[i - 2] ?? 0]);
  const cc = A.crossCorrelation(a, b, 4);
  const best = cc.reduce((m, x) => (x.r > m.r ? x : m));
  assert.equal(best.lag, 2);
});

test('real data: every indicator file is well-formed and recent', () => {
  const cfg = JSON.parse(readFileSync(new URL('../site/data/us/config.json', import.meta.url)));
  for (const ind of cfg.indicators) {
    const d = load(ind.id);
    assert.ok(d.values.length > 20, `${ind.id} too short`);
    for (const [, v] of d.values) assert.ok(Number.isFinite(v), `${ind.id} has non-finite value`);
    assert.equal(d.frequency, ind.frequency);
    const labels = d.values.map((p) => p[0]);
    assert.deepEqual(labels, [...labels].sort(), `${ind.id} not sorted`);
  }
});

test('real data: GDP regression of manufacturing sentiment is positive', () => {
  const gdp = load('gdp').values;
  const mfg = load('mfg_regional').values;
  const reg = A.gdpRegression(mfg, 'M', gdp);
  assert.ok(reg && reg.b > 0, 'expected a positive slope');
  assert.ok(reg.r2 > 0.1, `weak fit r2=${reg?.r2}`);
});
