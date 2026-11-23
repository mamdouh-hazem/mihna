/* Mihna shared navigation — injects a nav bar right after the brand header on every page. */
(function () {
  function buildNav() {
    var nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.setAttribute('aria-label', 'التنقل الرئيسي');
    nav.innerHTML =
      '<a href="index.html">🏠 الرئيسية</a>' +
      '<a href="index.html#tests">⚖️ الاختبارات</a>' +
      '<a href="index.html#training">⚖️ التدريب المهني</a>' +
      '<a href="guides.html">📚 دليل المحامي المبتدئ</a>' +
      '<a href="index.html#follow">تابعنا</a>' +
      '<a href="https://wa.me/201092861985?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D9%84%D8%AF%D9%8A%20%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%85%D9%86%D8%B5%D8%A9%20%D9%85%D9%87%D9%86%D8%A9." target="_blank" rel="noopener">تواصل</a>';
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
