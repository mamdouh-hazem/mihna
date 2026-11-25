/* Mihna shared navigation — injects a sticky nav bar right after the brand header.
   Desktop: inline link strip. Mobile: hamburger button that opens an animated
   drop-down panel (hakamat-style pattern, Mehna identity, text-only links). */
(function () {
  var LINKS = [
    { href: 'index.html', text: 'الرئيسية' },
    { href: 'index.html#tests', text: 'الاختبارات' },
    { href: 'index.html#training', text: 'التدريب المهني' },
    { href: 'guides.html', text: 'دليل المحامي المبتدئ' },
    { href: 'pro.html', text: 'دليل المحامي المحترف' },
    { href: 'index.html#follow', text: 'تابعنا' },
    { href: 'https://wa.me/201092861985?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D9%84%D8%AF%D9%8A%20%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%85%D9%86%D8%B5%D8%A9%20%D9%85%D9%87%D9%86%D8%A9.', text: 'تواصل معنا', external: true }
  ];
  function linkTags() {
    return LINKS.map(function (l) {
      var ext = l.external ? ' target="_blank" rel="noopener"' : '';
      return '<a href="' + l.href + '"' + ext + '>' + l.text + '</a>';
    }).join('');
  }
  function wire(nav) {
    var toggle = nav.querySelector('.nav-toggle');
    if (!toggle) return;
    function setOpen(open) {
      nav.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
    }
    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('nav-open'));
    });
    Array.prototype.forEach.call(nav.querySelectorAll('.nav-panel a'), function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) setOpen(false);
    });
  }
  function buildNav() {
    var nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.setAttribute('aria-label', 'التنقل الرئيسي');
    nav.innerHTML =
      '<div class="nav-bar">' +
        '<span class="nav-bar-title">القائمة</span>' +
        '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-panel" aria-label="فتح القائمة">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
      '</div>' +
      '<div class="nav-panel" id="nav-panel">' + linkTags() + '</div>' +
      '<div class="nav-links">' + linkTags() + '</div>';
    wire(nav);
    return nav;
  }
  function tryInject() {
    if (document.querySelector('.site-nav')) return true;
    var brand = document.querySelector('.brand');
    if (!brand) return false;
    brand.parentNode.insertBefore(buildNav(), brand.nextSibling);
    return true;
  }
  function start() {
    if (tryInject()) return;
    // Pages whose header is rendered by an engine script after fetch: watch for it.
    var obs = new MutationObserver(function () {
      if (tryInject()) obs.disconnect();
    });
    obs.observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
