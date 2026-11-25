'use strict';
/* Edition six motion: smooth scroll, 3D cursor, title reveals, stacking cards, marquees,
   scroll-lit text, journey filters and a WebGL globe pinned on Chongqing. */
(() => {
  // ?motion forces full animation even when the OS asks for reduced motion (handy for previews).
  const force = /[?&]motion/.test(location.search);
  if (force) document.documentElement.classList.add('force-motion');
  const reduce = !force && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const isZh = () => document.documentElement.lang.startsWith('zh');
  const root = document.documentElement;

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof window.Lenis === 'function') {
    try { lenis = new window.Lenis({lerp: 0.1, smoothWheel: true}); } catch { lenis = null; }
  }
  document.addEventListener('portfolio:menu', event => { if (lenis) event.detail ? lenis.stop() : lenis.start(); });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const url = new URL(link.getAttribute('href'), location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    if (lenis) lenis.scrollTo(url.hash === '#top' ? 0 : target, {duration: 1.4});
    else target.scrollIntoView({behavior: reduce ? 'auto' : 'smooth'});
    history.replaceState(null, '', url.hash);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({preventScroll: true});
  });

  /* ---------- header hide on scroll down ---------- */
  const top = $('.top');
  let lastY = scrollY, vel = 0, dirSign = 1;

  /* ---------- hero word + 3D cursor ---------- */
  const hero = $('[data-hero]');
  function splitHero() {
    const hw = $('.hw');
    if (!hw) return;
    const chars = [...hw.textContent];
    hw.replaceChildren(...chars.map((c, i) => {
      const s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i); s.textContent = c; return s;
    }));
  }
  splitHero();
  const cursor = $('[data-cursor]');
  const cur = {rx: 10, ry: -26, press: 1}, aim = {rx: 10, ry: -26, press: 1};
  if (hero && cursor && !reduce) {
    window.addEventListener('pointermove', event => {
      const nx = event.clientX / innerWidth * 2 - 1, ny = event.clientY / innerHeight * 2 - 1;
      aim.ry = -26 + nx * 24; aim.rx = 10 - ny * 18;
    }, {passive: true});
    hero.addEventListener('pointerdown', event => {
      aim.press = .86;
      if (event.target.closest('a,button')) return;
      const r = hero.getBoundingClientRect();
      const dot = document.createElement('span'); dot.className = 'ripple';
      dot.style.left = (event.clientX - r.left) + 'px'; dot.style.top = (event.clientY - r.top) + 'px';
      hero.append(dot); dot.addEventListener('animationend', () => dot.remove());
    });
    window.addEventListener('pointerup', () => { aim.press = 1; });
  }

  /* ---------- reveals ---------- */
  const revealables = $$('.reveal, [data-duo]');
  if (reduce || !('IntersectionObserver' in window)) revealables.forEach(el => el.classList.add('in'));
  else {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in'); io.unobserve(entry.target);
    }), {threshold: .12, rootMargin: '0px 0px -6% 0px'});
    revealables.forEach(el => io.observe(el));
    // the chart bars inside project windows animate once their card is seen
    $$('.proj-card, .case-window').forEach(el => io.observe(el));
  }

  /* ---------- stacking project cards ---------- */
  const projs = $$('.proj');

  /* ---------- window tilt ---------- */
  if (fine && !reduce) $$('[data-tilt]').forEach(stage => {
    const win = stage.querySelector('.window'); if (!win) return;
    stage.addEventListener('pointermove', event => {
      const r = stage.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - .5, y = (event.clientY - r.top) / r.height - .5;
      win.style.setProperty('--ty', (x * 10).toFixed(2) + 'deg'); win.style.setProperty('--tx', (-y * 8).toFixed(2) + 'deg');
    });
    stage.addEventListener('pointerleave', () => { win.style.setProperty('--ty', '0deg'); win.style.setProperty('--tx', '0deg'); });
  });

  /* ---------- marquee bands ---------- */
  const bands = $$('[data-band]').map(el => ({el, x: 0, dir: Number(el.dataset.dir || 1), w: 0, on: true}));
  const measureBands = () => bands.forEach(b => { b.w = b.el.scrollWidth / 2; });
  measureBands();
  document.fonts?.ready.then(measureBands);
  window.addEventListener('resize', measureBands);
  if ('IntersectionObserver' in window) {
    const bio = new IntersectionObserver(entries => entries.forEach(e => { const b = bands.find(x => x.el === e.target); if (b) b.on = e.isIntersecting; }));
    bands.forEach(b => bio.observe(b.el));
  }

  /* ---------- scroll-lit paragraph ---------- */
  const scrub = $('[data-scrub]');
  let words = [], lit = -1;
  function splitScrub() {
    if (!scrub) return;
    const holder = scrub.querySelector('[data-zh]');
    const text = holder.textContent;
    const phrases = ((isZh() ? scrub.dataset.hlZh : scrub.dataset.hlEn) || '').split('|').filter(Boolean);
    const segments = [];
    let rest = text;
    while (rest.length) {
      let best = -1, phrase = '';
      phrases.forEach(p => { const i = rest.indexOf(p); if (i >= 0 && (best < 0 || i < best)) { best = i; phrase = p; } });
      if (best < 0) { segments.push([rest, false]); break; }
      if (best > 0) segments.push([rest.slice(0, best), false]);
      segments.push([phrase, true]); rest = rest.slice(best + phrase.length);
    }
    const nodes = [];
    words = [];
    const addWord = (str, hl) => {
      const s = document.createElement('span'); s.className = hl ? 'w hl' : 'w'; s.textContent = str; words.push(s); nodes.push(s);
    };
    const seg = isZh() && 'Segmenter' in Intl ? new Intl.Segmenter('zh', {granularity: 'word'}) : null;
    segments.forEach(([str, hl]) => {
      if (seg) {
        for (const part of seg.segment(str)) {
          if (!part.isWordLike && words.length && !/^\s+$/.test(part.segment)) words[words.length - 1].textContent += part.segment;
          else if (/^\s+$/.test(part.segment)) nodes.push(document.createTextNode(part.segment));
          else addWord(part.segment, hl);
        }
      } else {
        str.split(/(\s+)/).forEach(piece => {
          if (!piece) return;
          if (/^\s+$/.test(piece)) nodes.push(document.createTextNode(piece)); else addWord(piece, hl);
        });
      }
    });
    holder.replaceChildren(...nodes);
    lit = -1;
    if (reduce) words.forEach(w => w.classList.add('on'));
  }
  splitScrub();

  /* ---------- journey filters ---------- */
  const filters = $('.filters');
  const dates = $('.dates');
  if (filters && dates) {
    filters.inert = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        filters.classList.toggle('show', entry.isIntersecting);
        filters.inert = !entry.isIntersecting;
      }, {rootMargin: '0px 0px -25% 0px'}).observe(dates);
    }
    filters.addEventListener('click', event => {
      const button = event.target.closest('button[data-filter]'); if (!button) return;
      const kind = button.dataset.filter;
      $$('button', filters).forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      let n = 0;
      $$('.date', dates).forEach(row => {
        const show = kind === 'all' || row.dataset.kind === kind;
        row.classList.toggle('hide', !show);
        if (show && !reduce && row.animate) row.animate([{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 520, delay: n++ * 70, easing: 'cubic-bezier(.2,.75,.2,1)', fill: 'backwards'});
      });
    });
  }

  /* ---------- globe ---------- */
  const where = $('[data-where]');
  const globeBox = $('[data-globe]');
  const pin = $('[data-pin]');
  const marquee = $('[data-where-marquee]');
  const CQ = {lat: 29.56 * Math.PI / 180, lon: 106.55 * Math.PI / 180};
  let globe = null, globeOn = false, globeTried = false;

  function decodeLand() {
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    const s = window.WW_LAND, out = new Uint8Array(1024 * 512);
    let i = 0, pos = 0, v = 0;
    while (i < s.length) {
      let x = 0, shift = 0, b;
      do { b = A.indexOf(s[i++]); x |= (b & 31) << shift; shift += 5; } while (b & 32);
      if (v) out.fill(255, pos, pos + x);
      pos += x; v ^= 1;
    }
    return out;
  }

  function initGlobe() {
    globeTried = true;
    const canvas = globeBox.querySelector('canvas');
    const gl = window.WW_LAND && canvas.getContext('webgl', {alpha: true, premultipliedAlpha: true, antialias: false});
    if (!gl) { globeBox.classList.add('no-gl'); return null; }
    const vs = 'attribute vec2 a;varying vec2 p;void main(){p=a;gl_Position=vec4(a,0.,1.);}';
    const fs = `precision highp float;varying vec2 p;uniform sampler2D land;uniform float lon0,lat0,scale,px;
      const float PI=3.14159265;
      float L(vec2 uv){return smoothstep(.3,.7,texture2D(land,uv).r);}
      void main(){
        vec2 q=vec2(p.x,p.y)/scale;float r=length(q);
        float z=sqrt(max(0.,1.-r*r));vec3 n=vec3(q,z);
        float s0=sin(lat0),c0=cos(lat0);
        float lat=asin(clamp(z*s0+q.y*c0,-1.,1.));
        float lon=lon0+atan(q.x,z*c0-q.y*s0);
        vec2 uv=vec2(fract((lon+PI)/(2.*PI)),(PI*.5-lat)/PI);
        float l=L(uv);float l2=L(uv+vec2(.0016,.0028));
        vec3 Ld=normalize(vec3(-.45,.55,.72));
        float d=clamp(dot(n,Ld),0.,1.);
        vec3 ocean=mix(vec3(.07,.16,.44),vec3(.27,.5,.95),d);
        vec3 pink=mix(vec3(.80,.38,.58),vec3(1.,.74,.86),d);
        vec3 col=mix(ocean,pink,l);
        col+=(l-l2)*.22;
        vec3 R=reflect(-Ld,n);float sp=pow(max(R.z,0.),22.);
        col+=sp*mix(.32,.16,l);
        col=mix(col,vec3(.04,.08,.26),pow(1.-z,2.6)*.6);
        float a=smoothstep(1.,1.-px*1.6,r);
        float g=smoothstep(1.1,1.,r)*(1.-a);g=g*g*.32;
        gl_FragColor=vec4(col*a+vec3(.55,.68,1.)*g,a+g);
      }`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { globeBox.classList.add('no-gl'); return null; }
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 1024, 512, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, decodeLand());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const U = name => gl.getUniformLocation(prog, name);
    const uLon = U('lon0'), uLat = U('lat0'), uScale = U('scale'), uPx = U('px');
    gl.uniform1i(U('land'), 0);
    gl.clearColor(0, 0, 0, 0);
    return {
      draw(lon0, lat0) {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        const w = Math.round(canvas.clientWidth * dpr);
        if (canvas.width !== w) { canvas.width = w; canvas.height = w; }
        gl.viewport(0, 0, w, w);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uLon, lon0); gl.uniform1f(uLat, lat0); gl.uniform1f(uScale, .9); gl.uniform1f(uPx, 2 / (w * .9));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };
  }

  if (where && globeBox) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        globeOn = entry.isIntersecting;
        if (globeOn && !globeTried) globe = initGlobe();
      }, {rootMargin: '300px 0px'}).observe(where);
    } else { globeOn = true; globe = initGlobe(); }
  }

  function updateGlobe(time) {
    const rect = where.getBoundingClientRect();
    const tall = rect.height > innerHeight * 1.3;
    const p = tall ? clamp(-rect.top / (rect.height - innerHeight)) : clamp((innerHeight * .9 - rect.top) / (innerHeight * .8));
    const k = reduce ? 1 : easeOut(clamp(p / .72));
    const wobble = reduce ? 0 : Math.sin(time / 2600) * .05;
    const lon0 = lerp(-1.15, CQ.lon, k) + wobble * k;
    const lat0 = lerp(.08, .36, k);
    globe?.draw(lon0, lat0);
    const s0 = Math.sin(lat0), c0 = Math.cos(lat0), sp = Math.sin(CQ.lat), cp = Math.cos(CQ.lat), dl = CQ.lon - lon0;
    const vis = s0 * sp + c0 * cp * Math.cos(dl);
    const x = cp * Math.sin(dl), y = c0 * sp - s0 * cp * Math.cos(dl);
    const size = globeBox.clientWidth;
    pin.style.left = (size / 2 * (1 + x * .9)).toFixed(1) + 'px';
    pin.style.top = (size / 2 * (1 - y * .9)).toFixed(1) + 'px';
    pin.classList.toggle('off', vis < .4 || k < .6);
    if (marquee) marquee.style.transform = `translate3d(${lerp(innerWidth * .15, -marquee.scrollWidth * .45, p).toFixed(1)}px,-50%,0)`;
  }

  /* ---------- nav highlighting ---------- */
  if ('IntersectionObserver' in window) {
    const links = $$('.bignav a[href^="#"]');
    const sections = [...new Set(links.map(a => a.getAttribute('href')))].map(h => document.getElementById(h.slice(1))).filter(Boolean);
    const nio = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a => a.getAttribute('href') === '#' + entry.target.id ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'));
    }), {rootMargin: '-40% 0px -55% 0px'});
    sections.forEach(s => nio.observe(s));
  }

  document.addEventListener('portfolio:language', () => { splitHero(); splitScrub(); measureBands(); });

  /* ---------- frame loop ---------- */
  const foot = $('[data-foot]');
  function frame(time) {
    if (lenis) lenis.raf(time);
    const y = scrollY;
    vel = y - lastY;
    if (vel) dirSign = Math.sign(vel);

    if (top && !document.body.classList.contains('menu-open')) {
      if (y > 220 && vel > 3) top.classList.add('hidden');
      else if (vel < -3 || y < 220) top.classList.remove('hidden');
    } else top?.classList.remove('hidden');

    if (hero && y < innerHeight * 1.3) {
      hero.style.setProperty('--hs', clamp(y / hero.offsetHeight).toFixed(4));
      if (cursor && !reduce) {
        cur.rx = lerp(cur.rx, aim.rx, .08); cur.ry = lerp(cur.ry, aim.ry, .08); cur.press = lerp(cur.press, aim.press, .25);
        cursor.style.setProperty('--rx', cur.rx.toFixed(2) + 'deg');
        cursor.style.setProperty('--ry', cur.ry.toFixed(2) + 'deg');
        cursor.style.setProperty('--press', cur.press.toFixed(3));
      }
    }

    if (projs.length > 1 && innerWidth > 720 && !reduce) {
      for (let i = 0; i < projs.length - 1; i++) {
        const next = projs[i + 1].getBoundingClientRect();
        const stickyTop = 96 + (i + 1) * 22;
        const p = clamp(1 - (next.top - stickyTop) / (innerHeight * .85));
        const card = projs[i].firstElementChild;
        card.style.setProperty('--sc', (1 - p * .06).toFixed(4));
        card.style.setProperty('--br', (1 - p * .28).toFixed(4));
      }
    }

    if (!reduce) bands.forEach(b => {
      if (!b.on || !b.w) return;
      b.x -= (.7 + Math.min(Math.abs(vel), 80) * .14) * b.dir * dirSign;
      if (b.x <= -b.w) b.x += b.w;
      if (b.x > 0) b.x -= b.w;
      b.el.style.transform = `translate3d(${b.x.toFixed(1)}px,0,0)`;
    });

    if (scrub && words.length && !reduce) {
      const r = scrub.getBoundingClientRect();
      if (r.bottom > -100 && r.top < innerHeight + 100) {
        const p = clamp((innerHeight * .82 - r.top) / (r.height + innerHeight * .3));
        const n = Math.round(p * words.length);
        if (n !== lit) { words.forEach((w, i) => w.classList.toggle('on', i < n)); lit = n; }
      }
    }

    if (where && globeOn) updateGlobe(time);

    if (foot) {
      const r = foot.getBoundingClientRect();
      if (r.top < innerHeight) foot.style.setProperty('--fr', clamp((innerHeight - r.top) / r.height).toFixed(3));
    }

    lastY = y;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  root.classList.add('stage-ready');
})();
