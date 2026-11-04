// Live earth built on the original hero photo, so it keeps exactly that look: blue-grey night, lit
// cloud tops and a wide glowing horizon. WebGL brings it to life: the clouds drift along the horizon,
// the horizon light breathes, and real city lights (NASA Black Marble) sit on the dark side, mapped onto
// the photo's own curvature and turning with the planet. A 2D layer adds the dashboard countries'
// exchanges (lit while they trade), capital-flow arcs and a ticker of exchange rates along the horizon.
import { EXCHANGES, ROUTES, status } from './markets.js';
import { num, signed } from './format.js';

const RAD = Math.PI / 180;
// The photo's horizon, fitted as a circle (in pixels of the 744 × 511 original).
const PHOTO = { w: 744, h: 511, cx: 955.3, cy: 1350.0, r: 1339.3 };
const SPIN_DEG_PER_S = 0.16;           // the city lights turn with the planet
const SCROLL_DEG_PER_PX = 0.012;
const FLOW_PERIOD = 9;                 // seconds per cloud-drift cycle
const FLOW_ANGLE = 0.011;              // radians the clouds travel per cycle
// which part of the globe sits behind the photo
const VIEW = { lat: 24, lon: 38, roll: 15 };   // Europe in the dark lower part, the Atlantic and New York towards the horizon

const VS = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FS = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D tPhoto, tLights;
uniform mat3 M;                     // view → body
uniform vec4 rect;                  // photo placement in canvas px: x, y (top-left, y down), w, h
uniform vec3 circ;                  // horizon circle in canvas px: cx, cy (y down), r
uniform vec2 view;                  // canvas size in px
uniform float time, flowA, flowT, dim;
const float PI = 3.14159265;

float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vnoise(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }
vec3 photoAt(vec2 px) { return texture(tPhoto, clamp((px - rect.xy) / rect.zw, vec2(0.001), vec2(0.999))).rgb; }

