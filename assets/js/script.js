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

  /* ---------- Contact form: validation + Google Sheet (Google Apps Script) ---------- */
  d.querySelectorAll('#contactForm').forEach(function (f) {
    var msg = f.querySelector('.form-msg'), btn = f.querySelector('.submit');
    var hideTimer;
    function show(text, ok) {
      clearTimeout(hideTimer);
      msg.textContent = text; msg.hidden = false; msg.style.color = ok ? '' : '#d33';
      if (ok) hideTimer = setTimeout(function () { msg.hidden = true; msg.textContent = ''; }, 20000);   // success message disappears after 20 seconds
    }

    var rules = {
      name: function (v) {
        if (!v) return 'Please enter your name.';
        if (v.length < 2) return 'Name must be at least 2 characters.';
        if (!/^[\p{L}][\p{L} .'\-]*$/u.test(v)) return 'Name can contain only letters, spaces, . \' and -';
        return '';
      },
      email: function (v) {
        if (!v) return 'Please enter your email address.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Please enter a valid email, e.g. name@example.com';
        return '';
      },
      mobile: function (v) {
        if (!v) return 'Please enter your mobile number.';
        var n = v.replace(/[\s\-()]/g, '');
        if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(n)) return 'Enter a valid 10-digit Indian mobile number (starting with 6-9).';
        return '';
      },
      comment: function (v) { return v.length > 500 ? 'Comment can be at most 500 characters.' : ''; }
    };
    function field(name) { return f.elements[name]; }
    function check(name) {
      var el = field(name), err = el.parentElement.querySelector('.err'), m = rules[name](el.value.trim());
      err.textContent = m;
      el.classList.toggle('invalid', !!m);
      el.classList.toggle('valid', !m && el.value.trim() !== '');
      el.setAttribute('aria-invalid', m ? 'true' : 'false');
      return !m;
    }
    Object.keys(rules).forEach(function (n) {
      var el = field(n);
      el.addEventListener('blur', function () { check(n); });
      el.addEventListener('input', function () { if (el.classList.contains('invalid')) check(n); });
    });

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      clearTimeout(hideTimer); msg.hidden = true;
      var firstBad = null;
      Object.keys(rules).forEach(function (n) { if (!check(n) && !firstBad) firstBad = field(n); });
      if (firstBad) { firstBad.focus(); return; }

      var url = (f.dataset.sheetUrl || '').trim();
      if (!/^https:\/\/script\.google\.com\/macros\/s\/[^\/]+\/exec/.test(url)) {
        show('Form is not connected yet. Add the Google Apps Script Web app URL (ending with /exec) in contact-us.html.', false); return;
      }
      var mob = field('mobile').value.replace(/[\s\-()]/g, '').replace(/^(\+91|91|0)/, '');
      var body = new URLSearchParams();
      body.append('name', field('name').value.trim());
      body.append('email', field('email').value.trim());
      body.append('mobile', '+91 ' + mob.slice(0, 5) + ' ' + mob.slice(5));
      body.append('comment', field('comment').value.trim());
      body.append('bot_trap', field('bot_trap').value);

      btn.disabled = true; var label = btn.textContent; btn.textContent = 'Sending...';
      fetch(url, { method: 'POST', body: body, redirect: 'follow' })
        .then(function (r) { return r.text(); })
        .then(function (txt) {
          var res; try { res = JSON.parse(txt); } catch (x) { res = null; }
          if (res && res.ok && res.saved) {
            console.log('Saved in Google Sheet:', res.saved || res);
            show(f.dataset.msg || 'Thank you! We will get back to you soon.', true);
            f.reset();
            f.querySelectorAll('.valid,.invalid').forEach(function (el) { el.classList.remove('valid', 'invalid'); });
          } else {
            console.error('Sheet response:', txt.slice(0, 400));
            show(res && res.ok ? 'Old Apps Script version is still deployed. Paste the latest code and deploy a New version.' : (res && res.error ? 'Could not save: ' + res.error : 'Could not save your message. The Apps Script is not deployed correctly (see browser console).'), false);
          }
        })
        .catch(function (err) {
          console.error('Sheet request failed:', err);
          show('Could not reach the sheet. Check the Web app URL and that access is set to "Anyone".', false);
        })
        .then(function () { btn.disabled = false; btn.textContent = label; });
    });
  });

  /* ---------- Footer year ---------- */
  var y = d.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();