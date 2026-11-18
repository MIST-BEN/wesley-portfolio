/* Wan Wenxuan — edition five motion layer.
   WebGL aurora + canvas starfield with scroll-velocity warp, a 3D name ring,
   scroll-linked window tilt, blur-in headings, scrubbed text and a section dock.
   Respects prefers-reduced-motion and pauses when the tab is hidden. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const small = matchMedia('(max-width: 720px)');
  const root = document.documentElement;
  root.classList.add('js');
  const lang = () => (root.lang === 'en' ? 'en' : 'zh');

  /* ---------------- palettes per section ---------------- */
  const PALETTES = {
    blue:   [[0.20, 0.36, 0.95], [0.62, 0.78, 1.00], [0.30, 0.22, 0.70]],
    violet: [[0.42, 0.28, 0.95], [0.85, 0.66, 1.00], [0.18, 0.20, 0.62]],
    ember:  [[0.98, 0.42, 0.12], [1.00, 0.74, 0.42], [0.55, 0.16, 0.08]],
    rose:   [[0.96, 0.26, 0.38], [1.00, 0.62, 0.58], [0.45, 0.10, 0.22]],
  };
  const pal = JSON.parse(JSON.stringify(PALETTES[document.body.dataset.sky] || PALETTES.blue));
  let target = PALETTES[document.body.dataset.sky] || PALETTES.blue;

  /* ---------------- aurora (WebGL) ---------------- */
  const sky = document.getElementById('sky');
  let gl = null, prog = null, uni = {};
  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FRAG = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;uniform float warp;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