void main() {
  vec2 px = vec2(gl_FragCoord.x, view.y - gl_FragCoord.y);   // y down, like the page
  vec2 uv = (px - rect.xy) / rect.zw;
  // fades of the original layout: transparent towards the left, soft at the bottom
  float mask = smoothstep(0.0, 0.34, uv.x) * (1.0 - smoothstep(0.88, 1.0, uv.y));
  if (uv.x < 0.0 || uv.y > 1.0 || mask <= 0.0) { o = vec4(0.0); return; }

  vec2 d = px - circ.xy;
  float r = length(d) / circ.z;                               // 1.0 = the horizon

  // clouds drift along the horizon: two phases of a flow cycle, cross-faded so the drift never jumps
  float ph = fract(time / flowT);
  float w = abs(ph * 2.0 - 1.0);
  float inside = 1.0 - smoothstep(0.985, 1.003, r);           // the glowing limb itself stays put
  vec3 c1 = photoAt(circ.xy + rot(d, -(ph - 0.5) * flowA * inside));
  vec3 c2 = photoAt(circ.xy + rot(d, -(fract(ph + 0.5) - 0.5) * flowA * inside));
  vec3 col = mix(c1, c2, w);

  // night grade: a touch darker and cooler than the daytime photo
  float lum = dot(col, vec3(0.3, 0.55, 0.15));
  col = mix(col, col * vec3(0.78, 0.86, 1.0), 0.35) * 0.9;

  // the horizon light breathes very slowly
  float limb = exp(-pow((r - 1.0) / 0.012, 2.0));
  col += vec3(0.35, 0.5, 0.75) * limb * (0.05 + 0.05 * sin(time * 0.5));

  // city lights on the dark side, mapped onto the photo's sphere and turning with it
  if (r < 0.999) {
    vec2 q = d / circ.z;
    vec3 n = vec3(q.x, -q.y, sqrt(max(0.0, 1.0 - dot(q, q))));
    vec3 b = M * n;
    vec2 tuv = vec2(atan(b.x, b.z) / (2.0 * PI) + 0.5, 0.5 - asin(clamp(b.y, -1.0, 1.0)) / PI);
    vec2 tb = vec2(fract(tuv.x + 0.5), tuv.y);
    vec2 dxa = dFdx(tuv), dya = dFdy(tuv), dxb = dFdx(tb), dyb = dFdy(tb);
    float L = textureGrad(tLights, tuv, abs(dxa.x) < abs(dxb.x) ? dxa : dxb, abs(dya.x) < abs(dyb.x) ? dya : dyb).r;
    float glow = textureLod(tLights, tuv, 4.0).r;
    float spark = pow(vnoise(b * 1500.0), 3.0) * 2.4 + 0.3;
    float twinkle = 0.85 + 0.15 * sin(time * 2.3 + hash(floor(b * 400.0)) * 6.28);
    float dark = 1.0 - smoothstep(0.14, 0.4, lum);             // only where the photo is dark (no lit clouds)
    float haze = smoothstep(0.995, 0.9, r);                     // lights fade into the atmosphere at the limb
    col += vec3(1.0, 0.8, 0.55) * (pow(L, 1.25) * spark * twinkle * 1.35 + glow * 0.32) * dark * haze;
  }
  o = vec4(col * mask * dim, mask * dim);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

async function loadBitmap(src) {
  const res = await fetch(src);
  if (!res.ok) throw new Error(src);
  const blob = await res.blob();
  if ('createImageBitmap' in window) {
    try { return await createImageBitmap(blob, { colorSpaceConversion: 'none' }); } catch { /* fall back */ }
  }
  return new Promise((ok, fail) => { const im = new Image(); im.onload = () => ok(im); im.onerror = fail; im.src = URL.createObjectURL(blob); });
}

const mul = (A, B) => Array.from({ length: 9 }, (_, i) => { const r = Math.floor(i / 3), c = i % 3; return A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c]; });
const Ry = (a) => [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)];
const Rx = (a) => [1, 0, 0, 0, Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a)];
const Rz = (a) => [Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a), 0, 0, 0, 1];
const applyT = (m, v) => [m[0] * v[0] + m[3] * v[1] + m[6] * v[2], m[1] * v[0] + m[4] * v[1] + m[7] * v[2], m[2] * v[0] + m[5] * v[1] + m[8] * v[2]];
const body = (lat, lon) => [Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD), Math.cos(lat * RAD) * Math.cos(lon * RAD)];
const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
function slerp(a, b, t) {
  const d = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const w = Math.acos(d), s = Math.sin(w) || 1;
  return [0, 1, 2].map((i) => a[i] * Math.sin((1 - t) * w) / s + b[i] * Math.sin(t * w) / s);
}
// view → body: look at (lat, lon), roll the picture, then spin about the planet's axis
const orient = (spinDeg) => mul(Ry((VIEW.lon + spinDeg) * RAD), mul(Rx(-VIEW.lat * RAD), Rz(VIEW.roll * RAD)));

async function rateTicks() {
  try {
    const list = await (await fetch('data/countries.json')).json();
    const pairs = list.filter((c) => /^[a-z]{6}$/.test(c.id) && c.currency?.includes('/'));
    const out = await Promise.all(pairs.map(async (c) => {
      const idx = await (await fetch(`data/${c.id}/index.json`)).json();
      if (!idx.indicators?.spot?.ok) return null;
      const v = (await (await fetch(`data/${c.id}/spot.json`)).json()).values;
      const last = v.at(-1)[1], prev = v.at(-2)[1];
      return { label: c.currency, value: num(last, last > 20 ? 2 : 4), chg: (last / prev - 1) * 100 };
    }));
    return out.filter(Boolean);
  } catch { return []; }
}

