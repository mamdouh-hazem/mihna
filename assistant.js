/* Mihna on-site assistant — client-side FAQ chat that answers from the platform's own content,
   with a WhatsApp fallback for anything bigger. No server, no data leaves the device. */
(function () {
  var WA = 'https://wa.me/201092861985?text=' + encodeURIComponent('السلام عليكم، عندي استفسار عن منصة مهنة: ');
  var WA_ORDER = 'https://wa.me/201092861985?text=' + encodeURIComponent('السلام عليكم، أريد الاشتراك في برنامج التدريب على الصياغة من منصة مهنة (أسعار الانطلاق: المستوى الأول ٢٠٠، المستوى الثاني ٣٠٠، البرنامج الكامل ٤٠٠ جنيه).');
  var WA_EXERCISE = 'https://wa.me/201092861985?text=' + encodeURIComponent('السلام عليكم، أنا متدرب في برنامج مهنة للصياغة وأريد إرسال تمريني للتقييم: ');

  var KB = [
    {
      keys: ['منصة مهنة', 'ايه المنصة', 'إيه المنصة', 'عن المنصة', 'مين انتو', 'مين انتم', 'مهنة ايه', 'مهنة إيه'],
      a: 'منصة مهنة منصة تدريبية مصرية للمحامين وحديثي التخرج: اختبارات قانونية عملية تفاعلية بتقييم فوري، وبرنامج تدريب على الصياغة (صحيفة الدعوى، مذكرة الدفاع، الإنذارات، الإعلانات) بيعادل خبرة سنتين تدريب في كبرى المكاتب. شعارنا: من المعرفة القانونية إلى الحياة المهنية.'
    },
    {
      keys: ['اختبار', 'اختبارات', 'الاختبارات'],
      a: 'عندنا حالياً ٤ اختبارات عملية: (١) جريمة النصب — مستوى تمهيدي، (٢) جريمة النصب — مستوى متقدم، (٣) جريمة الضرب والجرح — متقدم، (٤) خيانة الأمانة — متقدم. كل اختبار فيه ملخص سريع قبل البدء، وأسئلة تطبيقية على وقائع تخيلية، وتقييم فوري من ٢٥ درجة مع بطاقة نتيجة تشاركها. افتح قسم الاختبارات من القائمة فوق وابدأ.'
    },
    {
      keys: ['تقييم فوري', 'الدرجة', 'النتيجة', 'بطاقة'],
      a: 'كل اختبار بيتحسب من ٢٥ درجة، والنتيجة بتظهر فوراً بمجرد التسليم مع بطاقة نتيجة بتصميم مهنة تقدر تشاركها. ولو لسه مكملتش، تقدر ترجع تكمل من نفس الجهاز في أي وقت — تقدمك محفوظ تلقائياً.'
    },
    {
      keys: ['استكمال', 'اكمال', 'أكمل', 'رجعت', 'محفوظ', 'استئناف'],
      a: 'تقدمك في أي اختبار محفوظ تلقائياً على جهازك. ارجع لنفس الاختبار من نفس المتصفح وهتلاقي محاولة السابقة مستأنفة، وتقدر تبدأ من جديد بزرار (بدء من جديد).'
    },
    {
      keys: ['تدريب', 'الصياغة', 'درس', 'دروس', 'برنامج'],
      a: 'برنامج التدريب على الصياغة مستويان: الأول ١٤ درساً في أساسيات الصياغة (من الإنذار الرسمي إلى مذكرة الدفاع والعقود والتوكيلات)، والثاني ١٢ درساً في الممارسة المتقدمة (الجنايات والنقض ومجلس الدولة والشركات والتحكيم) وينتهي بمشروع تخرج. أول درس في كل مستوى مجاني كنموذج، وكل درس فيه شرح مبسط + نموذج معتمد + تمرين كتابة يُقيَّم لك. عند إتمام كل مستوى شهادة إتمام باسمك ورقم مسلسل، وبإتمام المستويين شهادة خبرة موقعة من مكتب المحامي ممدوح حازم.'
    },
    {
      keys: ['بكام التدريب', 'بكام تدريب', 'بكام البرنامج', 'سعر التدريب', 'سعر البرنامج', 'تكلفه', 'تكلفة', 'سعر', 'السعر', 'بكام', '٣٠٠', '300', 'فلوس', 'مدفوع', 'اشتراك'],
      hot: ['بكام', 'سعر', 'تكلف'],
      a: 'الاختبارات مجانية. بمناسبة انطلاق المنصة: المستوى الأول من التدريب (١٤ درس) بـ٢٠٠ جنيه بدل ٧٠٠، والمستوى الثاني (١٢ درس) بـ٣٠٠ بدل ٨٠٠، والبرنامج الكامل بالمستويين بـ٤٠٠ جنيه بدل ١٥٠٠ (أوفر ١١٠٠ جنيه من شراء المستويين منفصلين). الدفع يدوي عبر InstaPay أو فودافون كاش — اطلب بزرار واتساب وهيتم تفعيل اشتراكك مباشرة.'
    },
    {
      keys: ['اطلب', 'أطلب', 'ادفع', 'أدفع', 'دفع', 'انستا', 'انستاباي', 'فودافون', 'كاش', 'اشترك'],
      hot: ['اشترك', 'ادفع', 'اطلب', 'ازاي'],
      a: 'الاشتراك بيتم عبر واتساب: ابعت طلبك من الزرار ده وهيتم الرد عليك ببيانات الدفع (InstaPay أو فودافون كاش) وتفعيل اشتراكك.',
      link: { text: '💬 اطلب الاشتراك عبر واتساب', href: WA_ORDER }
    },
    {
      keys: ['تمرين', 'تمارين', 'تقييم التمرين', 'أرسل', 'ارسل', 'كتابة'],
      a: 'آخر كل درس تمرين كتابة على واقعة تخيلية. تكتبه بإيدك أو نصاً وترسله واتساب من الزرار الموجود في الدرس، وبيتقييمه لك بالملاحظات على الصياغة والبيانات الواجبة.'
    },
    {
      keys: ['قناة', 'تيليجرام', 'تليجرام', 'واتساب', 'فيسبوك', 'تابع'],
      a: 'قنوات مهنة: تيليجرام t.me/mehnah_eg — قناة واتساب whatsapp.com/channel/0029Vb9LsoQCMY0McPEvXA2o — صفحة فيسبوك facebook.com/share/1JNqb6iD5D. تابعنا علشان يوصلك كل جديد من اختبارات ودروس.'
    },
    {
      keys: ['تواصل', 'رقم', 'ايميل', 'إيميل', 'مكالمة', 'اتصل'],
      a: 'أسرع تواصل معنا عبر واتساب من الزرار ده — سواء استفسار عن المنصة أو طلب اشتراك أو إرسال تمرين.',
      link: { text: '💬 تواصل معنا واتساب', href: WA }
    },
    {
      keys: ['قانوني', 'قانونية', 'استشارة', 'قضية', 'مشكلة', 'محامي', 'محامٍ'],
      a: 'منصة مهنة منصة تعليمية تدريبية ومحتواها للتعلم العملي، وليست بديلاً عن الاستشارة القانونية الخاصة بقضيتك. لو عندك مسألة قانونية شخصية، الأفضل تكلم المحامي مباشرة.',
      link: { text: '💬 اسأل المحامي مباشرة', href: WA }
    },
    {
      keys: ['مين عمل', 'صاحب', 'المؤسس', 'مين ورا'],
      a: 'منصة مهنة مبادرة المحامي ممدوح حازم لتدريب المحامين الجدد عملياً، وكل المحتوى أصلي من تأليف المنصة.'
    }
  ];

  function norm(s) {
    return String(s || '')
      .replace(/[ً-ٰٟ]/g, '')
      .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
      .toLowerCase();
  }
  var NKB = KB.map(function (k) { return { keys: k.keys.map(norm), hot: (k.hot || []).map(norm), a: k.a, link: k.link }; });

  function answer(q) {
    var nq = norm(q);
    var best = null, bestScore = 0;
    NKB.forEach(function (k) {
      var score = 0;
      k.keys.forEach(function (kw) { if (nq.indexOf(kw) !== -1) score += kw.length; });
      k.hot.forEach(function (kw) { if (nq.indexOf(kw) !== -1) score += 100 + kw.length; });
      if (score > bestScore) { bestScore = score; best = k; }
    });
    if (best) return best;
    return {
      a: 'سؤالك محتاج رد مخصص — اسألنا مباشرة على واتساب وهنرد عليك بنفسنا.',
      link: { text: '💬 اسأل على واتساب', href: WA }
    };
  }

  // ---- UI ----
  var root = document.createElement('div');
  root.id = 'mihna-assistant';
  root.innerHTML =
    '<button id="ma-fab" type="button" aria-label="اسأل مساعد مهنة"><img id="ma-fab-logo" src="data:image/png;base64,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" alt="شعار مهنة - ميزان العدالة"/></button>' +
    '<div id="ma-hint" role="note">أنا هنا لمساعدتك، تعالى اسألني<button id="ma-hint-close" type="button" aria-label="إخفاء">✕</button></div>' +
    '<div id="ma-panel" hidden>' +
      '<div id="ma-head"><span>مساعد مهنة 🤖</span><button id="ma-close" type="button" aria-label="إغلاق">✕</button></div>' +
      '<div id="ma-msgs"></div>' +
      '<div id="ma-chips"></div>' +
      '<div id="ma-form"><input id="ma-input" type="text" placeholder="اكتب سؤالك هنا…" autocomplete="off"><button id="ma-send" type="button">إرسال</button></div>' +
    '</div>';
  document.body.appendChild(root);

  var msgs = root.querySelector('#ma-msgs');
  var chips = root.querySelector('#ma-chips');
  var input = root.querySelector('#ma-input');
  var panel = root.querySelector('#ma-panel');

  function addMsg(text, who, link) {
    var d = document.createElement('div');
    d.className = 'ma-msg ' + who;
    d.textContent = text;
    if (link) {
      var a = document.createElement('a');
      a.className = 'ma-link';
      a.href = link.href;
      a.target = '_blank'; a.rel = 'noopener';
      a.textContent = link.text;
      d.appendChild(a);
    }
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function ask(q) {
    if (!q.trim()) return;
    addMsg(q, 'ma-user');
    input.value = '';
    var r = answer(q);
    setTimeout(function () { addMsg(r.a, 'ma-bot', r.link); }, 350);
  }

  var SUGGEST = ['إيه هي منصة مهنة؟', 'الاختبارات المتاحة', 'سعر تدريب الصياغة؟', 'إزاي أشترك؟'];
  SUGGEST.forEach(function (s) {
    var c = document.createElement('button');
    c.type = 'button'; c.className = 'ma-chip'; c.textContent = s;
    c.addEventListener('click', function () { ask(s); });
    chips.appendChild(c);
  });

  var maHint = root.querySelector('#ma-hint');
  if (sessionStorage.getItem('ma-hint-seen') || localStorage.getItem('ma-hint-seen')) maHint.style.display = 'none';
  else setTimeout(function () { maHint.classList.add('show'); }, 1200);
  function maHintDismiss(remember) {
    maHint.classList.remove('show');
    if (remember) { try { localStorage.setItem('ma-hint-seen', '1'); } catch (e) {} sessionStorage.setItem('ma-hint-seen', '1'); }
  }
  setTimeout(function () { maHintDismiss(true); }, 12000);
  root.querySelector('#ma-hint-close').addEventListener('click', function (e) { e.stopPropagation(); maHintDismiss(true); });
  root.querySelector('#ma-fab').addEventListener('click', function () {
    maHintDismiss(true);
    var opening = panel.hidden;
    panel.hidden = !opening;
    if (opening && !msgs.children.length) {
      addMsg('أهلاً بيك في منصة مهنة 👋 اسألني عن الاختبارات أو تدريب الصياغة أو الاشتراك، وأنا أجاوبك فوراً.', 'ma-bot');
    }
    if (opening) input.focus();
  });
  root.querySelector('#ma-close').addEventListener('click', function () { panel.hidden = true; });
  root.querySelector('#ma-send').addEventListener('click', function () { ask(input.value); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') ask(input.value); });
})();
