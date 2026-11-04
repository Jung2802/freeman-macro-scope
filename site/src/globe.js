// Live earth: a WebGL2 ray-traced globe with the real day/night line of this moment, city lights,
// drifting clouds, ocean glint and an atmosphere, plus a 2D layer with the dashboard countries'
// stock exchanges (lit while they trade) and capital-flow arcs between them.
import { EXCHANGES, ROUTES, status, subsolar } from './markets.js';

const RAD = Math.PI / 180;
const TEX = { day: 'assets/img/earth-day.webp', lights: 'assets/img/earth-lights.webp', clouds: 'assets/img/earth-clouds.webp', water: 'assets/img/earth-water.webp' };
// Camera at the origin looking down −z; planet radius 1. Tuned so the horizon arcs across the
// upper right like the original photo, with the planet's bulk below the frame.
const VIEW = { tanF: 0.5, cx: 0.5, cy: -0.78, cz: -1.82, lat: 26, roll: -16 };
const ORBIT_DEG_PER_S = 1.2; // one trip around the planet in five minutes
const SCROLL_DEG_PER_PX = 0.045;

const VS = `#version 300 es
in vec2 p; out vec2 uv;
void main() { uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

const FS = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o;
uniform sampler2D tDay, tLights, tClouds, tWater;
uniform mat3 M;          // world → body
uniform vec3 C, S;       // planet centre (world), sun direction (body)
uniform float aspect, tanF, cloudShift, fade;
const float PI = 3.14159265;

vec2 lonlat(vec3 n) { return vec2(atan(n.x, n.z), asin(clamp(n.y, -1.0, 1.0))); }

vec4 tex(sampler2D t, vec2 ll, float shift) {
  vec2 a = vec2(ll.x / (2.0 * PI) + 0.5 + shift, 0.5 - ll.y / PI);
  vec2 b = vec2(fract(a.x + 0.5), a.y);
  vec2 dxa = dFdx(a), dya = dFdy(a), dxb = dFdx(b), dyb = dFdy(b);
  // pick the derivative that does not jump at the date line, so no seam appears
  vec2 dx = abs(dxa.x) < abs(dxb.x) ? dxa : dxb;
  vec2 dy = abs(dya.x) < abs(dyb.x) ? dya : dyb;
  return textureGrad(t, a, dx, dy);
}

void main() {
  vec3 d = normalize(vec3((uv.x * 2.0 - 1.0) * aspect * tanF, (uv.y * 2.0 - 1.0) * tanF, -1.0));
  float b = dot(d, C);
  vec3 q = b * d - C;                 // closest approach of the ray to the centre
  float h = length(q);
  float fw = fwidth(h) * 1.2;
  float cover = clamp((1.0 - h) / fw + 0.5, 0.0, 1.0);

  // atmosphere seen beside the planet: thin, brightest on the sunlit limb
  vec3 qb = M * normalize(q);
  float limbSun = smoothstep(-0.35, 0.55, dot(qb, S));
  float halo = exp(-max(h - 1.0, 0.0) / 0.022) * (0.22 + 0.95 * limbSun) + exp(-max(h - 1.0, 0.0) / 0.09) * 0.2 * limbSun;
  vec3 haloCol = mix(vec3(0.28, 0.45, 0.85), vec3(0.62, 0.8, 1.0), limbSun);
  vec4 outside = vec4(haloCol * halo, halo);

  vec3 col = vec3(0.0);
  if (h < 1.0 + fw) {
    float t = b - sqrt(max(0.0, 1.0 - min(h, 1.0) * min(h, 1.0)));
    vec3 P = d * t;
    vec3 nw = normalize(P - C);
    vec3 n = M * nw;
    vec3 v = M * -d;
    vec2 ll = lonlat(n);
    float ndl = dot(n, S);

    vec3 day = tex(tDay, ll, 0.0).rgb;
    day = pow(day, vec3(1.08));
    float grey = dot(day, vec3(0.3, 0.55, 0.15));
    day = mix(vec3(grey), day, 0.78) * vec3(0.92, 0.97, 1.05);
    float cl = tex(tClouds, ll, cloudShift).r;
    float water = tex(tWater, ll, 0.0).r;
    float lights = tex(tLights, ll, 0.0).r;

    float lit = smoothstep(-0.06, 0.32, ndl);
    float night = 1.0 - smoothstep(-0.2, 0.06, ndl);
    float dusk = exp(-pow(ndl / 0.12, 2.0));

    // cloud shadow, offset slightly away from the sun
    float shadow = tex(tClouds, lonlat(normalize(n - S * 0.006)), cloudShift).r;
    vec3 surface = day * (1.0 - shadow * 0.45) * lit;
    vec3 hv = normalize(S + v);
    float glint = pow(max(dot(n, hv), 0.0), 60.0) * water * lit * (1.0 - cl);
    surface += vec3(1.0, 0.92, 0.8) * glint * 0.75;
    surface += vec3(0.55, 0.28, 0.12) * dusk * 0.22 * (1.0 - cl);

    vec3 city = vec3(1.0, 0.72, 0.42) * pow(lights, 1.15) * 1.65 * night * (1.0 - cl * 0.75);
    vec3 cloudCol = mix(vec3(0.05, 0.06, 0.09), vec3(1.0, 0.98, 0.96), lit) + vec3(0.5, 0.25, 0.1) * dusk * 0.35;
    col = mix(surface + city, cloudCol, cl * 0.92);

    // atmosphere over the disc: blue rim on the day side, faint everywhere
    float rim = pow(1.0 - max(dot(nw, -d), 0.0), 3.0);
    col += mix(vec3(0.06, 0.1, 0.22), vec3(0.35, 0.55, 1.0), smoothstep(-0.2, 0.6, ndl)) * rim * (0.35 + 0.65 * smoothstep(-0.3, 0.5, ndl));
    col += vec3(0.01, 0.015, 0.03) * night; // earthshine keeps the night side from going pure black
  }
  vec4 planet = vec4(col, 1.0);
  vec4 res = planet * cover + outside * (1.0 - cover);
  o = res * fade;
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

function loadImage(src) {
  return new Promise((res, rej) => { const im = new Image(); im.decoding = 'async'; im.onload = () => res(im); im.onerror = rej; im.src = src; });
}

// Body → world uses the transpose of M (pure rotation).
function rotation(lonDeg, latDeg, rollDeg) {
  const l = lonDeg * RAD, a = -latDeg * RAD, r = rollDeg * RAD;
  const Ry = [Math.cos(l), 0, Math.sin(l), 0, 1, 0, -Math.sin(l), 0, Math.cos(l)];
  const Rx = [1, 0, 0, 0, Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a)];
  const Rz = [Math.cos(r), -Math.sin(r), 0, Math.sin(r), Math.cos(r), 0, 0, 0, 1];
  const mul = (A, B) => Array.from({ length: 9 }, (_, i) => { const row = Math.floor(i / 3), col = i % 3; return A[row * 3] * B[col] + A[row * 3 + 1] * B[3 + col] + A[row * 3 + 2] * B[6 + col]; });
  return mul(Ry, mul(Rx, Rz)); // row-major
}
const apply = (m, v) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
const applyT = (m, v) => [m[0] * v[0] + m[3] * v[1] + m[6] * v[2], m[1] * v[0] + m[4] * v[1] + m[7] * v[2], m[2] * v[0] + m[5] * v[1] + m[8] * v[2]];
const body = (lat, lon) => [Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD), Math.cos(lat * RAD) * Math.cos(lon * RAD)];
const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
function slerp(a, b, t) {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const w = Math.acos(dot), s = Math.sin(w) || 1;
  const ka = Math.sin((1 - t) * w) / s, kb = Math.sin(t * w) / s;
  return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
}

export async function initGlobe(container) {
  const canvas = document.createElement('canvas');
  canvas.className = 'globe';
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false, powerPreference: 'low-power' });
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
  const images = await Promise.all(Object.values(TEX).map(loadImage)).catch(() => null);
  if (!images) return null;

  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
  Object.keys(TEX).forEach((key, i) => {
    const tx = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(4, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    gl.uniform1i(gl.getUniformLocation(prog, 't' + key[0].toUpperCase() + key.slice(1)), i);
  });
  const U = Object.fromEntries(['M', 'C', 'S', 'aspect', 'tanF', 'cloudShift', 'fade'].map((n) => [n, gl.getUniformLocation(prog, n)]));

  container.append(canvas, overlay);
  const ctx = overlay.getContext('2d');
  let w = 1, h = 1, dpr = 1;
  const size = () => {
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    w = Math.max(1, container.clientWidth); h = Math.max(1, container.clientHeight);
    for (const cv of [canvas, overlay]) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  size();

  const C = [VIEW.cx, VIEW.cy, VIEW.cz];
  const t0 = performance.now();
  // Start the orbit on the evening side, so the first view shows the day turning into night.
  const startLon = subsolar().lon + 58;
  const ex = EXCHANGES.map((e) => ({ ...e, n: body(e.lat, e.lon) }));
  const byId = Object.fromEntries(ex.map((e) => [e.id, e]));
  const routes = ROUTES.map(([a, b], i) => ({ a: byId[a], b: byId[b], speed: 0.07 + (i % 5) * 0.018, phase: (i * 0.37) % 1 }));
  let openState = new Map(), lastStatus = 0, fade = 0;

  const project = (P) => [((P[0] / -P[2]) / ((w / h) * VIEW.tanF) + 1) / 2 * w, (1 - (P[1] / -P[2]) / VIEW.tanF) / 2 * h];
  const occluded = (P) => {
    const len = Math.hypot(...P), u = P.map((x) => x / len);
    const bb = u[0] * C[0] + u[1] * C[1] + u[2] * C[2];
    const disc = bb * bb - (C[0] ** 2 + C[1] ** 2 + C[2] ** 2 - 1);
    if (disc < 0) return false;
    return bb - Math.sqrt(disc) < len - 1e-3;
  };

  function render(now, scrollY, still) {
    const secs = still ? 0 : (now - t0) / 1000;
    const date = new Date();
    const sun = subsolar(date);
    const lonC = startLon + secs * ORBIT_DEG_PER_S + scrollY * SCROLL_DEG_PER_PX;
    const M = rotation(lonC, VIEW.lat, VIEW.roll);
    const S = body(sun.lat, sun.lon);
    fade = still ? 1 : Math.min(1, fade + 0.035);

    gl.uniformMatrix3fv(U.M, true, M);
    gl.uniform3fv(U.C, C);
    gl.uniform3fv(U.S, S);
    gl.uniform1f(U.aspect, w / h);
    gl.uniform1f(U.tanF, VIEW.tanF);
    gl.uniform1f(U.cloudShift, secs * 0.0009);
    gl.uniform1f(U.fade, fade);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (now - lastStatus > 20000 || !openState.size) {
      openState = new Map(ex.map((e) => [e.id, status(e, date).open]));
      lastStatus = now;
    }
    drawOverlay(M, secs, fade);
  }

  function toWorld(nb, alt = 0) {
    const nw = applyT(M_last, nb);
    return [C[0] + nw[0] * (1 + alt), C[1] + nw[1] * (1 + alt), C[2] + nw[2] * (1 + alt)];
  }
  let M_last = rotation(0, 0, 0);

  function drawOverlay(M, secs, alpha) {
    M_last = M;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = alpha;
    // capital flows: a faint great-circle arc with a bright pulse running along it
    for (const r of routes) {
      const live = openState.get(r.a.id) || openState.get(r.b.id);
      const pts = [];
      for (let i = 0; i <= 40; i++) {
        const tt = i / 40;
        const nb = norm(slerp(r.a.n, r.b.n, tt));
        const P = toWorld(nb, Math.sin(Math.PI * tt) * 0.09);
        pts.push({ P, vis: !occluded(P), xy: project(P) });
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = live ? 'rgba(163,196,232,0.22)' : 'rgba(163,196,232,0.09)';
      ctx.beginPath();
      let pen = false;
      for (const p of pts) {
        if (!p.vis) { pen = false; continue; }
        if (pen) ctx.lineTo(p.xy[0], p.xy[1]); else ctx.moveTo(p.xy[0], p.xy[1]);
        pen = true;
      }
      ctx.stroke();
      const head = (secs * r.speed + r.phase) % 1;
      for (let k = 0; k < 8; k++) {
        const tt = head - k * 0.012;
        if (tt < 0) continue;
        const i = Math.min(39, Math.floor(tt * 40));
        const f = tt * 40 - i;
        const A = pts[i], B = pts[i + 1];
        if (!A.vis || !B.vis) continue;
        const x = A.xy[0] + (B.xy[0] - A.xy[0]) * f, y = A.xy[1] + (B.xy[1] - A.xy[1]) * f;
        ctx.fillStyle = `rgba(${live ? '255,236,205' : '190,210,235'},${(1 - k / 8) * (live ? 0.9 : 0.45)})`;
        ctx.beginPath(); ctx.arc(x, y, (live ? 1.9 : 1.3) * (1 - k / 10), 0, Math.PI * 2); ctx.fill();
      }
    }
    // exchanges: lit and pulsing while they trade
    ctx.font = '500 9px Inter, system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    for (const e of ex) {
      const P = toWorld(e.n, 0.002);
      const nw = applyT(M, e.n);
      const facing = -(nw[0] * P[0] + nw[1] * P[1] + nw[2] * P[2]) / Math.hypot(...P);
      if (facing < 0.05) continue;
      const [x, y] = project(P);
      const open = openState.get(e.id);
      const k = Math.min(1, facing * 3);
      if (open) {
        const ph = (((secs * 0.8 + e.lon / 90) % 1) + 1) % 1;
        ctx.strokeStyle = `rgba(127,224,168,${(1 - ph) * 0.7 * k})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, 3 + ph * 14, 0, Math.PI * 2); ctx.stroke();
        const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
        g.addColorStop(0, `rgba(160,240,190,${0.55 * k})`); g.addColorStop(1, 'rgba(160,240,190,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = open ? `rgba(200,255,220,${k})` : `rgba(220,230,245,${0.55 * k})`;
      ctx.beginPath(); ctx.arc(x, y, open ? 2.4 : 1.7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = open ? `rgba(220,255,232,${0.85 * k})` : `rgba(200,210,225,${0.45 * k})`;
      ctx.fillText(e.short, x + 7, y - 6);
    }
    ctx.globalAlpha = 1;
  }

  return { render, resize: size, canvas };
}