export async function initGlobe(stage) {
  const canvas = document.createElement('canvas');
  canvas.className = 'globe';
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const overlay = document.createElement('canvas');
  overlay.className = 'globe-overlay';

  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    console.warn('globe disabled:', err.message);
    return null;
  }
  const big = Math.min(screen.width, screen.height) >= 700 && innerWidth >= 900;
  const [photo, lights] = await Promise.all([loadBitmap('assets/img/earth-2x.webp'), loadBitmap(`assets/img/earth-lights-${big ? 4096 : 2048}.webp`)]).catch(() => [null, null]);
  if (!photo || !lights) return null;
  const ticks = await rateTicks();

  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  [['tPhoto', photo, false], ['tLights', lights, true]].forEach(([name, img, repeat], i) => {
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(prog, name), i);
  });
  const U = Object.fromEntries(['M', 'rect', 'circ', 'view', 'time', 'flowA', 'flowT', 'dim'].map((n) => [n, gl.getUniformLocation(prog, n)]));
  gl.uniform1f(U.flowA, FLOW_ANGLE);
  gl.uniform1f(U.flowT, FLOW_PERIOD);
  stage.append(canvas, overlay);
  const ctx = overlay.getContext('2d');

  // Placement after the original hero, a little larger and nudged towards the centre: it fills the
  // right side top to bottom and stays there while the page scrolls.
  let L = {};
  const layout = () => {
    const w = innerWidth, h = innerHeight, phone = w < 900;
    let pw, ph, left, top;
    if (phone) { pw = w * 1.5; ph = pw * PHOTO.h / PHOTO.w; left = w * 0.02; top = h * 0.01; }
    else { ph = Math.max(h * 1.06, (w * 0.86) * PHOTO.h / PHOTO.w); pw = ph * PHOTO.w / PHOTO.h; left = w * 1.04 - pw; top = -h * 0.03; }
    const s = pw / PHOTO.w;
    L = { w, h, dpr: Math.min(phone ? 1.5 : 1.75, window.devicePixelRatio || 1), rect: [left, top, pw, ph], cx: left + PHOTO.cx * s, cy: top + PHOTO.cy * s, r: PHOTO.r * s };
    for (const cv of [canvas, overlay]) { cv.width = Math.round(w * L.dpr); cv.height = Math.round(h * L.dpr); }
    gl.viewport(0, 0, canvas.width, canvas.height);
    const k = L.dpr;
    gl.uniform4f(U.rect, left * k, top * k, pw * k, ph * k);
    gl.uniform3f(U.circ, L.cx * k, L.cy * k, L.r * k);
    gl.uniform2f(U.view, canvas.width, canvas.height);
  };
  layout();

  const t0 = performance.now();
  const ex = EXCHANGES.map((e) => ({ ...e, n: body(e.lat, e.lon) }));
  const byId = Object.fromEntries(ex.map((e) => [e.id, e]));
  const routes = ROUTES.map(([a, b], i) => ({ a: byId[a], b: byId[b], speed: 0.03 + (i % 5) * 0.008, phase: (i * 0.37) % 1 }));
  const tickerText = ticks.map((tk) => `${tk.label}  ${tk.value}  ${tk.chg >= 0 ? '▲' : '▼'} ${signed(tk.chg, 1)} %`).join('     ·     ') + '     ·     ';
  const charW = new Map();
  let open = new Map(), lastStatus = -1e9, fade = 0, tickW = 0;

  // the sphere behind the photo: unit vector (view space, z towards us) → page pixels
  const project = (P) => [L.cx + P[0] * L.r, L.cy - P[1] * L.r];
  const visible = (P, xy) => P[2] > 0.02 && Math.hypot(xy[0] - L.cx, xy[1] - L.cy) < L.r * 0.99
    && xy[0] > L.rect[0] + L.rect[2] * 0.3 && xy[0] < L.w + 30 && xy[1] > -30 && xy[1] < L.h + 30;

  function render(now, scrollY, still) {
    const secs = still ? 0 : (now - t0) / 1000;
    const near = Math.min(1, scrollY / ((innerHeight || 800) * 1.1));
    const dim = 1 - near * 0.25;                 // stays in place, only dims a little behind the content
    fade = still ? 1 : Math.min(1, fade + 0.03);
    const M = orient(secs * SPIN_DEG_PER_S + scrollY * SCROLL_DEG_PER_PX);
    gl.uniformMatrix3fv(U.M, true, M);
    gl.uniform1f(U.time, secs);
    gl.uniform1f(U.dim, dim * fade);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (now - lastStatus > 20000) { const d = new Date(); open = new Map(ex.map((e) => [e.id, status(e, d).open])); lastStatus = now; }
    drawOverlay(M, secs, dim * fade);
  }

  function drawOverlay(M, secs, alpha) {
    const { w, h } = L;
    ctx.setTransform(L.dpr, 0, 0, L.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = alpha;
    const world = (nb, alt = 0) => applyT(M, nb).map((x) => x * (1 + alt));

    // capital flows: light pulses with a short tail travelling between the exchanges
    for (const r of routes) {
      const live = open.get(r.a.id) || open.get(r.b.id);
      const pts = [];
      for (let i = 0; i <= 64; i++) {
        const t = i / 64, P = world(norm(slerp(r.a.n, r.b.n, t)), Math.sin(Math.PI * t) * 0.02);
        const xy = project(P);
        pts.push({ vis: visible(P, xy), xy });
      }
      const head = (secs * r.speed + r.phase) % 1;
      for (let j = 0; j < 16; j++) {
        const t = head - j * 0.005;
        if (t < 0) continue;
        const i = Math.min(63, Math.floor(t * 64)), f = t * 64 - i, A = pts[i], B = pts[i + 1];
        if (!A.vis || !B.vis) continue;
        ctx.fillStyle = `rgba(${live ? '255,240,215' : '205,218,235'},${(1 - j / 16) * (live ? 0.85 : 0.4)})`;
        ctx.beginPath(); ctx.arc(A.xy[0] + (B.xy[0] - A.xy[0]) * f, A.xy[1] + (B.xy[1] - A.xy[1]) * f, (live ? 1.8 : 1.2) * (1 - j / 16), 0, Math.PI * 2); ctx.fill();
      }
    }

    // exchanges: lit and pulsing while they trade
    ctx.font = '500 9.5px Inter, system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    for (const e of ex) {
      const P = applyT(M, e.n), xy = project(P);
      if (!visible(P, xy)) continue;
      const kf = Math.min(1, P[2] * 4);
      const isOpen = open.get(e.id);
      const [x, y] = xy;
      if (isOpen) {
        const ph = (((secs * 0.7 + e.lon / 90) % 1) + 1) % 1;
        ctx.strokeStyle = `rgba(127,224,168,${(1 - ph) * 0.75 * kf})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, 3 + ph * 16, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = isOpen ? `rgba(190,250,215,${kf})` : `rgba(225,232,245,${0.6 * kf})`;
      ctx.beginPath(); ctx.arc(x, y, isOpen ? 2.3 : 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = isOpen ? `rgba(220,255,232,${0.9 * kf})` : `rgba(205,214,228,${0.55 * kf})`;
      ctx.fillText(`${e.short}${isOpen ? ' · OPEN' : ''}`, x + 7, y - 7);
    }

    // exchange-rate ticker running along the horizon, just outside the glow
    if (ticks.length) {
      ctx.font = '400 10px Inter, system-ui, sans-serif';
      ctx.textBaseline = 'alphabetic';
      if (!tickW) tickW = ctx.measureText(tickerText).width;
      const rr = L.r * 1.03;
      const offset = (secs * 14) % tickW;
      const yStart = Math.min(h, L.rect[1] + L.rect[3]);
      const a0 = Math.atan2(yStart - L.cy, -Math.sqrt(Math.max(0, rr * rr - (yStart - L.cy) ** 2)));
      let s = -offset;
      for (let rep = 0; rep < 4 && s < rr * Math.PI * 0.6; rep++) {
        for (const ch of tickerText) {
          if (!charW.has(ch)) charW.set(ch, ctx.measureText(ch).width);
          const cw = charW.get(ch);
          const ang = a0 + (s + cw / 2) / rr;
          s += cw;
          const x = L.cx + Math.cos(ang) * rr, y = L.cy + Math.sin(ang) * rr;
          if (x < -20 || x > w + 20 || y < -20 || y > h + 20) continue;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(ang + Math.PI / 2);
          ctx.globalAlpha = alpha * 0.5;
          ctx.fillStyle = ch === '▲' ? '#a3c4e8' : ch === '▼' ? '#c4a47c' : '#c9d3df';
          ctx.fillText(ch, -cw / 2, 0);
          ctx.restore();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  return { render, resize: layout };
}
