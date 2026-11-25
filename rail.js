'use strict';
/* Edition eight: the page is one rail line.
   The header line map and the rail down the page track scroll position, stations light as they are passed,
   and screenshots below the fold develop from a washed print the first time they arrive. */
(() => {
  const root = document.documentElement;
  root.classList.add('rail-on');
  const calm = root.classList.contains('calm') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const isZh = () => root.lang.startsWith('zh');

  const header = $('.sign');
  const stations = $$('[data-station]');
  const stops = $$('.linemap a[data-stop]');
  const plateStops = stations.map(s => $('.stop', s));
  const fill = $('[data-fill]'), train = $('[data-train]');
  const rail = $('.rail'), railFill = $('[data-rail]');
  const nowEl = $('[data-now]');
  const main = $('main.line');

  /* ---------- develop screenshots that start below the fold ---------- */
  const develops = $$('[data-develop]');
  if (!calm && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.remove('pending');
      io.unobserve(e.target);
    }), {rootMargin: '0px 0px -12% 0px', threshold: .2});
    develops.forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pending'); io.observe(el); }
    });
  }

  /* ---------- place the page rail between the first and last stop ---------- */
  function placeRail() {
    if (!rail || !main) return;
    const first = $('.stop', main), last = plateStops[plateStops.length - 1];
    if (!first || !last) return;
    const m = main.getBoundingClientRect();
    const a = first.getBoundingClientRect(), b = last.getBoundingClientRect();
    const top = a.top + a.height / 2 - m.top, bottom = b.top + b.height / 2 - m.top;
    rail.style.setProperty('--rail-top', top + 'px');
    rail.style.setProperty('--rail-h', Math.max(0, bottom - top) + 'px');
  }

  /* ---------- where on the line are we? ---------- */
  let current = -1;
  function nameOf(i) {
    const a = stops[i]; if (!a) return '';
    return (isZh() ? $('.zh', a) : $('.en', a))?.textContent || '';
  }
  function update() {
    const head = header ? header.offsetHeight : 0;
    const probe = scrollY + head + innerHeight * .28;
    const tops = stations.map(st => st.getBoundingClientRect().top + scrollY);
    let k = 0;
    tops.forEach((top, i) => { if (top <= probe) k = i; });
    const atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
    if (atEnd) k = stations.length - 1;
    const span = (tops[k + 1] ?? document.documentElement.scrollHeight) - tops[k];
    const f = k === stations.length - 1 ? 0 : clamp((probe - tops[k]) / Math.max(span, 1));
    const n = stops.length || 1;
    const p = clamp((k + f) / Math.max(n - 1, 1));
    if (fill) fill.parentElement.style.setProperty('--p', p.toFixed(4));
    if (train) train.style.setProperty('--p', p.toFixed(4));

    if (k !== current) {
      current = k;
      stops.forEach((a, i) => {
        a.classList.toggle('passed', i < k);
        if (i === k) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
      plateStops.forEach((st, i) => { if (!st) return; st.classList.toggle('passed', i < k); st.classList.toggle('current', i === k); });
      if (nowEl) nowEl.textContent = nameOf(k) + (stops[k + 1] ? (isZh() ? '  ·  下一站 ' : '  ·  Next ') + nameOf(k + 1) : '');
    }

    if (railFill && rail) {
      const r = rail.getBoundingClientRect();
      railFill.style.setProperty('--fill', clamp((head + innerHeight * .28 - r.top) / Math.max(r.height, 1)).toFixed(4));
    }
  }

  let queued = false;
  const onScroll = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; update(); }); };
  addEventListener('scroll', onScroll, {passive: true});
  addEventListener('resize', () => { placeRail(); update(); });
  document.fonts?.ready.then(() => { placeRail(); update(); });
  addEventListener('load', () => { placeRail(); update(); });
  document.addEventListener('portfolio:language', () => { current = -1; placeRail(); update(); });
  placeRail(); update();

  /* ---------- motion toggle (footer) ---------- */
  const motionBtn = $('#motion');
  const off = root.classList.contains('calm');
  function labelMotion() {
    if (!motionBtn) return;
    motionBtn.textContent = isZh() ? (off ? '动效 关' : '动效 开') : (off ? 'Motion off' : 'Motion on');
    motionBtn.setAttribute('aria-pressed', String(!off));
  }
  labelMotion();
  document.addEventListener('portfolio:language', labelMotion);
  motionBtn?.addEventListener('click', () => {
    try { localStorage.setItem('ww-motion', off ? 'on' : 'off'); } catch { /* fine */ }
    location.reload();
  });
})();
