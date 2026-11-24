(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: mobile menu, sub-menu, scroll shadow ---------- */
  var header = d.getElementById('header'), menuBtn = d.getElementById('menuBtn'), nav = d.getElementById('nav');
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  d.querySelectorAll('.sub-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.parentElement.classList.toggle('open');
      b.setAttribute('aria-expanded', open);
    });
  });
  d.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false');
    d.querySelectorAll('.has-sub.open').forEach(function (li) { li.classList.remove('open'); });
  });
  d.addEventListener('click', function (e) {
    if (!e.target.closest('.has-sub')) d.querySelectorAll('.has-sub.open').forEach(function (li) { li.classList.remove('open'); });
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); d.querySelectorAll('.has-sub.open').forEach(function (li) { li.classList.remove('open'); }); }
  });
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Hero slider ---------- */
  var hero = d.getElementById('hero');
  if (hero) {
  var slides = Array.prototype.slice.call(hero.querySelectorAll('.slide'));
  var cur = 0, timer;
  function show(n) {
    slides[cur].classList.remove('active');
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add('active');
  }
  function play() { if (!reduce) { stop(); timer = setInterval(function () { show(cur + 1); }, 6000); } }
  function stop() { clearInterval(timer); }
  hero.querySelector('.prev').addEventListener('click', function () { show(cur - 1); play(); });
  hero.querySelector('.next').addEventListener('click', function () { show(cur + 1); play(); });
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', play);
  hero.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  var sx = null;
  hero.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) { show(cur + (dx < 0 ? 1 : -1)); play(); }
    sx = null;
  });
  play();
  }

  /* ---------- Scroll reveal + counters ---------- */
  function count(el) {
    var end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = null, dur = 1400;
    if (reduce) { el.textContent = end + suf; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        en.target.querySelectorAll('[data-count]').forEach(count);
        io.unobserve(en.target);
      });
    }, { threshold: .15 });
    d.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
  } else {
    d.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Service modal ---------- */
  var m = d.getElementById('modal'), S = window.SERVICES;
  if (m) {
  function openM(i) {
    var s = S[i]; d.getElementById('mTitle').textContent = s.t; d.getElementById('mLead').textContent = s.l;
    d.getElementById('mBody').textContent = s.b; d.getElementById('mAsk').textContent = s.a; d.getElementById('mBtn').textContent = s.c;
    m.hidden = false; requestAnimationFrame(function () { m.classList.add('show'); });
  }
  function closeM() { m.classList.remove('show'); setTimeout(function () { m.hidden = true; }, 300); }
  d.querySelectorAll('[data-open]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); openM(+a.dataset.open); nav.classList.remove('open'); });
  });
  d.getElementById('mClose').addEventListener('click', closeM);
  d.getElementById('mBtn').addEventListener('click', closeM);
  m.addEventListener('click', function (e) { if (e.target === m) closeM(); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !m.hidden) closeM(); });
  }

  /* ---------- Team carousel ---------- */
  var track = d.getElementById('teamTrack'), idx = 0;
  if (track) {
  function perView() { return window.innerWidth <= 640 ? 1 : 2; }
  function moveTeam() {
    var items = track.children.length, max = Math.max(items - perView(), 0);
    idx = Math.min(Math.max(idx, 0), max);
    var w = track.children[0].getBoundingClientRect().width + 19.2;
    track.style.transform = 'translateX(' + (-idx * w) + 'px)';
  }
  d.getElementById('teamNext').addEventListener('click', function () {
    idx = (idx >= track.children.length - perView()) ? 0 : idx + 1; moveTeam();
  });
  d.getElementById('teamPrev').addEventListener('click', function () {
    idx = (idx <= 0) ? track.children.length - perView() : idx - 1; moveTeam();
  });
  window.addEventListener('resize', moveTeam);
  }

  /* ---------- Forms (front-end only) ---------- */
  d.querySelectorAll('#contactForm').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = f.querySelector('.form-msg');
      if (!f.checkValidity()) { f.reportValidity(); return; }
      msg.textContent = f.dataset.msg || 'Thank you! Your application has been received.'; msg.hidden = false;
      f.reset();
    });
  });

  /* ---------- Footer year ---------- */
  var y = d.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();