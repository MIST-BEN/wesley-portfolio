'use strict';
/* Edition seven motion — "成型 / Forming".
   Molten-metal hero shader, type that cools from white-hot, sparks, a furnace intro,
   a pinned process line, a brushed nameplate and a temperature gauge that cools as you read. */
(() => {
  const root = document.documentElement;
  // calm: the visitor switched motion off (toggle in the header).
  // gentle: the OS asks for reduced motion - keep heat, light and sparks; drop smooth-scroll and parallax.
  const reduce = root.classList.contains('calm');
  const gentle = root.classList.contains('gentle');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const easeOut = k => 1 - Math.pow(1 - k, 3);
  const isZh = () => root.lang.startsWith('zh');
  const mouse = {x: innerWidth * .6, y: innerHeight * .5, seen: false, speed: 0};

  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    mouse.speed = Math.min(80, mouse.speed + Math.hypot(e.clientX - mouse.x, e.clientY - mouse.y));
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.seen = true;
  }, {passive: true});

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && !gentle && typeof window.Lenis === 'function') {
    try { lenis = new window.Lenis({lerp: .09, smoothWheel: true}); } catch { lenis = null; }
  }
  document.addEventListener('portfolio:menu', e => { if (lenis) e.detail ? lenis.stop() : lenis.start(); });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.getAttribute('href'), location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(url.hash === '#top' ? 0 : target, {duration: 1.5});
    else target.scrollIntoView({behavior: reduce || gentle ? 'auto' : 'smooth'});
    history.replaceState(null, '', url.hash);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({preventScroll: true});
  });

  /* ---------- cast type: split into characters, grouped by word ---------- */
  const casts = $$('[data-cast]');
  function splitCast(el) {
    let i = 0;
    $$('.line', el).forEach(line => {
      const text = line.textContent;
      const frag = document.createDocumentFragment();
      let words = text.split(/(\s+)/);
      if (isZh() && 'Segmenter' in Intl) {
        words = [];
        for (const part of new Intl.Segmenter('zh', {granularity: 'word'}).segment(text)) {
          if (!part.isWordLike && words.length && !/^\s+$/.test(part.segment)) words[words.length - 1] += part.segment;
          else words.push(part.segment);
        }
      }
      words.forEach(w => {
        if (!w) return;
        if (/^\s+$/.test(w)) { const sp = document.createElement('span'); sp.className = 'c sp'; sp.style.setProperty('--i', i++); frag.append(sp); return; }
        const wd = document.createElement('span'); wd.className = 'wd'; wd.style.cssText = 'display:inline-block;white-space:nowrap';
        [...w].forEach(ch => { const c = document.createElement('span'); c.className = 'c'; c.textContent = ch; c.style.setProperty('--i', i++); wd.append(c); });
        frag.append(wd);
      });
      line.replaceChildren(frag);
      line.setAttribute('aria-label', text);
    });
  }
  casts.forEach(splitCast);
  const castNow = casts.filter(c => !c.hasAttribute('data-cast-on-view'));
  castNow.forEach(c => c.classList.add('go'));

  /* ---------- furnace intro ---------- */
  const furnace = $('.furnace');
  let opened = false;
  function openFurnace() {
    if (opened || !furnace) return; opened = true;
    furnace.classList.add('open');
    requestAnimationFrame(() => requestAnimationFrame(() => furnace.classList.add('go')));
    root.classList.remove('hold');
    burst(innerWidth * .5, innerHeight * .98, 70, -1);
    setTimeout(() => root.classList.remove('intro'), 1100);
  }
  if (root.classList.contains('intro') && furnace) {
    const tEl = $('[data-temp]'), bar = $('[data-temp-bar]'), st = $('[data-temp-state]');
    const labels = isZh() ? ['预热', '熔化', '出炉'] : ['PREHEAT', 'MELTING', 'POUR'];
    const start = performance.now(), dur = 1500;
    const tick = now => {
      const k = clamp((now - start) / dur), e = easeOut(k);
      const temp = Math.round(20 + e * 1518);
      tEl.textContent = temp; bar.style.transform = `scaleX(${e})`;
      furnace.style.setProperty('--g', e.toFixed(3));
      st.textContent = labels[k < .45 ? 0 : k < .95 ? 1 : 2];
      if (k < 1) requestAnimationFrame(tick); else setTimeout(openFurnace, 260);
    };
    requestAnimationFrame(tick);
    setTimeout(openFurnace, 2600);
  } else root.classList.remove('hold');

  /* ---------- sparks ---------- */
  const sparkCanvas = $('.sparks');
  const sctx = sparkCanvas?.getContext('2d');
  const parts = [];
  let sparkW = 0, sparkH = 0, sdpr = 1;
  function sizeSparks() {
    if (!sparkCanvas) return;
    sdpr = Math.min(devicePixelRatio || 1, 2); sparkW = innerWidth; sparkH = innerHeight;
    sparkCanvas.width = sparkW * sdpr; sparkCanvas.height = sparkH * sdpr;
  }
  sizeSparks(); window.addEventListener('resize', sizeSparks);
  function burst(x, y, n = 26, up = 0) {
    if (reduce || !sctx) return;
    for (let i = 0; i < n; i++) {
      const a = up ? -Math.PI / 2 + (Math.random() - .5) * 1.4 : Math.random() * Math.PI * 2;
      const v = (up ? 9 : 3) + Math.random() * (up ? 14 : 9);
      parts.push({x, y, px: x, py: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (up ? 0 : 3), life: 1, decay: .012 + Math.random() * .022, w: .8 + Math.random() * 1.6});
    }
    if (parts.length > 600) parts.splice(0, parts.length - 600);
  }
  document.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('input,textarea,select,dialog')) return;
    burst(e.clientX, e.clientY, e.target.closest('a,button') ? 18 : 30);
  });
  let lastTrail = 0;
  document.addEventListener('pointermove', e => {
    if (!fine || reduce) return;
    const hot = e.target.closest('[data-spark], .btn.hot');
    const now = performance.now();
    if (hot && now - lastTrail > 30) { lastTrail = now; burst(e.clientX, e.clientY, 3); }
  });
  function drawSparks() {
    if (!sctx) return;
    sctx.setTransform(sdpr, 0, 0, sdpr, 0, 0);
    sctx.clearRect(0, 0, sparkW, sparkH);
    if (!parts.length) return;
    sctx.globalCompositeOperation = 'lighter';
    sctx.lineCap = 'round';
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.px = p.x; p.py = p.y;
      p.vx *= .97; p.vy = p.vy * .97 + .45;
      p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      if (p.life <= 0 || p.y > sparkH + 40) { parts.splice(i, 1); continue; }
      const l = p.life;
      sctx.strokeStyle = `rgba(255,${Math.round(110 + l * 140)},${Math.round(30 + l * 150)},${Math.min(1, l * 1.4)})`;
      sctx.lineWidth = p.w * (0.6 + l);
      sctx.beginPath(); sctx.moveTo(p.px, p.py); sctx.lineTo(p.x, p.y); sctx.stroke();
    }
    sctx.globalCompositeOperation = 'source-over';
  }

  /* ---------- molten hero shader ---------- */
  const hero = $('[data-hero]');
  const molten = $('[data-molten]');
  let gl = null, prog = null, U = {}, heroOn = true, mh = 0;
  function initMolten() {
    if (!molten || reduce) return;
    gl = molten.getContext('webgl', {antialias: false, alpha: false, premultipliedAlpha: false});
    if (!gl) return;
    const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    const fs = `precision highp float;uniform vec2 r;uniform float t;uniform vec2 m;uniform float mh;
      float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p+.17;a*=.5;}return v;}
      float field(vec2 p){vec2 q=vec2(fbm(p+vec2(0.,t*.05)),fbm(p+vec2(5.2,1.3)-vec2(t*.04,0.)));return fbm(p+2.4*q+vec2(t*.02,-t*.015));}
      void main(){
        vec2 uv=gl_FragCoord.xy/r.y;vec2 mp=m/r.y;float d=length(uv-mp);
        vec2 p=uv*2.3;
        p+=(uv-mp)*mh*.4*exp(-d*5.)*sin(d*32.-t*5.);
        float h=field(p);
        float e=.01;
        vec2 g=vec2(field(p+vec2(e,0.))-h,field(p+vec2(0.,e))-h)/e;
        vec3 n=normalize(vec3(-g*.55,1.));
        vec3 L=normalize(vec3(-.5,.65,.6));
        vec3 R=reflect(vec3(0.,0.,-1.),n);
        float env=smoothstep(-.15,.95,R.y*.8+R.x*.3+.25);
        float sp=pow(max(dot(reflect(-L,n),vec3(0.,0.,1.)),0.),36.);
        vec3 metal=mix(vec3(.03,.032,.04),vec3(.40,.42,.46),env*env)+sp*vec3(1.,.94,.86)*.85;
        float vein=smoothstep(.016,0.,abs(h-.57))*.75;
        float pool=smoothstep(.355,.285,h);
        float heat=(vein+pool*.85)*(.55+.45*smoothstep(.2,1.4,uv.x))+mh*exp(-d*4.6)*1.1;
        heat=clamp(heat,0.,1.35);
        vec3 glow=vec3(1.,.27,.06)*smoothstep(0.,.5,heat)*1.1+vec3(0.,.36,.12)*smoothstep(.35,.9,heat)+vec3(0.,.2,.36)*smoothstep(.8,1.35,heat);
        vec3 col=metal*(1.-clamp(heat,0.,1.)*.85)+glow;
        col*=.5+.5*smoothstep(1.5,.25,length(uv-vec2(r.x/r.y*.68,.42)));
        gl_FragColor=vec4(col,1.);
      }`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl = null; return; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['r', 't', 'm', 'mh'].forEach(k => { U[k] = gl.getUniformLocation(prog, k); });
  }
  initMolten();
  if (hero && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => { heroOn = e.isIntersecting; }).observe(hero);
  const mpos = {x: innerWidth * .62, y: innerHeight * .45};
  function drawMolten(time) {
    if (!gl || !heroOn) return;
    const scale = innerWidth < 720 ? .45 : .5;
    const w = Math.round(molten.clientWidth * scale), h = Math.round(molten.clientHeight * scale);
    if (molten.width !== w || molten.height !== h) { molten.width = w; molten.height = h; }
    gl.viewport(0, 0, w, h);
    const r = molten.getBoundingClientRect();
    mpos.x = lerp(mpos.x, mouse.x, .08); mpos.y = lerp(mpos.y, mouse.y, .08);
    mh = lerp(mh, clamp(mouse.speed / 60) * (mouse.seen ? 1 : 0) + (mouse.seen ? .35 : 0), .06);
    gl.uniform2f(U.r, w, h); gl.uniform1f(U.t, time / (gentle ? 2200 : 1000));
    gl.uniform2f(U.m, (mpos.x - r.left) * scale, (r.bottom - mpos.y) * scale);
    gl.uniform1f(U.mh, mh);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /* ---------- re-heat cast letters near the pointer ---------- */
  const heat = new WeakMap();
  function heatLetters() {
    if (!fine || reduce || !mouse.seen) return;
    casts.forEach(cast => {
      const r = cast.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      $$('.c', cast).forEach(c => {
        const b = c.getBoundingClientRect();
        const d = Math.hypot(mouse.x - (b.left + b.width / 2), mouse.y - (b.top + b.height / 2));
        const target = clamp(1 - d / 170) * .95;
        const cur = heat.get(c) || 0;
        const next = target > cur ? lerp(cur, target, .25) : lerp(cur, target, .025);
        if (Math.abs(next - cur) < .001 && next < .002) { if (cur) { heat.set(c, 0); c.style.removeProperty('--hv'); } return; }
        heat.set(c, next); c.style.setProperty('--hv', next.toFixed(3));
      });
    });
  }

  /* ---------- reveals ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.hasAttribute('data-cast-on-view')) e.target.classList.add('go');
    io.unobserve(e.target);
  }), {threshold: .15, rootMargin: '0px 0px -8% 0px'}) : null;
  const revealables = $$('[data-reveal], .sheet-fig, [data-where], [data-cast-on-view]');
  if (!io || reduce) revealables.forEach(el => { el.classList.add('in'); if (el.hasAttribute('data-cast-on-view')) el.classList.add('go'); });
  else revealables.forEach(el => io.observe(el));

  /* ---------- tilt ---------- */
  if (fine && !reduce) $$('[data-tilt]').forEach(fig => {
    const win = $('.window', fig); if (!win) return;
    fig.addEventListener('pointermove', e => {
      const r = fig.getBoundingClientRect();
      win.style.setProperty('--ty', (((e.clientX - r.left) / r.width - .5) * 9).toFixed(2) + 'deg');
      win.style.setProperty('--tx', (-((e.clientY - r.top) / r.height - .5) * 7).toFixed(2) + 'deg');
    });
    fig.addEventListener('pointerleave', () => { win.style.setProperty('--ty', '0deg'); win.style.setProperty('--tx', '0deg'); });
  });

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduce) $$('.btn, .tbtn').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.translate = `${((e.clientX - r.left - r.width / 2) * .22).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * .3).toFixed(1)}px`;
    });
    el.addEventListener('pointerleave', () => { el.style.translate = ''; });
  });

  /* ---------- scroll-lit paragraph that burns as it lights ---------- */
  const scrub = $('[data-scrub]');
  let words = [], lit = -1;
  function splitScrub() {
    if (!scrub) return;
    const holder = $('[data-zh]', scrub);
    const text = holder.textContent;
    const phrases = ((isZh() ? scrub.dataset.hlZh : scrub.dataset.hlEn) || '').split('|').filter(Boolean);
    const segs = []; let rest = text;
    while (rest.length) {
      let best = -1, ph = '';
      phrases.forEach(p => { const i = rest.indexOf(p); if (i >= 0 && (best < 0 || i < best)) { best = i; ph = p; } });
      if (best < 0) { segs.push([rest, false]); break; }
      if (best > 0) segs.push([rest.slice(0, best), false]);
      segs.push([ph, true]); rest = rest.slice(best + ph.length);
    }
    const nodes = []; words = [];
    const add = (s, hl) => { const el = document.createElement('span'); el.className = hl ? 'w hl' : 'w'; el.textContent = s; words.push(el); nodes.push(el); };
    const seg = isZh() && 'Segmenter' in Intl ? new Intl.Segmenter('zh', {granularity: 'word'}) : null;
    segs.forEach(([s, hl]) => {
      if (seg) for (const part of seg.segment(s)) {
        if (/^\s+$/.test(part.segment)) nodes.push(document.createTextNode(part.segment));
        else if (!part.isWordLike && words.length) words[words.length - 1].textContent += part.segment;
        else add(part.segment, hl);
      } else s.split(/(\s+)/).forEach(pc => { if (!pc) return; if (/^\s+$/.test(pc)) nodes.push(document.createTextNode(pc)); else add(pc, hl); });
    });
    holder.replaceChildren(...nodes); lit = -1;
    if (reduce) words.forEach(w => w.classList.add('on'));
  }
  splitScrub();
  function updateScrub() {
    if (!scrub || !words.length || reduce) return;
    const r = scrub.getBoundingClientRect();
    if (r.bottom < -100 || r.top > innerHeight + 100) return;
    const n = Math.round(clamp((innerHeight * .78 - r.top) / (r.height + innerHeight * .25)) * words.length);
    if (n === lit) return; lit = n;
    words.forEach((w, i) => { w.classList.toggle('on', i < n); w.classList.toggle('burn', i < n && i >= n - 3); });
  }

  /* ---------- process: pinned horizontal travel ---------- */
  const proc = $('[data-process]'), track = $('[data-track]'), blob = $('[data-blob]');
  let lastQ = 0;
  function updateProcess() {
    if (!proc || !track || innerWidth <= 820) return;
    const r = proc.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const q = clamp(-r.top / (r.height - innerHeight));
    const dist = track.scrollWidth - innerWidth;
    track.style.transform = `translate3d(${(-q * dist).toFixed(1)}px,0,0)`;
    if (blob) {
      const v = q - lastQ; lastQ = q;
      blob.style.left = (q * dist + innerWidth * .5).toFixed(1) + 'px';
      blob.style.setProperty('--sx', (1 + Math.min(Math.abs(v) * 60, 1.4)).toFixed(3));
      blob.style.setProperty('--trail', (60 + Math.min(Math.abs(v) * 9000, 260)).toFixed(0) + 'px');
    }
  }

  /* ---------- nameplate ---------- */
  const plateWrap = $('[data-plate]'), plate = plateWrap && $('.plate', plateWrap);
  const pl = {rx: 6, ry: -10};
  function updatePlate() {
    if (!plate || reduce || gentle) return;
    const r = plateWrap.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const nx = clamp((mouse.x - (r.left + r.width / 2)) / innerWidth * 2, -1, 1);
    const ny = clamp((mouse.y - (r.top + r.height / 2)) / innerHeight * 2, -1, 1);
    pl.rx = lerp(pl.rx, 6 - ny * 12, .08); pl.ry = lerp(pl.ry, -10 + nx * 22, .08);
    plate.style.setProperty('--rx', pl.rx.toFixed(2) + 'deg'); plate.style.setProperty('--ry', pl.ry.toFixed(2) + 'deg');
    plate.style.setProperty('--a', (115 + nx * 40).toFixed(1) + 'deg');
    plate.style.setProperty('--gx', (50 + nx * 40).toFixed(1) + '%'); plate.style.setProperty('--gy', (40 + ny * 40).toFixed(1) + '%');
  }

  /* ---------- journey log ---------- */
  const logEl = $('[data-log]'), fill = $('[data-log-fill]'), entries = $$('.entry');
  function updateLog() {
    if (!logEl || !fill) return;
    const r = logEl.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = reduce ? 1 : clamp((innerHeight * .6 - r.top) / r.height);
    fill.style.setProperty('--fill', p.toFixed(4));
    const line = r.top + p * r.height;
    entries.forEach(en => en.classList.toggle('lit', en.getBoundingClientRect().top + 14 <= line + 2));
  }

  /* ---------- Chongqing ridges parallax ---------- */
  const ridges = $('.ridges'), where = $('[data-where]');
  const rp = {x: 0, y: 0};
  function updateRidges() {
    if (!ridges || reduce || gentle) return;
    const r = where.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    rp.x = lerp(rp.x, (mouse.x / innerWidth - .5) * 2, .05);
    rp.y = lerp(rp.y, (mouse.y / innerHeight - .5) * 2 + (r.top / innerHeight) * .8, .05);
    ridges.style.setProperty('--px', rp.x.toFixed(3)); ridges.style.setProperty('--py', rp.y.toFixed(3));
  }

  /* ---------- hero deck parallax ---------- */
  const deckEl = $('[data-deck]'); const dp = {x: 0, y: 0};
  function updateDeck() {
    if (!deckEl || reduce || gentle || !fine) return;
    const r = deckEl.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    dp.x = lerp(dp.x, -(mouse.x / innerWidth - .5), .06); dp.y = lerp(dp.y, -(mouse.y / innerHeight - .5), .06);
    deckEl.style.setProperty('--px', dp.x.toFixed(3)); deckEl.style.setProperty('--py', dp.y.toFixed(3));
  }

  /* ---------- stacking project cards ---------- */
  const ccs = $$('.cc');
  function updateStack() {
    if (!ccs.length || reduce || innerWidth <= 900) return;
    ccs.forEach((c, i) => {
      const n = ccs[i + 1];
      const inner = c.firstElementChild;
      if (!n) { inner.style.setProperty('--cover', 0); return; }
      const a = c.getBoundingClientRect(), b = n.getBoundingClientRect();
      if (a.bottom < -50 || a.top > innerHeight) return;
      inner.style.setProperty('--cover', clamp((a.bottom - b.top) / a.height).toFixed(3));
    });
  }

  /* ---------- header, HUD, nav ---------- */
  const top = $('.top');
  const hudTemp = $('[data-hud-temp]'), hudFill = $('[data-hud-fill]'), hudState = $('[data-hud-state]'), hudSec = $('[data-hud-sec]');
  const secs = $$('[data-sec-zh]');
  let curSec = 0;
  function labelSec() {
    const s = secs[curSec]; if (!s || !hudSec) return;
    hudSec.textContent = `${String(curSec).padStart(2, '0')} / ${isZh() ? s.dataset.secZh : s.dataset.secEn}`;
  }
  if ('IntersectionObserver' in window && secs.length) {
    const sio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      curSec = secs.indexOf(e.target); labelSec();
      $$('.top-nav a').forEach(a => a.getAttribute('href') === '#' + e.target.id ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'));
    }), {rootMargin: '-45% 0px -50% 0px'});
    secs.forEach(s => sio.observe(s));
  }
  labelSec();
  let lastY = scrollY, lastTemp = -1;
  function updateChrome() {
    const y = scrollY, v = y - lastY;
    if (top && !document.body.classList.contains('menu-open')) {
      top.classList.toggle('scrolled', y > 40);
      if (y > 300 && v > 4) top.classList.add('hidden'); else if (v < -4 || y < 300) top.classList.remove('hidden');
    }
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? clamp(y / max) : 0;
    const temp = Math.round(1538 - p * 1518);
    if (temp !== lastTemp && hudTemp) {
      lastTemp = temp; hudTemp.textContent = temp;
      hudFill.style.setProperty('--p', (1 - p).toFixed(4));
      hudState.textContent = temp > 1100 ? (isZh() ? '熔融' : 'MOLTEN') : temp > 400 ? (isZh() ? '冷却中' : 'COOLING') : (isZh() ? '成型' : 'FORMED');
    }
  }

  document.addEventListener('portfolio:language', () => {
    casts.forEach(c => { splitCast(c); if (c.classList.contains('go')) { c.classList.remove('go'); void c.offsetWidth; c.classList.add('go'); } });
    splitScrub(); labelSec(); lastTemp = -1;
  });

  /* ---------- motion toggle ---------- */
  const motionBtn = $('#motion');
  function labelMotion() {
    if (!motionBtn) return;
    motionBtn.textContent = isZh() ? (reduce ? '动效 关' : '动效 开') : (reduce ? 'Motion off' : 'Motion on');
    motionBtn.setAttribute('aria-pressed', String(!reduce));
    motionBtn.setAttribute('aria-label', isZh() ? '开关页面动效' : 'Toggle page motion');
  }
  labelMotion();
  document.addEventListener('portfolio:language', labelMotion);
  motionBtn?.addEventListener('click', () => {
    try { localStorage.setItem('ww-motion', reduce ? 'on' : 'off'); } catch { /* fine */ }
    location.reload();
  });

  /* ---------- loop ---------- */
  function frame(time) {
    if (lenis) lenis.raf(time);
    updateChrome();
    drawMolten(time);
    heatLetters();
    updateScrub();
    updateProcess();
    updateDeck();
    updateStack();
    updatePlate();
    updateLog();
    updateRidges();
    drawSparks();
    mouse.speed *= .9;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
