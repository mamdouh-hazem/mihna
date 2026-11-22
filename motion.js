/* Mihna motion & interactivity — rotating hero word, animated counters,
   scroll reveal, progress bar, sticky-nav state, sample question, back-to-top.
   No dependencies; everything client-side. */
(function () {
  'use strict';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  function toAr(n) { return String(n).replace(/\d/g, function (d) { return AR_DIGITS[+d]; }); }

  /* ---- Gold scroll progress bar ---- */
  var bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);

  /* ---- Sticky nav state + progress ---- */
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    var nav = document.querySelector('.site-nav');
    if (nav) nav.classList.toggle('nav-stuck', h.scrollTop > 140);
    var tt = document.getElementById('to-top');
    if (tt) tt.classList.toggle('show', h.scrollTop > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Back to top ---- */
  var tt = document.createElement('button');
  tt.id = 'to-top';
  tt.type = 'button';
  tt.title = 'العودة للأعلى';
  tt.setAttribute('aria-label', 'العودة للأعلى');
  tt.textContent = '↑';
  tt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });
  document.body.appendChild(tt);

  /* ---- Rotating hero word ---- */
  var rotEl = document.getElementById('rot-word');
  if (rotEl && !reduced) {
    var words = [
      'تختبر نفسك بوقائع تخيلية',
      'تصوغ بيدك زي المحترفين',
      'تاخد تقييمك فوراً',
      'تحصل على شهادة باسمك'
    ];
    var wi = 0;
    setInterval(function () {
      wi = (wi + 1) % words.length;
      rotEl.classList.remove('rot-swap');
      void rotEl.offsetWidth;
      rotEl.textContent = words[wi];
      rotEl.classList.add('rot-swap');
    }, 2600);
  }

  /* ---- Animated counters (once, when visible) ---- */
  var counters = document.querySelectorAll('.count[data-count]');
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduced) { el.textContent = toAr(target) + suffix; return; }
    var t0 = null, dur = 1400;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = toAr(Math.round(target * eased)) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
      else el.classList.add('pop');
    }
    requestAnimationFrame(step);
  }

  /* ---- Scroll reveal + counter trigger + nav active section ---- */
  var sections = document.querySelectorAll('#app > section, #app > .stats-band');
  if ('IntersectionObserver' in window && !reduced) {
    sections.forEach(function (s) { s.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('reveal-in');
        if (en.target.id === 'stats') counters.forEach(runCounter);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12 });
    sections.forEach(function (s) { io.observe(s); });
  } else {
    counters.forEach(function (el) {
      el.textContent = toAr(parseInt(el.getAttribute('data-count'), 10) || 0) + (el.getAttribute('data-suffix') || '');
    });
  }

  /* ---- Active section highlight in nav ---- */
  var navLinks = document.querySelectorAll('.site-nav a[href^="index.html#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    navLinks.forEach(function (a) {
      var id = a.getAttribute('href').split('#')[1];
      if (id) map[id] = a;
    });
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = map[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          navLinks.forEach(function (x) { x.classList.remove('nav-active'); });
          a.classList.add('nav-active');
        }
      });
    }, { rootMargin: '-30% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) nio.observe(s);
    });
  }

  /* ---- Staggered reveal for exam/lesson list items ---- */
  var items = document.querySelectorAll('.test-item');
  if (items.length && 'IntersectionObserver' in window && !reduced) {
    var iio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('test-item'); });
        var idx = Math.max(0, sibs.indexOf(el));
        el.style.transitionDelay = (idx * 70) + 'ms';
        el.classList.add('rv-in');
        setTimeout(function () { el.style.transitionDelay = ''; }, idx * 70 + 800);
        iio.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { el.classList.add('rv'); iio.observe(el); });
  }

  /* ---- Sample question widget ---- */
  var tryOpts = document.getElementById('try-opts');
  if (tryOpts) {
    var CORRECT = 1;
    var EXP_OK = 'إجابة صحيحة 👏 النصب جريمة ذات أركان مادية: تدليس بإحدى الطرق القانونية مؤيد بمظاهر خارجية، واستيلاء على مال، ورابطة سببية. القول المرسل دون مظهر خارجي لا يكفي، ولم يقع أي استيلاء أصلاً.';
    var EXP_BAD = 'إجابة غير صحيحة. الفخ الشائع هنا الخلط بين الكذب العادي المرسل وبين التدليس القانوني المنصوص عليه في المادة ٣٣٦، أو اعتبار النية وحدها جريمة. الصواب: لا تقوم الجريمة — لا تدليس بمظهر خارجي ولا استيلاء على مال.';
    tryOpts.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.try-opt');
      if (!btn || tryOpts.classList.contains('done')) return;
      tryOpts.classList.add('done');
      var i = parseInt(btn.getAttribute('data-i'), 10);
      var ok = i === CORRECT;
      tryOpts.querySelectorAll('.try-opt').forEach(function (o) {
        o.classList.add('locked');
        if (parseInt(o.getAttribute('data-i'), 10) === CORRECT) o.classList.add('ok');
        else if (o === btn) o.classList.add('bad');
      });
      var fb = document.getElementById('try-fb');
      fb.hidden = false;
      fb.innerHTML = '<div class="fb-card ' + (ok ? 'fb-ok' : 'fb-bad') + '"><div class="fb-head">' +
        (ok ? '✅ صح!' : '❌ لأ، ركز في الفخ') + '</div>' + (ok ? EXP_OK : EXP_BAD) + '</div>';
      document.getElementById('try-more').hidden = false;
    });
  }
})();
