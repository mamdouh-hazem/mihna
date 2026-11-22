/* Mihna on-site assistant — client-side FAQ chat that answers from the platform's own content,
   with a WhatsApp fallback for anything bigger. No server, no data leaves the device. */
(function () {
  var WA = 'https://wa.me/201092861985?text=' + encodeURIComponent('السلام عليكم، عندي استفسار عن منصة مهنة: ');
  var WA_ORDER = 'https://wa.me/201092861985?text=' + encodeURIComponent('السلام عليكم، أريد الاشتراك في برنامج التدريب على الصياغة من منصة مهنة (أسعار الانطلاق: المستوى الأول ٤٠٠، المستوى الثاني ٦٠٠، البرنامج الكامل ٩٠٠ جنيه).');
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
      a: 'الاختبارات مجانية. بمناسبة انطلاق المنصة: المستوى الأول من التدريب (١٤ درس) بـ٤٠٠ جنيه بدل ١٢٠٠، والمستوى الثاني (١٢ درس) بـ٦٠٠ بدل ١٥٠٠، والبرنامج الكامل بالمستويين بـ٩٠٠ جنيه بدل ٢٧٠٠ (أوفر ١٠٠ جنيه من شراء المستويين منفصلين). الدفع يدوي عبر InstaPay أو فودافون كاش — اطلب بزرار واتساب وهيتم تفعيل اشتراكك مباشرة.'
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
    '<button id="ma-fab" type="button" aria-label="اسأل مساعد مهنة">🤖</button>' +
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

  root.querySelector('#ma-fab').addEventListener('click', function () {
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
