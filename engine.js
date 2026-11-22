/* Mihna test engine — data-driven from tests/<id>.json */
(function () {
  var AR = '٠١٢٣٤٥٦٧٨٩';
  function toAr(n) { return String(n).replace(/[0-9]/g, function (d) { return AR[+d]; }); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  var params = new URLSearchParams(location.search);
  var testId = params.get('test') || 'nasb-01';
  var storeKey = 'mihna:test:' + testId;
  var T = null; // test data
  var S = { mode: null, theory: {}, cases: {}, done: false }; // state

  function save() { try { localStorage.setItem(storeKey, JSON.stringify(S)); } catch (e) {} }
  function load() {
    try { var raw = localStorage.getItem(storeKey); if (raw) { var d = JSON.parse(raw); if (d && typeof d === 'object') S = d; } } catch (e) {}
  }
  function caseState(i) {
    if (!S.cases[i]) S.cases[i] = { sel: [], draft: '' };
    if (!Array.isArray(S.cases[i].sel)) S.cases[i].sel = [];
    if (typeof S.cases[i].draft !== 'string') S.cases[i].draft = '';
    return S.cases[i];
  }

  fetch(encodeURIComponent(testId) + '.json')
    .then(function (r) { if (!r.ok) throw new Error('not found'); return r.json(); })
    .then(function (d) { T = d; load(); render(); })
    .catch(function () {
      document.getElementById('app').innerHTML = '<div class="card"><h2>الاختبار غير موجود</h2><p>تأكد من الرابط أو ارجع إلى <a href="index.html">صفحة الاختبارات</a>.</p></div>';
    });

  function render() {
    document.title = T.title + ' | اختبارات مهنة';
    var app = document.getElementById('app');
    app.innerHTML = '';

    // Brand header
    var head = el('header', 'brand');
    head.innerHTML =
      '<a class="brand-home" href="index.html">مهنة</a>' +
      '<div class="brand-slogan">من المعرفة القانونية إلى الحياة المهنية</div>';
    app.appendChild(head);

    var hero = el('section', 'hero card');
    hero.innerHTML =
      '<div class="chip">' + esc(T.subject || '') + '</div>' +
      '<h1>اختبار رقم (' + esc(T.number) + ')</h1>' +
      '<h2>' + esc(T.title) + '</h2>' +
      '<p class="sub">' + esc(T.subtitle) + '</p>';
    app.appendChild(hero);

    if (hadProgress()) {
      var rb = el('div', 'resume-banner', '⏪ وجدنا محاولة سابقة محفوظة على جهازك، تم استئنافها تلقائياً. <button type="button" id="restartTop">بدء من جديد</button>');
      app.appendChild(rb);
    }

    // Teach section
    var teach = el('section', 'card teach');
    teach.innerHTML = '<h2 class="sec-title">📚 أولاً: الملخص قبل الاختبار</h2>';
    (T.teach || []).forEach(function (sec) {
      var d = el('details', 'teach-item');
      d.innerHTML = '<summary>' + esc(sec.heading) + '</summary><p>' + esc(sec.body) + '</p>';
      teach.appendChild(d);
    });
    var map = el('div', 'defense-map');
    map.innerHTML = '🛡️ <b>خريطة الدفوع العشرة في قضايا النصب:</b><br>' + esc(T.defenses_map);
    teach.appendChild(map);
    app.appendChild(teach);

    // Mode picker
    var mp = el('section', 'card mode-card');
    mp.innerHTML = '<h2 class="sec-title">🎯 اختر وضع الاختبار</h2>' +
      '<div class="mode-row">' +
      '<button type="button" class="mode-btn" data-mode="learn"><b>وضع التعلّم</b><span>تصحيح فوري بعد كل سؤال وتقييم لكل واقعة على حدة — الأفضل لأول مرة</span></button>' +
      '<button type="button" class="mode-btn" data-mode="exam"><b>وضع الامتحان</b><span>تجاوب على كل حاجة لوحدك، والتقييم الكامل في الآخر مرة واحدة</span></button>' +
      '</div>';
    app.appendChild(mp);

    var body = el('div', 'test-body');
    app.appendChild(body);

    // Progress
    var prog = el('div', 'progress-wrap');
    prog.innerHTML = '<div class="progress-label" id="progLabel"></div><div class="progress-bar"><div class="progress-fill" id="progFill"></div></div>';
    app.appendChild(prog);

    // Results container
    var results = el('section', 'results', '');
    results.id = 'results';
    results.style.display = 'none';
    app.appendChild(results);

    mp.querySelectorAll('.mode-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        S.mode = b.getAttribute('data-mode'); save();
        mp.style.display = 'none';
        buildTest(body);
        window.scrollTo({ top: body.offsetTop - 10, behavior: 'smooth' });
      });
    });
    var rt = document.getElementById('restartTop');
    if (rt) rt.addEventListener('click', restart);

    if (S.mode) { mp.style.display = 'none'; buildTest(body); }
  }

  function hadProgress() {
    if (S.mode) return true;
    if (Object.keys(S.theory || {}).length) return true;
    for (var k in (S.cases || {})) { if (S.cases[k].sel.length || S.cases[k].draft.trim()) return true; }
    return false;
  }

  function restart() {
    try { localStorage.removeItem(storeKey); } catch (e) {}
    location.reload();
  }

  function updateProgress() {
    var t = 0; Object.keys(S.theory || {}).forEach(function (k) { if (S.theory[k] != null) t++; });
    var c = 0;
    for (var i = 0; i < T.cases.length; i++) { var cs = caseState(i); if (cs.sel.length === 2 && cs.draft.trim()) c++; }
    var total = T.theory.length + T.cases.length;
    var doneN = t + c;
    var lbl = document.getElementById('progLabel');
    var fill = document.getElementById('progFill');
    if (lbl) lbl.textContent = 'تقدمك: ' + toAr(doneN) + ' من ' + toAr(total) + ' (نظري: ' + toAr(t) + '/' + toAr(T.theory.length) + ' · وقائع مكتملة: ' + toAr(c) + '/' + toAr(T.cases.length) + ')';
    if (fill) fill.style.width = Math.round(doneN * 100 / total) + '%';
  }

  function buildTest(body) {
    body.innerHTML = '';

    // Part 1: theory
    var p1 = el('section', 'card');
    p1.innerHTML = '<h2 class="sec-title">📝 الجزء الأول: الاختبار النظري (' + toAr(T.theory.length) + ' أسئلة اختيار من متعدد)</h2>';
    T.theory.forEach(function (q, qi) {
      var qc = el('div', 'q-card');
      qc.id = 'q' + qi;
      qc.innerHTML = '<div class="q-title">' + toAr(qi + 1) + '. ' + esc(q.q) + '</div>';
      var opts = el('div', 'opts');
      q.options.forEach(function (op, oi) {
        var lab = el('label', 'opt');
        var r = document.createElement('input');
        r.type = 'radio'; r.name = 'q' + qi; r.value = oi;
        if (S.theory[qi] === oi) r.checked = true;
        r.addEventListener('change', function () {
          S.theory[qi] = oi; save(); updateProgress();
          if (S.mode === 'learn') showTheoryFeedback(qi, qc);
          qc.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('picked'); });
          lab.classList.add('picked');
        });
        lab.appendChild(r);
        lab.appendChild(el('span', null, esc(op)));
        opts.appendChild(lab);
      });
      qc.appendChild(opts);
      qc.appendChild(el('div', 'inline-feedback'));
      p1.appendChild(qc);
      if (S.mode === 'learn' && S.theory[qi] != null) showTheoryFeedback(qi, qc);
    });
    body.appendChild(p1);

    // Part 2: cases
    var p2 = el('section', 'card');
    p2.innerHTML = '<h2 class="sec-title">✍️ الجزء الثاني: التطبيق العملي وصياغة مذكرة الدفاع (' + toAr(T.cases.length) + ' وقائع تخيلية)</h2>' +
      '<p class="hint">اقرأ أوراق كل واقعة بعناية كأنك وكيل المتهم، اختر الدفعين الصحيحين، ثم صُغهما بأسلوب مذكرة الدفاع مع ربطهما بأدلة الأوراق.</p>';
    T.cases.forEach(function (c, ci) {
      var cc = el('div', 'case-card');
      cc.id = 'case' + ci;
      cc.innerHTML = '<div class="case-title">📁 ' + esc(c.title) + '</div><div class="case-brief">📋 <b>تفاصيل أوراق المحضر:</b> ' + esc(c.brief) + '</div>';
      cc.appendChild(el('div', 'q-title', 'أولاً: اختر الدفعين الصحيحين الأنسب لهذه الواقعة (اختر ٢ فقط):'));
      var opts = el('div', 'opts');
      var cs = caseState(ci);
      c.options.forEach(function (op) {
        var lab = el('label', 'opt');
        var cb = document.createElement('input');
        cb.type = 'checkbox'; cb.value = op.id;
        if (cs.sel.indexOf(op.id) !== -1) cb.checked = true;
        cb.addEventListener('change', function () {
          var cur = caseState(ci);
          if (cb.checked) {
            if (cur.sel.length >= 2) { cb.checked = false; flash(cc, 'اخترت دفعين بالفعل — ارفع اختياراً قبل إضافة غيره'); return; }
            cur.sel.push(op.id);
          } else {
            cur.sel = cur.sel.filter(function (x) { return x !== op.id; });
          }
          save(); updateProgress();
        });
        lab.appendChild(cb);
        lab.appendChild(el('span', null, esc(op.text)));
        opts.appendChild(lab);
      });
      cc.appendChild(opts);
      cc.appendChild(el('div', 'q-title', 'ثانياً: صُغ الدفعين بأسلوب مذكرة الدفاع مع ربطهما بتفاصيل الأوراق:'));
      var ta = document.createElement('textarea');
      ta.className = 'draft';
      ta.rows = 6;
      ta.placeholder = 'اكتب صياغتك هنا… مثال البداية: يتمسك الدفاع بـ…';
      ta.value = cs.draft;
      ta.addEventListener('input', function () { caseState(ci).draft = ta.value; save(); updateProgress(); });
      cc.appendChild(ta);
      cc.appendChild(el('div', 'inline-feedback'));
      if (S.mode === 'learn') {
        var btn = el('button', 'btn btn-gold case-check', '⚖️ قيّم هذه الواقعة');
        btn.type = 'button';
        btn.addEventListener('click', function () { evaluateCase(ci, cc, true); });
        cc.appendChild(btn);
      }
      p2.appendChild(cc);
    });
    body.appendChild(p2);

    // Submit
    var sub = el('div', 'submit-wrap');
    var sb = el('button', 'btn btn-primary', S.mode === 'exam' ? '✅ اعتماد النتيجة النهائية' : '🏁 إظهار النتيجة النهائية');
    sb.type = 'button';
    sb.id = 'submitBtn';
    sb.addEventListener('click', evaluateAll);
    sub.appendChild(sb);
    sub.appendChild(el('div', 'error-banner'));
    sub.querySelector('.error-banner').id = 'errBanner';
    body.appendChild(sub);

    updateProgress();
  }

  function flash(node, msg) {
    var f = node.querySelector('.inline-feedback');
    if (!f) return;
    f.innerHTML = '<div class="error-tag">' + esc(msg) + '</div>';
    setTimeout(function () { if (f.textContent.indexOf(msg) !== -1) f.innerHTML = ''; }, 2600);
  }

  function showTheoryFeedback(qi, qc) {
    var q = T.theory[qi];
    var picked = S.theory[qi];
    var ok = picked === q.correct;
    var f = qc.querySelector('.inline-feedback');
    var opts = qc.querySelectorAll('.opt');
    opts.forEach(function (o, oi) {
      o.classList.remove('ok', 'bad');
      if (oi === q.correct) o.classList.add('ok');
      else if (oi === picked) o.classList.add('bad');
    });
    f.innerHTML = '<div class="fb-card ' + (ok ? 'fb-ok' : 'fb-bad') + '">' +
      '<b>' + (ok ? '✅ إجابة صحيحة' : '❌ إجابة غير صحيحة') + '</b>' +
      (ok ? '' : '<div class="error-tag">الخطأ الذي وقع هنا: ' + esc(q.trap) + '</div>') +
      '<div class="fix-box">💡 <b>التوضيح القانوني:</b> ' + esc(q.exp) + '</div></div>';
  }

  function gradeCase(ci) {
    var c = T.cases[ci];
    var cs = caseState(ci);
    var match = 0;
    c.expected.forEach(function (id) { if (cs.sel.indexOf(id) !== -1) match++; });
    var draft = cs.draft.trim();
    var words = draft.split(/\s+/).filter(function (w) { return w.length; }).length;
    var kw = 0;
    c.keywords.forEach(function (k) { if (draft.indexOf(k) !== -1) kw++; });
    var errors = [];
    c.common_errors.forEach(function (ce) {
      var hit = ce.needles.every(function (n) { return draft.indexOf(n) !== -1; });
      if (hit) errors.push(ce);
    });
    if (words < 16) {
      errors.push({ err: 'الصياغة مختصرة جداً وتفتقر إلى سرد وجه الدفع وربطه بدليله المحدد من واقع الأوراق.', fix: 'لا تكتفِ بذكر اسم الدفع؛ اذكر مضمون كل دليل (العقد، الإيصال، المراسلات، كشف الحساب، أقوال المجني عليه) وموضع التعارض أو القصور، ثم اختم بالطلب المناسب.' });
    } else if (kw < 2) {
      errors.push({ err: 'الصياغة عامة ولم تربط الدفوع بالتفاصيل المحددة لهذه الواقعة.', fix: 'اربط كل دفع بالتفاصيل الفعلية للواقعة حتى لا يتحول إلى كلام مرسل يصلح لأي قضية.' });
    }
    var draftScore = 3;
    if (errors.length >= 2 || words < 10) draftScore = 1;
    else if (errors.length === 1 || kw < 3) draftScore = 2;
    return { choice: match, draftScore: draftScore, total: match + draftScore, errors: errors, draft: draft };
  }

  function caseFeedbackHTML(ci, g) {
    var c = T.cases[ci];
    var cls = g.total === 5 ? 'fb-ok' : (g.total >= 3 ? 'fb-warn' : 'fb-bad');
    var icon = g.total === 5 ? '✅' : (g.total >= 3 ? '⚠️' : '❌');
    var h = '<div class="fb-card ' + cls + '">' +
      '<div class="fb-head">' + icon + ' ' + esc(c.title.split('—')[0].trim()) + ' (' + toAr(g.total) + ' من ٥ — الاختيار: ' + toAr(g.choice) + '/٢ · الصياغة: ' + toAr(g.draftScore) + '/٣)</div>' +
      (g.draft ? '<div class="your-draft"><b>صياغتك المكتوبة:</b> ' + esc(g.draft) + '</div>' : '');
    if (g.choice < 2) h += '<div class="error-tag">❌ خطأ في اختيار الدفوع: أصبت ' + toAr(g.choice) + ' من ٢ — راجع الصياغة النموذجية أدناه لتعرف الدفعين المنضبطين وتتجنب الخيارات المضللة.</div>';
    g.errors.forEach(function (e) {
      h += '<div class="error-tag">❌ ' + esc(e.err) + '</div><div class="fix-box">🛠️ <b>التعديل المطلوب:</b> ' + esc(e.fix) + '</div>';
    });
    h += '<div class="model-box"><b>📜 الصياغة النموذجية المعتمدة:</b><br>' + esc(c.model) + '</div></div>';
    return h;
  }

  function evaluateCase(ci, cc, scroll) {
    var cs = caseState(ci);
    var f = cc.querySelector('.inline-feedback');
    if (cs.sel.length !== 2 || !cs.draft.trim()) {
      f.innerHTML = '<div class="error-tag">⚠️ اختر دفعين (٢ فقط) واكتب صياغتهما في المربع قبل التقييم.</div>';
      return false;
    }
    f.innerHTML = caseFeedbackHTML(ci, gradeCase(ci));
    if (scroll) f.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return true;
  }

  function evaluateAll() {
    var banner = document.getElementById('errBanner');
    var missing = [];
    for (var i = 0; i < T.theory.length; i++) if (S.theory[i] == null) missing.push(i);
    var caseBad = [];
    for (var j = 0; j < T.cases.length; j++) { var cs = caseState(j); if (cs.sel.length !== 2 || !cs.draft.trim()) caseBad.push(j); }
    if (missing.length || caseBad.length) {
      var msg = '⚠️ قبل اعتماد النتيجة: ';
      if (missing.length) msg += 'أجب على كل أسئلة الجزء النظري (ناقص ' + toAr(missing.length) + ')';
      if (missing.length && caseBad.length) msg += '، و';
      if (caseBad.length) msg += 'أكمل الوقائع (لكل واقعة: دفعان + صياغة) — ناقص ' + toAr(caseBad.length);
      banner.innerHTML = msg; banner.style.display = 'block';
      var target = missing.length ? document.getElementById('q' + missing[0]) : document.getElementById('case' + caseBad[0]);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    banner.style.display = 'none';

    var theoryScore = 0, theoryHTML = '';
    T.theory.forEach(function (q, qi) {
      var ok = S.theory[qi] === q.correct;
      if (ok) theoryScore++;
      theoryHTML += '<div class="fb-card ' + (ok ? 'fb-ok' : 'fb-bad') + '">' +
        '<div class="fb-head">' + (ok ? '✅' : '❌') + ' السؤال ' + toAr(qi + 1) + '</div>' +
        (ok ? '' : '<div class="error-tag">الخطأ الذي وقع هنا: ' + esc(q.trap) + '</div>') +
        '<div class="fix-box">💡 <b>التصحيح والتوضيح القانوني:</b> ' + esc(q.exp) + '</div></div>';
    });

    var practicalScore = 0, practicalHTML = '';
    T.cases.forEach(function (c, ci) {
      var g = gradeCase(ci);
      practicalScore += g.total;
      practicalHTML += caseFeedbackHTML(ci, g);
    });

    var total = theoryScore + practicalScore;
    var tier, tierCls;
    if (total >= 22) { tier = '🏆 صياغة متقنة — أتقنت الأساس النظري واستخراج الدفوع وصياغتها وتجنب الأخطاء!'; tierCls = 't1'; }
    else if (total >= 17) { tier = '⚖️ مستوى جيد جداً — راجع الأخطاء المرصودة والتعديلات وقارن بالنموذج!'; tierCls = 't2'; }
    else if (total >= 12) { tier = '✍️ محاولة جيدة — راجع ملاحظات كشف الأخطاء والصياغة النموذجية وأعد المحاولة!'; tierCls = 't3'; }
    else { tier = '📚 بحاجة لمراجعة — ارجع للملخص النظري وتعلم من الأخطاء الموضحة ثم أعد المحاولة'; tierCls = 't4'; }

    var res = document.getElementById('results');
    var shareUrl = location.origin + location.pathname + '?test=' + encodeURIComponent(testId);
    var shareText = 'سجّلت ' + toAr(total) + ' من ' + toAr(25) + ' في اختبار «' + T.title + '» على منصة مهنة ⚖️ من المعرفة القانونية إلى الحياة المهنية — جرّب نفسك: ' + shareUrl;
    res.innerHTML =
      '<div class="final-badge ' + tierCls + '"><h2>النتيجة النهائية: ' + toAr(total) + ' من ' + toAr(25) + '</h2>' +
      '<p><b>النظري:</b> ' + toAr(theoryScore) + '/١٠ · <b>العملي والصياغة:</b> ' + toAr(practicalScore) + '/١٥</p><p>' + tier + '</p></div>' +
      '<div class="card share-card"><h3>📣 شارك نتيجتك</h3><p class="share-text" id="shareText">' + esc(shareText) + '</p>' +
      '<div class="share-row">' +
      '<button type="button" class="btn btn-gold" id="copyShare">📋 نسخ النتيجة</button>' +
      '<a class="btn btn-primary" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(shareText) + '">واتساب</a>' +
      '<a class="btn btn-primary" target="_blank" rel="noopener" href="https://t.me/share/url?url=' + encodeURIComponent(shareUrl) + '&text=' + encodeURIComponent(shareText) + '">تيليجرام</a>' +
      '<button type="button" class="btn btn-ghost" id="restartBtn">🔁 إعادة الاختبار</button>' +
      '</div></div>' +
      '<div class="card"><h3 class="sec-title">📝 مراجعة الجزء النظري</h3>' + theoryHTML + '</div>' +
      '<div class="card"><h3 class="sec-title">✍️ مراجعة التطبيق العملي</h3>' + practicalHTML + '</div>' +
      '<div class="card signoff">🎓 أحسنت! أتممت «' + esc(T.title) + '» على منصة مهنة. تذكر: قوة الدفع الجنائي ليست في حفظ اسمه، بل في استخراجه من واقع الأوراق وربطه بدليله المحدد.' +
      '<div class="follow-row">📣 تابع مهنة: <a href="https://t.me/mehnah_eg" target="_blank" rel="noopener">قناة تيليجرام</a> · <a href="https://whatsapp.com/channel/0029Vb9LsoQCMY0McPEvXA2o" target="_blank" rel="noopener">قناة واتساب</a> · <a href="https://www.facebook.com/share/1JNqb6iD5D/" target="_blank" rel="noopener">صفحة فيسبوك</a><br>🎓 برنامج التدريب على الصياغة — يعادل خبرة سنتين في كبرى المكاتب — ٣٠٠ جنيه (سعر تأسيسي لأول دفعة): <a href="https://wa.me/201092861985?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D8%AC%20%D8%A7%D9%84%D8%AA%D8%AF%D8%B1%D9%8A%D8%A8%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%B5%D9%8A%D8%A7%D8%BA%D8%A9%20%D9%85%D9%86%20%D9%85%D9%86%D8%B5%D8%A9%20%D9%85%D9%87%D9%86%D8%A9%20%D8%A8%D8%A7%D9%84%D8%B3%D8%B9%D8%B1%20%D8%A7%D9%84%D8%AA%D8%A3%D8%B3%D9%8A%D8%B3%D9%8A%20%D9%A3%D9%A0%D9%A0%20%D8%AC%D9%86%D9%8A%D9%87." target="_blank" rel="noopener">اطلب الاشتراك عبر واتساب</a></div></div>';
    res.style.display = 'block';
    var sb = document.getElementById('submitBtn');
    if (sb) sb.style.display = 'none';
    S.done = true; save();

    document.getElementById('copyShare').addEventListener('click', function () {
      var txt = shareText;
      var done = this; function okMsg() { done.textContent = '✅ تم النسخ'; setTimeout(function () { done.textContent = '📋 نسخ النتيجة'; }, 2000); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(okMsg, function () { fallbackCopy(txt); okMsg(); });
      } else { fallbackCopy(txt); okMsg(); }
    });
    document.getElementById('restartBtn').addEventListener('click', restart);
    res.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function fallbackCopy(txt) {
    var ta = document.createElement('textarea');
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }
})();
