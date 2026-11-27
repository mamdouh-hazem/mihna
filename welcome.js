/* Mihna welcome splash — shows once per browser session for 3 seconds,
   then fades away. Never blocks taps or scrolling (pointer-events: none),
   and removes itself from the page completely after fading.
   Motion: soft gold particles, a glowing wordmark reveal and staggered lines.
   Sound: a soft chime. Browsers block audio before the visitor interacts,
   so it plays only when the browser allows it or on the first tap/key press
   while the splash is on screen; otherwise the splash stays silent. */
(function () {
  'use strict';
  var KEY = 'mihna_welcomed';
  var store;
  try { store = window.sessionStorage; } catch (e) { store = null; }
  if (store && store.getItem(KEY)) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css =
    '#mihna-welcome{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;' +
    'align-items:center;justify-content:center;text-align:center;padding:24px;overflow:hidden;' +
    'background:linear-gradient(160deg,#0B1D38 0%,#12294d 60%,#0B1D38 100%);' +
    'opacity:1;transition:opacity .6s ease;pointer-events:none;}' +
    '#mihna-welcome.mw-fade{opacity:0;}' +
    '#mihna-welcome .mw-glow{position:absolute;left:50%;top:50%;width:340px;height:340px;' +
    'margin:-170px 0 0 -170px;border-radius:50%;' +
    'background:radial-gradient(circle,rgba(217,176,97,.16) 0%,rgba(217,176,97,0) 65%);' +
    'animation:mw-glow 3s ease-in-out infinite;}' +
    '#mihna-welcome .mw-inner{position:relative;display:flex;flex-direction:column;align-items:center;}' +
    '#mihna-welcome .mw-word{color:#D9B061;font-family:\'Cairo\',sans-serif;font-weight:800;' +
    'font-size:52px;letter-spacing:1px;line-height:1.5;opacity:0;' +
    'animation:mw-word .9s cubic-bezier(.2,.7,.3,1) .1s forwards;}' +
    '@supports ((-webkit-background-clip:text) or (background-clip:text)){' +
    '#mihna-welcome .mw-word{background:linear-gradient(100deg,#D9B061 38%,#f6e3b0 50%,#D9B061 62%);' +
    'background-size:220% 100%;-webkit-background-clip:text;background-clip:text;' +
    '-webkit-text-fill-color:transparent;color:transparent;' +
    'animation:mw-word .9s cubic-bezier(.2,.7,.3,1) .1s forwards,mw-sheen 2.2s ease-in-out 1s 1;}}' +
    '#mihna-welcome .mw-line{color:#ffffff;font-family:\'Cairo\',sans-serif;font-weight:700;' +
    'font-size:20px;margin-top:10px;opacity:0;animation:mw-rise .7s ease .55s forwards;}' +
    '#mihna-welcome .mw-slogan{color:#e6d9b8;font-family:\'Cairo\',sans-serif;font-size:14px;' +
    'margin-top:14px;opacity:0;animation:mw-rise .7s ease .8s forwards;}' +
    '#mihna-welcome .mw-bar{width:64px;height:3px;background:#D9B061;border-radius:3px;' +
    'margin-top:18px;transform:scaleX(0);animation:mw-bar .6s ease 1.05s forwards;}' +
    '#mihna-welcome .mw-p{position:absolute;background:#D9B061;border-radius:50%;opacity:0;' +
    'box-shadow:0 0 6px 1px rgba(217,176,97,.5);animation:mw-float 3s ease-in-out infinite;}' +
    '@keyframes mw-word{from{opacity:0;transform:scale(.92);filter:blur(6px);}' +
    'to{opacity:1;transform:scale(1);filter:blur(0);}}' +
    '@keyframes mw-sheen{from{background-position:120% 0;}to{background-position:-120% 0;}}' +
    '@keyframes mw-rise{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}' +
    '@keyframes mw-bar{to{transform:scaleX(1);}}' +
    '@keyframes mw-glow{0%,100%{transform:scale(1);opacity:.8;}50%{transform:scale(1.12);opacity:1;}}' +
    '@keyframes mw-float{0%{opacity:0;transform:translateY(12px) scale(.6);}' +
    '35%{opacity:.5;}100%{opacity:0;transform:translateY(-26px) scale(1);}}' +
    '@media (prefers-reduced-motion: reduce){' +
    '#mihna-welcome .mw-glow,#mihna-welcome .mw-p{display:none;}' +
    '#mihna-welcome .mw-word,#mihna-welcome .mw-line,#mihna-welcome .mw-slogan,' +
    '#mihna-welcome .mw-bar{animation:none;opacity:1;transform:none;filter:none;}}';

  var style = document.createElement('style');
  style.textContent = css;

  var box = document.createElement('div');
  box.id = 'mihna-welcome';
  box.setAttribute('aria-hidden', 'true');
  box.innerHTML =
    '<div class="mw-glow"></div>' +
    '<div class="mw-inner">' +
    '<div class="mw-word">مهنة</div>' +
    '<div class="mw-line">أهلًا بيك، نورت!</div>' +
    '<div class="mw-slogan">من المعرفة القانونية إلى الحياة المهنية</div>' +
    '<div class="mw-bar"></div>' +
    '</div>';

  if (!reduced) {
    for (var i = 0; i < 12; i++) {
      var p = document.createElement('span');
      p.className = 'mw-p';
      p.style.left = (6 + Math.random() * 88).toFixed(1) + '%';
      p.style.top = (18 + Math.random() * 68).toFixed(1) + '%';
      var s = (2 + Math.random() * 3).toFixed(1);
      p.style.width = s + 'px';
      p.style.height = s + 'px';
      p.style.animationDelay = (Math.random() * 2.2).toFixed(2) + 's';
      p.style.animationDuration = (2.4 + Math.random() * 1.6).toFixed(2) + 's';
      box.appendChild(p);
    }
  }

  /* Soft chime: one gentle bell (E5 with soft partials), low volume, ~1.6s decay.
     Autoplay is blocked before interaction, so we try once and otherwise wait
     for the first tap/key press while the splash is visible. */
  var actx = null, chimed = false, alive = true;
  function ring() {
    if (chimed || !alive) return;
    chimed = true;
    try {
      var t = actx.currentTime + 0.02;
      var master = actx.createGain();
      master.gain.value = 0.8;
      master.connect(actx.destination);
      var partials = [[659.25, 0.09, 1.6], [987.77, 0.045, 1.2], [1318.5, 0.025, 0.8]];
      for (var k = 0; k < partials.length; k++) {
        var o = actx.createOscillator();
        var g = actx.createGain();
        o.type = 'sine';
        o.frequency.value = partials[k][0];
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(partials[k][1], t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + partials[k][2]);
        o.connect(g);
        g.connect(master);
        o.start(t);
        o.stop(t + partials[k][2] + 0.05);
      }
    } catch (e) {}
  }
  function chime() {
    if (chimed || !alive) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!actx) actx = new AC();
      if (actx.state === 'suspended') {
        actx.resume().then(ring, function () {});
      } else {
        ring();
      }
    } catch (e) {}
  }
  function onGesture() { chime(); }

  function mount() {
    document.head.appendChild(style);
    document.body.appendChild(box);
    if (store) { try { store.setItem(KEY, '1'); } catch (e) {} }
    window.addEventListener('pointerdown', onGesture);
    window.addEventListener('keydown', onGesture);
    setTimeout(chime, 250);
    var stay = reduced ? 1500 : 3000;
    setTimeout(function () {
      box.classList.add('mw-fade');
      setTimeout(function () {
        alive = false;
        window.removeEventListener('pointerdown', onGesture);
        window.removeEventListener('keydown', onGesture);
        if (box.parentNode) box.parentNode.removeChild(box);
        if (style.parentNode) style.parentNode.removeChild(style);
        if (actx) { try { actx.close(); } catch (e) {} }
      }, reduced ? 60 : 700);
    }, stay);
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