float fb2(vec2 p){return .62*n(p)+.38*n(p*2.1+vec2(3.1,7.7));}
void main(){
  vec2 uv=gl_FragCoord.xy/r;float asp=r.x/r.y;vec2 p=vec2(uv.x*asp,uv.y)+m*.03;
  float a=0.;
  for(int i=0;i<6;i++){
    float fi=float(i);
    float cx=(fi+.5)/6.*asp+.22*sin(t*.05+fi*1.9)+.35*(fb2(vec2(p.y*.7+fi*3.1,t*.04))-.5);
    float w=.035+.06*fract(sin(fi*12.9898)*43758.5453);
    float d=p.x-cx;
    float band=exp(-d*d/(w*w));
    float streak=.45+.75*fb2(vec2(p.x*22.+fi*7.,p.y*1.2-t*.07));
    float top=.35+.3*fract(sin(fi*78.233)*12.)+.08*sin(t*.11+fi);
    float vert=smoothstep(-.05,.5,uv.y)*smoothstep(top+.7,top,uv.y);
    a+=band*streak*vert*(.55+.45*sin(t*.17+fi*2.3));
  }
  float neb=fbm(p*1.4+vec2(t*.01,-t*.015));
  vec3 col=mix(c1,c2,clamp(uv.y*.9+neb*.5-.25,0.,1.))*a*.85;
  col+=c3*pow(neb,2.6)*.55;
  col+=c1*.12*exp(-pow((uv.y-.05)*3.,2.));
  col*=1.+warp*.6;
  col*=smoothstep(1.25,.25,length((uv-vec2(.5,.45))*vec2(1.,1.2)));
  col+=vec3(.010,.011,.020);
  gl_FragColor=vec4(col,1.);
}`;
  function initGL() {
    try { gl = sky.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }); } catch { gl = null; }
    if (!gl) { root.classList.add('no-webgl'); return; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
    } catch (e) { gl = null; root.classList.add('no-webgl'); return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['r', 't', 'c1', 'c2', 'c3', 'warp', 'm'].forEach(k => (uni[k] = gl.getUniformLocation(prog, k)));
  }

  /* ---------------- stars (2D canvas) ---------------- */
  const starCanvas = document.getElementById('stars');
  const ctx = starCanvas.getContext('2d');
  let W = 0, H = 0, DPR = 1, stars = [];
  function makeStars() {
    const count = small.matches ? 380 : 900;
    stars = Array.from({ length: count }, () => ({ x: (Math.random() * 2 - 1) * 1.6, y: (Math.random() * 2 - 1) * 1.1, z: Math.random() * 0.95 + 0.05, tw: Math.random() * 6.28, s: Math.random() }));
  }
  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 1.75);
    W = innerWidth; H = innerHeight;
    starCanvas.width = Math.round(W * DPR); starCanvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (gl) { const q = small.matches ? 0.36 : 0.45; sky.width = Math.round(W * q); sky.height = Math.round(H * q); gl.viewport(0, 0, sky.width, sky.height); }
    layoutRing();
  }

  /* ---------------- motion state ---------------- */
  let time = 0, last = performance.now(), vel = 0, lastY = scrollY, mx = 0, my = 0, tmx = 0, tmy = 0;
  addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; tmx = e.clientX / W - 0.5; tmy = e.clientY / H - 0.5; }, { passive: true });

  function drawStars(dt) {
    ctx.clearRect(0, 0, W, H);
    const f = Math.max(W, H) * 0.55, cx = W / 2 + mx * 24, cy = H * 0.46 + my * 18;
    const speed = (reduced.matches ? 0 : 0.012 + vel * 0.9) * dt;
    const streak = reduced.matches ? 0 : Math.min(0.3, vel * 1.1);
    const tint = pal[1];
    const col = `rgb(${Math.round(255 - (255 - tint[0] * 255) * 0.18)},${Math.round(255 - (255 - tint[1] * 255) * 0.18)},${Math.round(255 - (255 - tint[2] * 255) * 0.18)})`;
    ctx.fillStyle = col; ctx.strokeStyle = col;
    const streaking = streak > 0.02;
    for (const s of stars) {
      s.z -= speed;
      if (s.z < 0.04) { s.z = 1; s.x = (Math.random() * 2 - 1) * 1.6; s.y = (Math.random() * 2 - 1) * 1.1; }
      const px = cx + (s.x / s.z) * f * 0.35, py = cy + (s.y / s.z) * f * 0.35;
      if (px < -50 || px > W + 50 || py < -50 || py > H + 50) continue;
      const near = 1 - s.z;
      const tw = 0.65 + 0.35 * Math.sin(time * (1.2 + s.s * 2) + s.tw);
      ctx.globalAlpha = Math.min(1, (0.18 + near * 0.95) * tw);
      if (streaking) {
        const z2 = s.z + streak * 0.35;
        ctx.lineWidth = 0.5 + near * 1.1;
        ctx.beginPath(); ctx.moveTo(cx + (s.x / z2) * f * 0.35, cy + (s.y / z2) * f * 0.35); ctx.lineTo(px, py); ctx.stroke();
      } else {
        const r = 0.35 + near * near * 1.6;
        ctx.fillRect(px - r / 2, py - r / 2, r, r);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawSky() {
    if (!gl) return;
    gl.uniform2f(uni.r, sky.width, sky.height); gl.uniform1f(uni.t, time);
    gl.uniform3fv(uni.c1, pal[0]); gl.uniform3fv(uni.c2, pal[1]); gl.uniform3fv(uni.c3, pal[2]);
    gl.uniform1f(uni.warp, vel); gl.uniform2f(uni.m, mx, -my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /* ---------------- 3D name ring ---------------- */
  const rings = [...document.querySelectorAll('[data-ring]')];
  let ringR = 300;
  function layoutRing() {
    if (!rings.length) return;
    const fs = parseFloat(getComputedStyle(rings[0]).fontSize) || 100;
    const n = rings[0].children.length;
    ringR = Math.max(fs * n * 0.6 / (Math.PI * 2), Math.min(W * 0.3, 440));
  }
  const heroEl = document.querySelector('.hero');
  function drawRing() {
    if (!rings.length || (heroEl && heroEl.getBoundingClientRect().bottom < 0)) return;
    const n = rings[0].children.length;
    const base = (reduced.matches ? 0.35 : time * 0.16) + scrollY * 0.0016 + mx * 0.5;
    rings.forEach(ring => {
      [...ring.children].forEach((el, i) => {
        const th = base + (i / n) * Math.PI * 2;
        const x = Math.sin(th) * ringR, z = Math.cos(th) * ringR;
        const front = (Math.cos(th) + 1) / 2;
        el.style.transform = `translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${th.toFixed(4)}rad)`;
        el.style.opacity = (0.03 + Math.pow(front, 3) * 0.97).toFixed(3);
      });
    });
  }

  /* ---------------- section palette + dock label ---------------- */
  const sections = [...document.querySelectorAll('[data-sky][data-name-zh]')];
  const dockLabel = document.getElementById('dock-label');
  let current = null;
  function pickSection() {
    const mid = innerHeight * 0.5;
    let best = sections[0];
    for (const s of sections) { const r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid * 0.2) best = s; }
    if (best && best !== current) {
      current = best;
      target = PALETTES[best.dataset.sky] || PALETTES.blue;
      if (dockLabel) { dockLabel.textContent = best.dataset['name' + (lang() === 'en' ? 'En' : 'Zh')]; dockLabel.parentElement.classList.remove('flash'); void dockLabel.offsetWidth; dockLabel.parentElement.classList.add('flash'); }
    }
  }
  document.addEventListener('portfolio:language', () => { current = null; pickSection(); });

  /* ---------------- scroll-linked window tilt ---------------- */
  const tilts = [...document.querySelectorAll('[data-tilt]')];
  function drawTilts() {
    for (const el of tilts) {
      if (reduced.matches) { el.style.transform = ''; el.style.opacity = ''; continue; }
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) continue;
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.85)));
      const e = 1 - Math.pow(1 - p, 3);
      el.style.transform = `perspective(1600px) translateY(${((1 - e) * 80).toFixed(1)}px) rotateX(${((1 - e) * 26).toFixed(2)}deg) scale(${(0.88 + e * 0.12).toFixed(4)})`;
      el.style.opacity = (0.25 + e * 0.75).toFixed(3);
    }
  }

  /* ---------------- word-aware segmentation (keeps Chinese words and punctuation together) ---------------- */
  const CLOSE = /^[，。、！？：；）」』”’》,.!?:;)\]·—]+$/;
  const OPEN = /^[（「『“‘《(\[]+$/;
  let segZh = null, segEn = null;
  try { segZh = new Intl.Segmenter('zh', { granularity: 'word' }); segEn = new Intl.Segmenter('en', { granularity: 'word' }); } catch { /* older browsers fall back below */ }
  function words(text) {
    const out = []; let pending = '';
    const seg = lang() === 'en' ? segEn : segZh;
    const pieces = seg ? [...seg.segment(text)].map(x => x.segment) : (lang() === 'en' ? text.split(/(\s+)/) : [...text]);
    for (const piece of pieces) {
      if (!piece) continue;
      if (/^\s+$/.test(piece)) { out.push(' '); continue; }
      if (CLOSE.test(piece) && out.length && out[out.length - 1] !== ' ') { out[out.length - 1] += piece; continue; }
      if (OPEN.test(piece)) { pending += piece; continue; }
      if (lang() === 'en' && out.length && out[out.length - 1] !== ' ' && !/^\s/.test(piece) && /[\w’'-]$/.test(out[out.length - 1]) && /^[\w’'-]/.test(piece)) { out[out.length - 1] += pending + piece; pending = ''; continue; }
      out.push(pending + piece); pending = '';
    }
    if (pending) out.push(pending);
    return out;
  }
  function wrapWords(el) {
    const text = el.textContent; if (!text.trim()) return;
    el.textContent = '';
    for (const w of words(text)) {
      if (w === ' ') { el.append(document.createTextNode(' ')); continue; }
      const s = document.createElement('span'); s.className = 'wd'; s.textContent = w; el.append(s);
    }
  }
  const WORD_TARGETS = '.hero-title [data-zh], .project-line, .section-head p, .feature-title, .timeline h3 [data-zh], .contact-note, .work-intro p, .faq-list summary [data-zh], .points h3, .case-lead, .chapter-text, .about-grid > p, .feature p:not([class]), .j-note, .faq-list details p';
  function wrapAllWords() {
    document.querySelectorAll(WORD_TARGETS).forEach(el => {
      const target = el.matches('[data-zh]') ? el : (el.querySelector('[data-zh]') || el);
      if (target.querySelector('.wd')) return;
      wrapWords(target);
    });
  }

  /* ---------------- blur-in headings (split into characters) ---------------- */
  function splitText(el) {
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    let k = 0;
    for (const w of words(text)) {
      if (w === ' ') { el.append(document.createTextNode(' ')); continue; }
      const word = document.createElement('span'); word.className = 'w'; word.setAttribute('aria-hidden', 'true');
      for (const ch of [...w]) {
        const c = document.createElement('span'); c.className = 'ch'; c.textContent = ch; c.style.setProperty('--d', (k++ * 26) + 'ms'); word.append(c);
      }
      el.append(word);
    }
  }
  const splitTargets = () => [...document.querySelectorAll('[data-split]')].flatMap(h => { const l = [...h.querySelectorAll('[data-zh]')]; return l.length ? l : [h]; });
  function splitAll() { splitTargets().forEach(splitText); }
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -12% 0px' }) : null;
  function observeSplits() {
    document.querySelectorAll('[data-split]').forEach(h => {
      if (reduced.matches || !io) h.classList.add('in'); else if (!h.classList.contains('in')) io.observe(h);
    });
  }

  /* ---------------- scrubbed paragraph ---------------- */
  const scrubEls = [...document.querySelectorAll('[data-scrub]')];
  const scrubs = () => scrubEls;
  function splitScrub() {
    scrubs().forEach(p => {
      const el = p.querySelector('[data-zh]') || p;
      const text = el.textContent; el.setAttribute('aria-label', text); el.textContent = '';
      const parts = words(text);
      parts.forEach(part => { if (part === ' ') { el.append(document.createTextNode(' ')); return; } const s = document.createElement('span'); s.className = 'sc'; s.setAttribute('aria-hidden', 'true'); s.textContent = part; el.append(s); });
    });
  }
  function drawScrub() {
    scrubs().forEach(p => {
      const spans = p.querySelectorAll('.sc'); if (!spans.length) return;
      const r = p.getBoundingClientRect();
      const prog = reduced.matches ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const lit = prog * spans.length;
      spans.forEach((s, i) => { s.style.opacity = (0.16 + 0.84 * Math.min(1, Math.max(0, lit - i))).toFixed(2); });
    });
  }

  /* ---------------- timeline fill ---------------- */
  const tl = document.querySelector('[data-timeline]');
  function drawTimeline() {
    if (!tl) return;
    const r = tl.getBoundingClientRect();
    if (r.bottom < -100 || r.top > innerHeight + 100) return;
    const p = reduced.matches ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
    tl.style.setProperty('--fill', p.toFixed(3));
    tl.querySelectorAll('li').forEach(li => { const lr = li.getBoundingClientRect(); li.classList.toggle('lit', lr.top < innerHeight * 0.6 || reduced.matches); });
  }

  /* ---------------- header ---------------- */
  const header = document.querySelector('.site-header');

  /* ---------------- loop ---------------- */
  let running = true, frameN = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;
    const dy = Math.abs(scrollY - lastY); lastY = scrollY;
    vel += (Math.min(1, dy / Math.max(1, innerHeight) * 4.5) - vel) * (dy ? 0.06 : 0.1);
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) pal[i][j] += (target[i][j] - pal[i][j]) * 0.035;
    if ((frameN++ & 7) === 0) { const c = a => a.map(v => Math.round(Math.min(1, v) * 255)).join(','); root.style.setProperty('--sky1', c(pal[0])); root.style.setProperty('--sky2', c(pal[1])); }
    if ((frameN & 1) === 0 || vel > 0.05) drawSky();
    drawStars(dt); drawRing(); drawTilts(); drawScrub(); drawTimeline(); pickSection();
    header && header.classList.toggle('is-scrolled', scrollY > 10);
    if (running) requestAnimationFrame(frame);
  }
  function start() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
  function stop() { running = false; }
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  initGL(); makeStars(); resize();
  splitAll(); splitScrub(); wrapAllWords(); observeSplits();
  document.addEventListener('portfolio:language', () => { splitAll(); splitScrub(); wrapAllWords(); observeSplits(); layoutRing(); });
  let rz = 0; addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { resize(); }); });
  small.addEventListener('change', () => { makeStars(); resize(); });
  reduced.addEventListener('change', observeSplits);
  requestAnimationFrame(frame);
})();
