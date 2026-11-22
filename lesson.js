/* Mihna lesson engine — data-driven from <lesson-id>.json */
(function () {
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  var params = new URLSearchParams(location.search);
  var lessonId = params.get('lesson') || 'draft-01-inzar';
  var T = null;

  fetch(encodeURIComponent(lessonId) + '.json')
    .then(function (r) { if (!r.ok) throw new Error('not found'); return r.json(); })
    .then(function (d) { T = d; render(); })
    .catch(function () {
      document.getElementById('app').innerHTML = '<div class="card"><h2>الدرس غير موجود</h2><p>تأكد من الرابط أو ارجع إلى <a href="index.html">الصفحة الرئيسية</a>.</p></div>';
    });

  function renderBlocks(blocks, host) {
    (blocks || []).forEach(function (b) {
      if (b.p) host.appendChild(el('p', 'lesson-p', esc(b.p)));
      else if (b.list) {
        var ul = el('ul', 'lesson-list');
        b.list.forEach(function (li) { ul.appendChild(el('li', null, esc(li))); });
        host.appendChild(ul);
      } else if (b.tip) host.appendChild(el('div', 'fb-card fb-ok', '<div class="fb-head">💡 قاعدة عملية</div>' + esc(b.tip)));
      else if (b.warn) host.appendChild(el('div', 'fb-card fb-warn', '<div class="fb-head">⚠️ خطأ شائع</div>' + esc(b.warn)));
      else if (b.ex) host.appendChild(el('div', 'fb-card fb-bad', '<div class="fb-head">' + esc(b.ex_title || 'مثال') + '</div>' + esc(b.ex)));
    });
  }

  function render() {
    document.title = T.title + ' | تدريب مهنة على الصياغة';
    var app = document.getElementById('app');
    app.innerHTML = '';

    var head = el('header', 'brand');
    head.innerHTML = '<a class="brand-home" href="index.html">مهنة</a><div class="brand-slogan">من المعرفة القانونية إلى الحياة المهنية</div>';
    app.appendChild(head);

    var hero = el('section', 'hero card');
    hero.innerHTML =
      '<div class="chip">' + esc(T.track || 'التدريب على الصياغة') + '</div>' +
      '<h1>الدرس رقم (' + esc(T.number) + ')</h1>' +
      '<h2>' + esc(T.title) + '</h2>' +
      '<p class="sub">' + esc(T.subtitle) + '</p>';
    app.appendChild(hero);

    var isPaid = T.access === 'paid';

    // Member access code (soft gate): a paying member gets a code on WhatsApp;
    // opening any lesson link with ?code=XXXX or entering the code once unlocks
    // all paid lessons on this device (saved in localStorage).
    // Owner master code: unlocks every lesson on this device. Private to the site owner.
    var OWNER_CODE = 'MH-OWNER-84K2';
    // Access codes: level-1 code, level-2 code, bundle code (both levels).
    // MIHNA300 is the legacy level-1 code: existing buyers keep their access.
    var CODES_L1 = ['MIHNA300', 'MIHNA-L1'];
    var CODES_L2 = ['MIHNA-L2'];
    var CODES_ALL = ['MIHNA-ALL'];
    function codeOk(c) {
      if (!c) return false;
      var u = String(c).trim().toUpperCase();
      if (u === OWNER_CODE) return true;
      if (CODES_ALL.indexOf(u) !== -1) return true;
      var pool = (T.level === 'المستوى الثاني') ? CODES_L2 : CODES_L1;
      if (pool.indexOf(u) !== -1) return true;
      return (T.codes || []).some(function (x) { return String(x).toUpperCase() === u; });
    }
    var savedCode = null;
    try { savedCode = localStorage.getItem('mihna:code'); } catch (e) {}
    var urlCode = params.get('code');
    if (codeOk(urlCode)) {
      try { localStorage.setItem('mihna:code', String(urlCode).trim()); } catch (e) {}
      savedCode = urlCode;
    }
    var unlocked = codeOk(savedCode);

    // Goals
    var goals = el('section', 'card');
    goals.innerHTML = '<h2 class="sec-title">🎯 ماذا ستتقن بعد هذا الدرس؟</h2>';
    var gul = el('ul', 'lesson-list');
    (T.goals || []).forEach(function (g) { gul.appendChild(el('li', null, esc(g))); });
    goals.appendChild(gul);
    app.appendChild(goals);

    if (isPaid && !unlocked) {
      var lock = el('section', 'card');
      var isL2 = T.level === 'المستوى الثاني';
      lock.innerHTML = '<h2 class="sec-title">🔒 محتوى الدرس كاملاً ضمن باقة التدريب</h2>' +
        (isL2
          ? '<p class="hint">هذا الدرس جزء من <b>المستوى الثاني</b> من برنامج التدريب على الصياغة: شرح مبسط + نموذج معتمد + تمرين كتابة ترسله ويُقيَّم لك. بمناسبة انطلاق المنصة: باقة المستوى الثاني بـ<b>٦٠٠ جنيه</b> بدلاً من <s>١٥٠٠</s>، أو البرنامج الكامل (المستويان) بـ<b>٧٠٠ جنيه</b> بدلاً من <s>٢٧٠٠</s> (الدفع عبر InstaPay أو فودافون كاش).</p>'
          : '<p class="hint">هذا الدرس جزء من <b>المستوى الأول</b> من برنامج التدريب على الصياغة: شرح مبسط + نموذج معتمد + تمرين كتابة ترسله ويُقيَّم لك. بمناسبة انطلاق المنصة: باقة المستوى الأول بـ<b>٤٠٠ جنيه</b> بدلاً من <s>١٢٠٠</s>، أو البرنامج الكامل (المستويان) بـ<b>٧٠٠ جنيه</b> بدلاً من <s>٢٧٠٠</s> (الدفع عبر InstaPay أو فودافون كاش).</p>');
      var row = el('div', 'channel-row');
      var order = el('a', 'btn btn-gold', isL2 ? '💬 اطلب باقة المستوى الثاني عبر واتساب' : '💬 اطلب باقة المستوى الأول عبر واتساب');
      order.href = T.order_wa || (isL2 ? 'https://wa.me/201092861985?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D8%A8%D8%A7%D9%82%D8%A9%20%D8%A7%D9%84%D9%85%D8%B3%D8%AA%D9%88%D9%89%20%D8%A7%D9%84%D8%AB%D8%A7%D9%86%D9%8A%20%D9%85%D9%86%20%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D8%AC%20%D8%A7%D9%84%D8%AA%D8%AF%D8%B1%D9%8A%D8%A8%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%B5%D9%8A%D8%A7%D8%BA%D8%A9%20%D8%A8%D9%85%D9%86%D8%B5%D8%A9%20%D9%85%D9%87%D9%86%D8%A9%20%D8%A8%D8%B3%D8%B9%D8%B1%20%D8%A7%D9%84%D8%A7%D9%86%D8%B7%D9%84%D8%A7%D9%82%20%D9%A6%D9%A0%D9%A0%20%D8%AC%D9%86%D9%8A%D9%87.' : 'https://wa.me/201092861985?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D8%A8%D8%A7%D9%82%D8%A9%20%D8%A7%D9%84%D9%85%D8%B3%D8%AA%D9%88%D9%89%20%D8%A7%D9%84%D8%A3%D9%88%D9%84%20%D9%85%D9%86%20%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D8%AC%20%D8%A7%D9%84%D8%AA%D8%AF%D8%B1%D9%8A%D8%A8%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%B5%D9%8A%D8%A7%D8%BA%D8%A9%20%D8%A8%D9%85%D9%86%D8%B5%D8%A9%20%D9%85%D9%87%D9%86%D8%A9%20%D8%A8%D8%B3%D8%B9%D8%B1%20%D8%A7%D9%84%D8%A7%D9%86%D8%B7%D9%84%D8%A7%D9%82%20%D9%A4%D9%A0%D9%A0%20%D8%AC%D9%86%D9%8A%D9%87.');
      order.target = '_blank'; order.rel = 'noopener';
      row.appendChild(order);
      var back = el('a', 'btn btn-ghost', '← العودة إلى المنصة');
      back.href = 'index.html';
      row.appendChild(back);
      lock.appendChild(row);

      // Member code entry
      var codeBox = el('div', 'card');
      codeBox.style.marginTop = '10px';
      codeBox.innerHTML = '<div style="font-weight:800;color:var(--navy);margin-bottom:6px;">🎟️ مشترك بالفعل؟ أدخل كود التفعيل</div>';
      var form = el('div');
      form.style.display = 'flex';
      form.style.gap = '8px';
      var inp = document.createElement('input');
      inp.type = 'text'; inp.className = 'draft'; inp.placeholder = 'اكتب الكود هنا (مثال: MIHNA-L1)';
      inp.style.marginBottom = '0'; inp.dir = 'ltr';
      var btn = el('button', 'btn btn-primary', 'تفعيل');
      btn.type = 'button'; btn.style.padding = '10px 18px';
      var err = el('div', 'error-banner');
      err.id = 'codeErr';
      form.appendChild(inp); form.appendChild(btn);
      codeBox.appendChild(form); codeBox.appendChild(err);
      btn.addEventListener('click', function () {
        if (codeOk(inp.value)) {
          try { localStorage.setItem('mihna:code', inp.value.trim()); } catch (e) {}
          render();
        } else {
          err.style.display = 'block';
          err.textContent = 'الكود غير صحيح. تأكد من كتابته كما وصلك في رسالة الاشتراك، أو تواصل معنا واتساب.';
        }
      });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') btn.click(); });
      lock.appendChild(codeBox);
      app.appendChild(lock);
      addFooter(app);
      return;
    }

    // Explanation sections
    (T.sections || []).forEach(function (sec, i) {
      var c = el('section', 'card');
      c.innerHTML = '<h2 class="sec-title">' + esc(sec.h) + '</h2>';
      renderBlocks(sec.blocks, c);
      app.appendChild(c);
    });

    // Model document
    if (T.model) {
      var m = el('section', 'card');
      m.innerHTML = '<h2 class="sec-title">📄 ' + esc(T.model.h || 'النموذج المعتمد') + '</h2>';
      if (T.model.note) m.appendChild(el('p', 'hint', esc(T.model.note)));
      var doc = el('div', 'model-doc');
      (T.model.lines || []).forEach(function (ln) {
        if (ln === '') { doc.appendChild(el('div', 'md-gap', '&nbsp;')); }
        else if (/^##/.test(ln)) { doc.appendChild(el('div', 'md-h', esc(ln.replace(/^##\s*/, '')))); }
        else { doc.appendChild(el('div', 'md-line', esc(ln))); }
      });
      m.appendChild(doc);
      app.appendChild(m);
    }

    // Exercise
    if (T.exercise) {
      var x = el('section', 'card');
      x.innerHTML = '<h2 class="sec-title">✍️ ' + esc(T.exercise.h || 'التمرين العملي') + '</h2>';
      if (T.exercise.brief) x.appendChild(el('div', 'case-brief', esc(T.exercise.brief)));
      var xul = el('ul', 'lesson-list');
      (T.exercise.tasks || []).forEach(function (t) { xul.appendChild(el('li', null, esc(t))); });
      x.appendChild(xul);
      if (T.exercise.howto) x.appendChild(el('p', 'hint', esc(T.exercise.howto)));
      var xrow = el('div', 'channel-row');
      var send = el('a', 'btn btn-primary', '📩 أرسل تمرينك للتقييم عبر واتساب');
      send.href = T.exercise.wa || 'https://wa.me/201092861985';
      send.target = '_blank'; send.rel = 'noopener';
      xrow.appendChild(send);
      x.appendChild(xrow);
      app.appendChild(x);
    }

    // Next lesson
    if (T.next) {
      var nx = el('section', 'card signoff');
      nx.innerHTML = '<div style="font-weight:800;margin-bottom:6px;">أنهيت الدرس (' + esc(T.number) + ') 🎓</div>' +
        '<div style="color:var(--muted);font-size:13.5px;">الدرس التالي: ' + esc(T.next.title) + '</div>';
      var nrow = el('div', 'channel-row');
      var nbtn = el('a', 'btn btn-gold', 'الدرس التالي ←');
      nbtn.href = 'lesson.html?lesson=' + encodeURIComponent(T.next.id);
      nrow.appendChild(nbtn);
      nx.appendChild(nrow);
      app.appendChild(nx);
    }

    addFooter(app);
  }

  function addFooter(app) {
    var f = el('div', 'site-footer');
    f.innerHTML = 'منصة مهنة · <a href="index.html">الرئيسية</a> · <a href="https://t.me/mehnah_eg" target="_blank" rel="noopener">تيليجرام</a> · <a href="https://wa.me/201092861985" target="_blank" rel="noopener">تواصل معنا</a>';
    app.appendChild(f);
  }
})();
