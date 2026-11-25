/* Mihna laws library — shared data + rendering for laws.html (index) and law.html (reader). */
var LAWS = [
  {
    id: 'labor-14-2025',
    title: 'قانون العمل',
    number: 'قانون رقم 14 لسنة 2025',
    branch: 'عمل',
    status: 'ساري — لم تطرأ عليه تعديلات حتى الآن',
    source: 'الجريدة الرسمية، العدد 18 تابع، 3 مايو 2025',
    desc: 'قانون العمل الجديد كاملاً كما نُشر في الجريدة الرسمية: عقود العمل، الأجور، الإجازات، انتهاء علاقة العمل، التدريب والتأهيل، والمنازعات.',
    pdf: '1XjOshcclSLnmglCsZ5BshiUXultbHHF2'
  },
  {
    id: 'mohama-17-1983',
    title: 'قانون المحاماة',
    number: 'قانون رقم 17 لسنة 1983',
    branch: 'المهنة',
    status: 'وفقاً لآخر تعديل صادر في 8 يوليو 2020',
    source: 'النقابة العامة للمحامين — النص المحدث بآخر التعديلات',
    desc: 'القانون المنظم لمهنة المحاماة: القيد في الجداول، حقوق المحامي وواجباته، التأديب، ونقابة المحامين. النص الأساسي لكل طالب ومحامٍ جديد.',
    pdf: '1eVvP00Qa0-SUChE7Agr3xaBaXPHBxGwA'
  }
];
var LAW_BRANCHES = ['الكل', 'عمل', 'المهنة'];
function lawPreview(id) { return 'https://drive.google.com/file/d/' + id + '/preview'; }
function lawDownload(id) { return 'https://drive.usercontent.google.com/uc?id=' + id + '&export=download'; }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* ---- Index page (laws.html) ---- */
function renderLawIndex() {
  var grid = document.getElementById('laws-grid');
  if (!grid) return;
  var q = (document.getElementById('law-search').value || '').trim();
  var branch = document.getElementById('laws-grid').getAttribute('data-branch') || 'الكل';
  var list = LAWS.filter(function (l) {
    var okB = branch === 'الكل' || l.branch === branch;
    var okQ = !q || (l.title + ' ' + l.number + ' ' + l.desc).indexOf(q) !== -1;
    return okB && okQ;
  });
  grid.innerHTML = list.map(function (l) {
    return '<article class="guide-card law-card">' +
      '<span class="guide-num">' + esc(l.number) + ' · ' + esc(l.branch) + '</span>' +
      '<h3>' + esc(l.title) + '</h3>' +
      '<p class="law-desc">' + esc(l.desc) + '</p>' +
      '<p class="law-src">' + esc(l.source) + '<br>' + esc(l.status) + '</p>' +
      '<div class="guide-actions">' +
      '<a class="btn btn-gold" href="law.html?id=' + l.id + '">اقرأ على المنصة</a>' +
      '<a class="btn btn-primary" href="' + lawDownload(l.pdf) + '" target="_blank" rel="noopener">تحميل PDF</a>' +
      '</div></article>';
  }).join('') || '<p class="guide-note">لا توجد نتائج مطابقة للبحث.</p>';
}
function renderBranchChips() {
  var wrap = document.getElementById('branch-chips');
  if (!wrap) return;
  wrap.innerHTML = LAW_BRANCHES.map(function (b, i) {
    return '<button type="button" class="law-chip' + (i === 0 ? ' active' : '') + '" data-b="' + esc(b) + '">' + esc(b) + '</button>';
  }).join('');
  wrap.addEventListener('click', function (e) {
    var btn = e.target.closest('.law-chip');
    if (!btn) return;
    wrap.querySelectorAll('.law-chip').forEach(function (c) { c.classList.remove('active'); });
    btn.classList.add('active');
    document.getElementById('laws-grid').setAttribute('data-branch', btn.getAttribute('data-b'));
    renderLawIndex();
  });
}

/* ---- Reader page (law.html) ---- */
function renderLawReader() {
  var root = document.getElementById('law-reader');
  if (!root) return;
  var id = new URLSearchParams(location.search).get('id');
  var law = LAWS.find(function (l) { return l.id === id; }) || LAWS[0];
  document.title = law.title + ' | مكتبة القوانين | مهنة';
  root.innerHTML =
    '<section class="guide-intro">' +
    '<div class="chip">مكتبة القوانين</div>' +
    '<h1>' + esc(law.title) + '</h1>' +
    '<p>' + esc(law.number) + '</p>' +
    '<p>' + esc(law.desc) + '</p>' +
    '</section>' +
    '<section>' +
    '<div class="reader-head">' +
    '<h2 class="sec-title">النص الرسمي</h2>' +
    '<div class="guide-actions">' +
    '<a class="btn btn-primary" href="' + lawDownload(law.pdf) + '" target="_blank" rel="noopener">تحميل PDF</a>' +
    '</div></div>' +
    '<p class="law-src">المصدر: ' + esc(law.source) + ' — ' + esc(law.status) + '.</p>' +
    '<div id="read-area"><iframe src="' + lawPreview(law.pdf) + '" title="' + esc(law.title) + '" loading="lazy"></iframe></div>' +
    '<p class="guide-credit">النصوص منقولة عن مصادر رسمية، والنسخة الحاكمة دائماً هي المنشورة في الجريدة الرسمية.</p>' +
    '</section>';
}
document.addEventListener('DOMContentLoaded', function () {
  renderBranchChips();
  renderLawIndex();
  renderLawReader();
  var s = document.getElementById('law-search');
  if (s) s.addEventListener('input', renderLawIndex);
});
