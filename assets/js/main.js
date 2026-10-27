/* ============ UNIVERSEsauna main.js ============ */
(() => {
  'use strict';

  const $  = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- loader ---------- */
  const loader = $('#loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader && loader.classList.add('is-done'), 500);
  });
  setTimeout(() => loader && loader.classList.add('is-done'), 3200);

  /* ---------- scroll progress ---------- */
  const progress = $('#progress');
  const onScrollProgress = () => {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    progress.style.width = (p * 100) + '%';
  };

  /* ---------- header state ---------- */
  const header = $('#header');
  const onHeader = () => {
    header.classList.toggle('is-scrolled', scrollY > 40);
  };

  /* ---------- drawer ---------- */
  const burger = $('#burger'), drawer = $('#drawer');
  const toggleDrawer = (open) => {
    const o = open ?? !drawer.classList.contains('is-open');
    drawer.classList.toggle('is-open', o);
    burger.classList.toggle('is-open', o);
    burger.setAttribute('aria-expanded', String(o));
    drawer.setAttribute('aria-hidden', String(!o));
    document.body.style.overflow = o ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggleDrawer());
  $$('[data-drawer-link]').forEach(a => a.addEventListener('click', () => toggleDrawer(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') toggleDrawer(false); });

  /* ---------- hero slider ---------- */
  const slides = $$('.hero__slide');
  const slideIndex = $('#slideIndex');
  let cur = 0, timer = null;
  const show = i => {
    slides[cur].classList.remove('is-active');
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add('is-active');
    slideIndex.textContent = String(cur + 1).padStart(2, '0');
  };
  const startTimer = () => {
    if (reduceMotion) return;
    clearInterval(timer);
    timer = setInterval(() => show(cur + 1), 5600);
  };
  if (slides.length) startTimer();

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- counters ---------- */
  const cio = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, target = +el.dataset.count;
      const dur = 1600, t0 = performance.now();
      const step = now => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      reduceMotion ? el.textContent = target : requestAnimationFrame(step);
      cio.unobserve(el);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox'), lbImg = $('#lightboxImg'), lbCap = $('#lightboxCap');
  const items = $$('.gallery__item');
  let lbIdx = 0;
  const openLb = i => {
    lbIdx = (i + items.length) % items.length;
    const item = items[lbIdx];
    const img = $('img', item);
    lbImg.src = item.getAttribute('href');
    lbImg.alt = img.alt;
    lbCap.textContent = img.alt;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeLb = () => {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  items.forEach((item, i) => item.addEventListener('click', e => { e.preventDefault(); openLb(i); }));
  $('#lightboxClose').addEventListener('click', closeLb);
  $('#lightboxPrev').addEventListener('click', e => { e.stopPropagation(); openLb(lbIdx - 1); });
  $('#lightboxNext').addEventListener('click', e => { e.stopPropagation(); openLb(lbIdx + 1); });
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') openLb(lbIdx - 1);
    if (e.key === 'ArrowRight') openLb(lbIdx + 1);
  });

  /* ---------- subtle hero parallax ---------- */
  const heroInner = $('.hero__inner');
  if (!reduceMotion && heroInner) {
    addEventListener('scroll', () => {
      const y = Math.min(scrollY, innerHeight);
      heroInner.style.transform = `translateY(${y * .18}px)`;
      heroInner.style.opacity = String(Math.max(0, 1 - y / (innerHeight * .82)));
    }, { passive: true });
  }

  /* ---------- scroll handlers ---------- */
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScrollProgress(); onHeader(); ticking = false; });
  }, { passive: true });
  onScrollProgress(); onHeader();

  /* ---------- anchor offset ---------- */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) { e && e.preventDefault(); scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); return; }
    const t = $(id);
    if (!t) return;
    e.preventDefault();
    const top = t.getBoundingClientRect().top + scrollY - 64;
    scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  }));
})();
