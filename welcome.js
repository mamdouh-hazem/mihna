/* Mihna welcome splash — shows once per browser session for 3 seconds,
   then fades away. Never blocks taps or scrolling (pointer-events: none),
   and removes itself from the page completely after fading. */
(function () {
  'use strict';
  var KEY = 'mihna_welcomed';
  var store;
  try { store = window.sessionStorage; } catch (e) { store = null; }
  if (store && store.getItem(KEY)) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css =
    '#mihna-welcome{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;' +
    'align-items:center;justify-content:center;text-align:center;padding:24px;' +
    'background:linear-gradient(160deg,#0B1D38 0%,#12294d 60%,#0B1D38 100%);' +
    'opacity:1;transition:opacity .6s ease;pointer-events:none;}' +
    '#mihna-welcome.mw-fade{opacity:0;}' +
    '#mihna-welcome .mw-word{color:#D9B061;font-family:\'Cairo\',sans-serif;font-weight:800;' +
    'font-size:52px;letter-spacing:1px;line-height:1.5;}' +
    '#mihna-welcome .mw-line{color:#ffffff;font-family:\'Cairo\',sans-serif;font-weight:700;' +
    'font-size:20px;margin-top:10px;}' +
    '#mihna-welcome .mw-slogan{color:#e6d9b8;font-family:\'Cairo\',sans-serif;font-size:14px;' +
    'margin-top:14px;}' +
    '#mihna-welcome .mw-bar{width:64px;height:3px;background:#D9B061;border-radius:3px;margin-top:18px;}';

  var style = document.createElement('style');
  style.textContent = css;

  var box = document.createElement('div');
  box.id = 'mihna-welcome';
  box.setAttribute('aria-hidden', 'true');
  box.innerHTML =
    '<div class="mw-word">مهنة</div>' +
    '<div class="mw-line">أهلًا بيك، نورت!</div>' +
    '<div class="mw-slogan">من المعرفة القانونية إلى الحياة المهنية</div>' +
    '<div class="mw-bar"></div>';

  function mount() {
    document.head.appendChild(style);
    document.body.appendChild(box);
    if (store) { try { store.setItem(KEY, '1'); } catch (e) {} }
    var stay = reduced ? 1500 : 3000;
    setTimeout(function () {
      box.classList.add('mw-fade');
      setTimeout(function () {
        if (box.parentNode) box.parentNode.removeChild(box);
        if (style.parentNode) style.parentNode.removeChild(style);
      }, reduced ? 60 : 700);
    }, stay);
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
