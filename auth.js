/* Mehna members gate — Google sign-in via Firebase Authentication (free Spark tier).
   The homepage stays open; the tests/training sections and the content pages
   (test.html, lesson.html, guides.html) ask the visitor to sign in with Google.
   Members list lives in the owner's Firebase console (Authentication > Users). */
(function () {
  'use strict';

  var FIREBASE_CONFIG = {
    apiKey: 'AIzaSyACXL2-aSAunWOjh0232PnXx-iP6rj6Ktc',
    authDomain: 'mehna-61199.firebaseapp.com',
    projectId: 'mehna-61199',
    appId: '1:678176864138:web:8613b179f5d1f37738ba73'
  };

  var SDK = '10.13.2';
  var GATED_SECTIONS = ['tests', 'training', 'training-2'];
  var FULL_GATE = /\/(test|lesson|guides)\.html($|\?)/.test(location.pathname + location.search);

  var CSS =
    '.mh-wall{background:linear-gradient(160deg,rgba(11,29,56,.96),rgba(27,68,120,.94));' +
    'display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;' +
    'padding:34px 22px;border-radius:18px;z-index:60;color:#fff;gap:10px}' +
    '.mh-wall-full{position:fixed;inset:0;border-radius:0;z-index:9999}' +
    '.mh-wall-section{position:absolute;inset:0;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}' +
    '.mh-wall-brand{font-family:"Aref Ruqaa",serif;font-size:40px;line-height:1.6;' +
    'background:linear-gradient(135deg,#ecd096,#D9B061 55%,#c9a24e);-webkit-background-clip:text;background-clip:text;' +
    '-webkit-text-fill-color:transparent}' +
    '.mh-wall-lock{font-size:30px}' +
    '.mh-wall-title{font-size:21px;font-weight:800;margin:0}' +
    '.mh-wall-sub{font-size:15px;color:#dbe2ee;line-height:1.9;margin:0;max-width:420px}' +
    '.mh-google-btn{display:inline-flex;align-items:center;gap:10px;background:#fff;color:#1d2433;' +
    'border:none;border-radius:12px;padding:12px 22px;font-family:inherit;font-size:16px;font-weight:800;' +
    'cursor:pointer;margin-top:10px;box-shadow:0 6px 18px rgba(0,0,0,.25)}' +
    '.mh-google-btn:hover{background:#f1f3f7}' +
    '.mh-google-btn:disabled{opacity:.6;cursor:default}' +
    '.mh-wall-err{color:#ffb4ab;font-size:14px;min-height:20px;margin:0}' +
    '.mh-wall-note{font-size:13px;color:#aab6cc;margin:0}' +
    '.mh-member{display:inline-flex;align-items:center;gap:8px;font-size:14px;color:var(--navy,#0B1D38);font-weight:700}' +
    '.mh-member button{background:none;border:1px solid var(--gold,#D9B061);color:var(--navy,#0B1D38);' +
    'border-radius:8px;padding:3px 10px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer}' +
    '.mh-gated{position:relative}';

  var G_LOGO =
    '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z"/></svg>';

  var auth = null;
  var walls = [];
  var signingIn = false;

  function injectStyles() {
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function loadScript(src, done) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () { done(); };
    s.onerror = function () { showError('تعذر تحميل نظام تسجيل الدخول. حدّث الصفحة وحاول مرة أخرى.'); };
    document.head.appendChild(s);
  }

  function showError(msg) {
    var el = document.querySelector('.mh-wall-err');
    if (el) el.textContent = msg;
  }

  function buildWall(fullPage) {
    var w = document.createElement('div');
    w.className = 'mh-wall ' + (fullPage ? 'mh-wall-full' : 'mh-wall-section');
    w.setAttribute('role', 'dialog');
    w.setAttribute('aria-label', 'تسجيل الدخول لمنصة مهنة');
    w.innerHTML =
      '<div class="mh-wall-brand">مهنة</div>' +
      '<div class="mh-wall-lock">🔒</div>' +
      '<p class="mh-wall-title">هذا المحتوى لأعضاء المنصة</p>' +
      '<p class="mh-wall-sub">سجّل دخولك بحساب جوجل لمتابعة الاختبارات العملية ودروس التدريب والأدلة. التسجيل مجاني ويستغرق ثواني.</p>' +
      '<button type="button" class="mh-google-btn">' + G_LOGO + '<span>الدخول بحساب جوجل</span></button>' +
      '<p class="mh-wall-err" aria-live="polite"></p>' +
      '<p class="mh-wall-note">بدخولك أنت عضو في مجتمع مهنة — من المعرفة القانونية إلى الحياة المهنية</p>';
    w.querySelector('.mh-google-btn').addEventListener('click', signIn);
    return w;
  }

  function mountWalls() {
    if (FULL_GATE) {
      var w = buildWall(true);
      document.body.appendChild(w);
      walls.push(w);
      return;
    }
    GATED_SECTIONS.forEach(function (id) {
      var sec = document.getElementById(id);
      if (!sec) return;
      sec.classList.add('mh-gated');
      var w = buildWall(false);
      sec.appendChild(w);
      walls.push(w);
    });
  }

  function removeWalls() {
    walls.forEach(function (w) { if (w.parentNode) w.parentNode.removeChild(w); });
    walls = [];
  }

  function updateNav(user) {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;
    var old = nav.querySelector('.mh-member');
    if (old) old.parentNode.removeChild(old);
    if (!user) return;
    var chip = document.createElement('span');
    chip.className = 'mh-member';
    var name = (user.displayName || user.email || 'عضو مهنة').split(' ')[0];
    chip.innerHTML = '<span>👤 ' + name + '</span>';
    var out = document.createElement('button');
    out.type = 'button';
    out.textContent = 'خروج';
    out.addEventListener('click', function () { auth.signOut(); });
    chip.appendChild(out);
    nav.appendChild(chip);
  }

  function signIn() {
    if (!auth || signingIn) return;
    signingIn = true;
    showError('');
    var btns = document.querySelectorAll('.mh-google-btn');
    btns.forEach(function (b) { b.disabled = true; });
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    auth.signInWithPopup(provider).catch(function (err) {
      if (!err) return;
      var code = err.code || '';
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment' ||
          code === 'auth/web-storage-unsupported' || code === 'auth/popup-closed-by-browser') {
        auth.signInWithRedirect(provider);
        return;
      }
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        showError('');
      } else if (code === 'auth/unauthorized-domain') {
        showError('هذا النطاق غير مصرّح له بعد في إعدادات الدخول.');
      } else if (code === 'auth/network-request-failed') {
        showError('مشكلة في الاتصال بالإنترنت. حاول مرة أخرى.');
      } else {
        showError('حصلت مشكلة في تسجيل الدخول. حاول مرة أخرى.');
      }
      signingIn = false;
      btns.forEach(function (b) { b.disabled = false; });
    });
  }

  function start() {
    injectStyles();
    mountWalls();
    loadScript('https://www.gstatic.com/firebasejs/' + SDK + '/firebase-app-compat.js', function () {
      loadScript('https://www.gstatic.com/firebasejs/' + SDK + '/firebase-auth-compat.js', function () {
        firebase.initializeApp(FIREBASE_CONFIG);
        auth = firebase.auth();
        auth.getRedirectResult().catch(function () {});
        auth.onAuthStateChanged(function (user) {
          signingIn = false;
          if (user) {
            removeWalls();
            updateNav(user);
          } else {
            if (!walls.length) mountWalls();
            updateNav(null);
          }
        });
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
