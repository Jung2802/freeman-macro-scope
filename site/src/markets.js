// The stock exchanges of the dashboard countries, with their regular trading hours in local time.
// Public holidays are not modelled; weekends are.
export const EXCHANGES = [
  { id: 'nyse', city: { de: 'New York', en: 'New York' }, short: 'NYC', ex: 'NYSE', tz: 'America/New_York', lat: 40.71, lon: -74.01, sessions: [['09:30', '16:00']] },
  { id: 'tsx', city: { de: 'Toronto', en: 'Toronto' }, short: 'TOR', ex: 'TSX', tz: 'America/Toronto', lat: 43.65, lon: -79.38, sessions: [['09:30', '16:00']] },
  { id: 'lse', city: { de: 'London', en: 'London' }, short: 'LDN', ex: 'LSE', tz: 'Europe/London', lat: 51.51, lon: -0.09, sessions: [['08:00', '16:30']] },
  { id: 'xetra', city: { de: 'Frankfurt', en: 'Frankfurt' }, short: 'FRA', ex: 'Xetra', tz: 'Europe/Berlin', lat: 50.11, lon: 8.68, sessions: [['09:00', '17:30']] },
  { id: 'epa', city: { de: 'Paris', en: 'Paris' }, short: 'PAR', ex: 'Euronext', tz: 'Europe/Paris', lat: 48.86, lon: 2.35, sessions: [['09:00', '17:30']] },
  { id: 'bit', city: { de: 'Mailand', en: 'Milan' }, short: 'MIL', ex: 'Borsa Italiana', tz: 'Europe/Rome', lat: 45.46, lon: 9.19, sessions: [['09:00', '17:30']] },
  { id: 'bme', city: { de: 'Madrid', en: 'Madrid' }, short: 'MAD', ex: 'BME', tz: 'Europe/Madrid', lat: 40.42, lon: -3.70, sessions: [['09:00', '17:30']] },
  { id: 'tse', city: { de: 'Tokio', en: 'Tokyo' }, short: 'TYO', ex: 'TSE', tz: 'Asia/Tokyo', lat: 35.68, lon: 139.77, sessions: [['09:00', '11:30'], ['12:30', '15:30']] },
  { id: 'asx', city: { de: 'Sydney', en: 'Sydney' }, short: 'SYD', ex: 'ASX', tz: 'Australia/Sydney', lat: -33.87, lon: 151.21, sessions: [['10:00', '16:00']] },
];

// Capital-flow routes drawn on the globe.
export const ROUTES = [
  ['nyse', 'lse'], ['lse', 'xetra'], ['xetra', 'tse'], ['nyse', 'tse'], ['tsx', 'nyse'], ['epa', 'bit'],
  ['bme', 'lse'], ['lse', 'tse'], ['asx', 'tse'], ['nyse', 'xetra'], ['tsx', 'lse'], ['epa', 'nyse'], ['asx', 'nyse'],
];

const fmtCache = new Map();
function parts(tz, now) {
  if (!fmtCache.has(tz)) {
    fmtCache.set(tz, new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }));
  }
  const p = Object.fromEntries(fmtCache.get(tz).formatToParts(now).map((x) => [x.type, x.value]));
  return { wd: p.weekday, hm: `${p.hour}:${p.minute}` };
}

export function status(ex, now = new Date()) {
  const { wd, hm } = parts(ex.tz, now);
  const weekend = wd === 'Sat' || wd === 'Sun';
  const open = !weekend && ex.sessions.some(([a, b]) => hm >= a && hm < b);
  return { open, local: hm, weekend };
}

// Sub-solar point (where the sun is overhead) for a moment in time, in degrees.
export function subsolar(now = new Date()) {
  const d = (now.getTime() - Date.UTC(2000, 0, 1, 12)) / 864e5; // days since J2000
  const g = ((357.529 + 0.98560028 * d) % 360) * Math.PI / 180;
  const q = (280.459 + 0.98564736 * d) % 360;
  const L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * Math.PI / 180;
  const e = (23.439 - 0.00000036 * d) * Math.PI / 180;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  const gmst = (18.697374558 + 24.06570982441908 * d) % 24; // hours
  let lon = (ra * 180 / Math.PI) - gmst * 15;
  lon = ((lon + 540) % 360) - 180;
  return { lat: dec * 180 / Math.PI, lon };
}
