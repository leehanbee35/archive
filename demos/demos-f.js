/* demos-f.js — live preview demos for 16 glossary terms (이미지 / 배경).
   Contract: (window.DEMOS = window.DEMOS || {})[k] = function (el) {...}
   Plain browser JS, no deps. CSS injected once per demo, scoped by a df-* prefix class. */
(function () {
  var D = (window.DEMOS = window.DEMOS || {});
  var RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function css(id, text) {
    if (document.getElementById(id)) return;
    var s = document.createElement('style');
    s.id = id;
    s.textContent = text;
    document.head.appendChild(s);
  }
  // shared base: wrapper fill, pause off-screen, reduced-motion static frame, fake photo, fake cursor
  css('df-css-base',
    '.df-w{position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;box-sizing:border-box}' +
    '.df-w *{box-sizing:border-box}' +
    '[data-on="0"] .df-w,[data-on="0"] .df-w *,[data-on="0"] .df-w *::before,[data-on="0"] .df-w *::after{animation-play-state:paused!important}' +
    '.df-w.rm,.df-w.rm *,.df-w.rm *::before,.df-w.rm *::after{animation-play-state:paused!important;animation-delay:var(--rmd,0s)!important;transition:none!important}' +
    '.df-w .df-ph{position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden}' +
    '.df-w .df-ph svg{position:absolute;top:0;left:0;width:100%;height:100%;display:block}' +
    '.df-w .df-cur{position:absolute;left:80%;top:80%;width:16px;height:20px;z-index:20;pointer-events:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))}' +
    '.df-w .df-cur svg{display:block}' +
    '.df-w .df-cur i{position:absolute;left:-6px;top:-6px;width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,.95);box-shadow:0 0 0 1px rgba(0,0,0,.25);opacity:0}');

  var CUR = '<div class="df-cur"><svg viewBox="0 0 16 20" width="16" height="20"><path d="M1.5 1.5V16l4-3.6 2.7 6 2.3-1-2.6-5.9H13z" fill="#111" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/></svg><i></i></div>';

  function wrap(el, cls, html, rmd) {
    var w = document.createElement('div');
    w.className = 'df-w ' + cls + (RM ? ' rm' : '');
    if (rmd) w.style.setProperty('--rmd', rmd);
    w.innerHTML = html || '';
    el.appendChild(w);
    return w;
  }
  // rAF loop that only works while el.dataset.on === '1'; time advances only while visible
  function loop(el, fn, rmT) {
    if (RM) { requestAnimationFrame(function () { fn(rmT || 0, 0); }); return; }
    var last = 0, acc = 0, seen = false;
    function f(now) {
      if (el.isConnected) seen = true; else if (seen) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (el.dataset.on === '1') { acc += dt; fn(acc, dt); }
      requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }
  function every(el, ms, fn) {
    if (RM) return;
    var a = 0;
    loop(el, function (t, dt) { a += dt * 1000; if (a >= ms) { a = 0; fn(); } });
  }
  function uid() { return Math.random().toString(36).slice(2, 9); }
  function fitCanvas(cv, w) {
    var W = w.clientWidth || 280, H = w.clientHeight || 180, r = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(W * r) || cv.height !== Math.round(H * r)) {
      cv.width = Math.round(W * r); cv.height = Math.round(H * r);
    }
    var c = cv.getContext('2d');
    c.setTransform(r, 0, 0, r, 0, 0);
    return { c: c, W: W, H: H };
  }
  function canvasWrap(el, cls, extra) {
    var w = wrap(el, cls, '<canvas style="position:absolute;top:0;left:0;width:100%;height:100%;display:block"></canvas>' + (extra || ''));
    return { w: w, cv: w.querySelector('canvas') };
  }

  // fake photos: gradient sky + flat SVG shapes
  var PAL = [
    ['linear-gradient(#ffd8a8,#ff9a8b)', '#c76b7e', '#8e4a6b', '#fff3c4'],
    ['linear-gradient(#a8e0ff,#e2f6ff)', '#6fb38a', '#3f8a68', '#ffffff'],
    ['linear-gradient(#2b2e6e,#c86b98 70%,#f4a68a)', '#4b3b78', '#241d4a', '#ffd6a0'],
    ['linear-gradient(#c3f0d8,#f5f0c8)', '#8bbf6a', '#5a9a4f', '#fffbe0'],
    ['linear-gradient(#f9e0ff,#bfc8ff)', '#8a8fd8', '#5d61b0', '#ffffff'],
    ['linear-gradient(#ffe9b0,#ffc27a)', '#d98c4a', '#a85f2f', '#fff7d6']
  ];
  function ph(i, kind) {
    var p = PAL[i % PAL.length], s;
    if (kind === 'mtn') s = '<circle cx="28" cy="28" r="8" fill="' + p[3] + '"/><path d="M-5 90L30 42L44 60L66 34L105 90Z" fill="' + p[1] + '"/><path d="M60 40l6-6 6 8z" fill="#fff" opacity=".8"/><path d="M0 100V82Q50 72 100 84V100Z" fill="' + p[2] + '"/>';
    else s = '<circle cx="70" cy="32" r="11" fill="' + p[3] + '"/><path d="M0 70Q22 50 46 66T100 60V100H0Z" fill="' + p[1] + '"/><path d="M0 84Q30 68 62 82T100 78V100H0Z" fill="' + p[2] + '"/>';
    return '<div class="df-ph" style="background:' + p[0] + '"><svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">' + s + '</svg></div>';
  }
  function room() {
    return '<div class="df-ph" style="background:linear-gradient(#f1e7da,#e4d4c0)"><svg viewBox="0 0 160 100" preserveAspectRatio="none">' +
      '<rect y="70" width="160" height="30" fill="#c79f7b"/><rect y="70" width="160" height="2" fill="#b48a66"/><ellipse cx="80" cy="86" rx="52" ry="7" fill="#e9dccb"/>' +
      '<rect x="30" y="12" width="26" height="20" fill="#fff" stroke="#8b6b4f" stroke-width="1.5"/><path d="M32 30l7-8 5 5 4-4 6 7z" fill="#9cc3a8"/><circle cx="49" cy="17" r="2.5" fill="#f3c66b"/>' +
      '<rect x="50" y="44" width="60" height="20" rx="5" fill="#5b7a8c"/><rect x="40" y="52" width="12" height="20" rx="4" fill="#4f6d7e"/><rect x="108" y="52" width="12" height="20" rx="4" fill="#4f6d7e"/>' +
      '<rect x="48" y="58" width="64" height="12" rx="3" fill="#6d8ea0"/><rect x="46" y="72" width="3" height="4" fill="#3d3a36"/><rect x="111" y="72" width="3" height="4" fill="#3d3a36"/>' +
      '<line x1="132" y1="26" x2="132" y2="70" stroke="#3d3a36" stroke-width="1.5"/><path d="M123 27h18l-4-11h-10z" fill="#f6d98c"/><ellipse cx="132" cy="70.5" rx="6" ry="1.5" fill="#3d3a36"/>' +
      '<rect x="12" y="58" width="13" height="12" rx="2" fill="#d27d5a"/><ellipse cx="15" cy="50" rx="4" ry="9" fill="#6aa36f" transform="rotate(-20 15 50)"/><ellipse cx="22" cy="49" rx="4" ry="10" fill="#7fb883" transform="rotate(18 22 49)"/>' +
      '</svg></div>';
  }

  /* ---------------- 이미지 ---------------- */

  D['메이슨리'] = function (el) {
    css('df-css-ms',
      '.df-ms{padding:8px;display:flex;gap:6px;background:#fff}' +
      '.df-ms .c{flex:1;display:flex;flex-direction:column;gap:6px;min-width:0}' +
      '.df-ms .t{position:relative;flex:none;border-radius:6px;overflow:hidden;transition:height .9s cubic-bezier(.4,0,.2,1)}');
    var HS = [34, 48, 62, 78, 96], html = '', n = 0;
    for (var c = 0; c < 3; c++) {
      html += '<div class="c">';
      for (var r = 0; r < 4; r++) { html += '<div class="t" style="height:' + HS[(c * 2 + r * 3) % 5] + 'px">' + ph(n, n % 3 ? 'hills' : 'mtn') + '</div>'; n++; }
      html += '</div>';
    }
    var w = wrap(el, 'df-ms', html), ts = w.querySelectorAll('.t');
    every(el, 1300, function () {
      for (var k = 0; k < 2; k++) ts[Math.floor(Math.random() * ts.length)].style.height = HS[Math.floor(Math.random() * 5)] + 'px';
    });
  };

  D['라이트박스'] = function (el) {
    css('df-css-lb',
      '.df-lb{background:#fafafa}' +
      '.df-lb .g{position:absolute;left:12px;right:12px;top:12px;bottom:12px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:1fr 1fr;gap:6px}' +
      '.df-lb .t{position:relative;border-radius:6px;overflow:hidden}' +
      '.df-lb .t:nth-child(5){animation:df-lb-tp 7s infinite}' +
      '.df-lb .ov{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(10,10,14,.8);opacity:0;z-index:5;animation:df-lb-ov 7s infinite}' +
      '.df-lb .big{position:absolute;left:18%;right:18%;top:10%;bottom:10%;border-radius:8px;overflow:hidden;z-index:6;opacity:0;transform:scale(.3);transform-origin:50% 78%;box-shadow:0 10px 30px rgba(0,0,0,.5);animation:df-lb-big 7s cubic-bezier(.3,.7,.3,1) infinite}' +
      '.df-lb .x{position:absolute;right:6px;top:6px;width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.92);color:#222;font:700 13px/18px sans-serif;text-align:center}' +
      '.df-lb .df-cur{animation:df-lb-cu 7s ease-in-out infinite}' +
      '.df-lb .df-cur i{animation:df-lb-ck 7s infinite}' +
      '@keyframes df-lb-tp{0%,25%,31%,100%{transform:none}27%{transform:scale(.93)}}' +
      '@keyframes df-lb-ov{0%,30%{opacity:0}36%,74%{opacity:1}80%,100%{opacity:0}}' +
      '@keyframes df-lb-big{0%,30%{opacity:0;transform:scale(.3)}38%,73%{opacity:1;transform:scale(1)}80%,100%{opacity:0;transform:scale(.3)}}' +
      '@keyframes df-lb-cu{0%{left:85%;top:90%}22%,32%{left:50%;top:72%}48%{left:50%;top:72%}62%,72%{left:76%;top:16%}92%,100%{left:85%;top:90%}}' +
      '@keyframes df-lb-ck{0%,24%{opacity:0;transform:scale(.4)}26%{opacity:1}32%{opacity:0;transform:scale(1.7)}64%{opacity:0;transform:scale(.4)}68%{opacity:1}74%,100%{opacity:0;transform:scale(1.7)}}');
    var g = '';
    for (var i = 0; i < 6; i++) g += '<div class="t">' + ph(i + 1, i % 2 ? 'mtn' : 'hills') + '</div>';
    wrap(el, 'df-lb', '<div class="g">' + g + '</div><div class="ov"></div><div class="big">' + ph(5, 'hills') + '<b class="x">×</b></div>' + CUR, '-3.9s');
  };

  D['비포애프터'] = function (el) {
    css('df-css-ba',
      '.df-ba .l{position:absolute;top:0;left:0;right:0;bottom:0}' +
      '.df-ba .gr{filter:grayscale(1) contrast(.85) brightness(.95)}' +
      '.df-ba .tg{position:absolute;bottom:8px;z-index:2;font-size:9px;font-weight:700;letter-spacing:.04em;padding:2px 6px;border-radius:4px;background:rgba(0,0,0,.45);color:#fff}' +
      '.df-ba .tg.a{left:8px}.df-ba .tg.b{right:8px}' +
      '.df-ba .h{position:absolute;top:0;bottom:0;left:50%;width:2px;margin-left:-1px;background:#fff;z-index:3;box-shadow:0 0 4px rgba(0,0,0,.3)}' +
      '.df-ba .h b{position:absolute;top:50%;left:50%;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:#fff;color:#333;font:700 12px/26px sans-serif;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.3)}' +
      '.df-ba .df-cur{top:calc(50% + 4px);transition:opacity .3s}');
    var w = wrap(el, 'df-ba', '<div class="l gr">' + ph(1, 'mtn') + '</div><div class="l co">' + ph(1, 'mtn') + '</div>' +
      '<span class="tg a">BEFORE</span><span class="tg b">AFTER</span><div class="h"><b>‹ ›</b></div>' + CUR);
    var co = w.querySelector('.co'), h = w.querySelector('.h'), cur = w.querySelector('.df-cur'), x = 50, ux = 50, hold = 0;
    function set(v) {
      co.style.clipPath = co.style.webkitClipPath = 'inset(0 0 0 ' + v + '%)';
      h.style.left = v + '%';
      cur.style.left = 'calc(' + v + '% + 3px)';
    }
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      ux = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100));
      hold = 1.5; cur.style.opacity = '0';
      if (RM) set(ux);
    });
    loop(el, function (t, dt) {
      if (hold > 0) { hold -= dt; if (hold <= 0) cur.style.opacity = '1'; }
      var target = hold > 0 ? ux : 50 + 32 * Math.sin(t * 0.9);
      x = dt ? x + (target - x) * Math.min(1, dt * 8) : target;
      set(x);
    }, 1.9);
  };

  D['켄번스'] = function (el) {
    css('df-css-kb',
      '.df-kb .s{position:absolute;top:0;left:0;right:0;bottom:0;transform-origin:30% 40%;animation:df-kb 10s ease-in-out infinite alternate}' +
      '.df-kb .vg{position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(transparent 55%,rgba(0,0,0,.45))}' +
      '.df-kb .cap{position:absolute;left:12px;bottom:10px;color:#fff;font-size:12px;font-weight:700;letter-spacing:.02em}' +
      '@keyframes df-kb{0%{transform:scale(1.05) translate(0,0)}100%{transform:scale(1.4) translate(-7%,4%)}}');
    wrap(el, 'df-kb', '<div class="s">' + ph(2, 'hills') + '</div><div class="vg"></div><span class="cap">노을 언덕</span>', '-5s');
  };

  D['캐러셀'] = function (el) {
    var E = 'cubic-bezier(.6,0,.3,1)';
    css('df-css-cr',
      '.df-cr .vp{position:absolute;left:14px;right:14px;top:14px;bottom:30px;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.12)}' +
      '.df-cr .tr{position:absolute;top:0;left:0;height:100%;width:500%;display:flex;animation:df-cr-tr 10s ' + E + ' infinite}' +
      '.df-cr .sl{position:relative;width:20%;height:100%}' +
      '.df-cr .n{position:absolute;left:8px;top:8px;font-size:10px;font-weight:700;color:#fff;background:rgba(0,0,0,.35);padding:2px 7px;border-radius:10px}' +
      '.df-cr .ds{position:absolute;bottom:12px;left:50%;margin-left:-24px;width:48px;height:6px}' +
      '.df-cr .ds i{position:absolute;top:0;width:6px;height:6px;border-radius:3px;background:#cfcfcf}' +
      '.df-cr .ds em{position:absolute;top:0;left:0;width:6px;height:6px;border-radius:3px;background:#222;animation:df-cr-dt 10s ' + E + ' infinite}' +
      '@keyframes df-cr-tr{0%,18%{transform:translateX(0)}23%,41%{transform:translateX(-20%)}46%,64%{transform:translateX(-40%)}69%,87%{transform:translateX(-60%)}92%,100%{transform:translateX(-80%)}}' +
      '@keyframes df-cr-dt{0%,18%{transform:translateX(0)}23%,41%{transform:translateX(14px)}46%,64%{transform:translateX(28px)}69%,87%{transform:translateX(42px)}92%,100%{transform:translateX(0)}}');
    var P = [3, 0, 4, 5, 3], s = '', d = '';
    for (var i = 0; i < 5; i++) s += '<div class="sl">' + ph(P[i], i % 2 ? 'mtn' : 'hills') + '<span class="n">' + (i % 4 + 1) + ' / 4</span></div>';
    for (var j = 0; j < 4; j++) d += '<i style="left:' + j * 14 + 'px"></i>';
    wrap(el, 'df-cr', '<div class="vp"><div class="tr">' + s + '</div></div><div class="ds">' + d + '<em></em></div>');
  };

  D['이미지아코디언'] = function (el) {
    css('df-css-ia',
      '.df-ia{padding:12px;display:flex;gap:5px;background:#fff}' +
      '.df-ia .st{position:relative;flex:1;min-width:0;border-radius:8px;overflow:hidden;transition:flex .6s cubic-bezier(.4,0,.2,1)}' +
      '.df-ia .st.on{flex:4}' +
      '.df-ia .lb{position:absolute;left:8px;bottom:8px;color:#fff;font-size:11px;font-weight:700;white-space:nowrap;opacity:0;transition:opacity .4s .2s;text-shadow:0 1px 3px rgba(0,0,0,.4)}' +
      '.df-ia .st.on .lb{opacity:1}' +
      '.df-ia .df-cur{transition:left .7s cubic-bezier(.4,0,.2,1),top .7s}');
    var L = ['봄', '여름', '가을', '겨울'], P = [3, 1, 5, 4], h = '';
    for (var i = 0; i < 4; i++) h += '<div class="st">' + ph(P[i], i % 2 ? 'mtn' : 'hills') + '<span class="lb">' + L[i] + '</span></div>';
    var w = wrap(el, 'df-ia', h + CUR), st = w.querySelectorAll('.st'), cur = w.querySelector('.df-cur'), idx = 0;
    function set(i) {
      idx = i;
      for (var k = 0; k < 4; k++) st[k].className = 'st' + (k === i ? ' on' : '');
      var W = el.clientWidth || 280;
      cur.style.left = (12 + (i + 2) / 7 * (W - 24)) + 'px';
      cur.style.top = (48 + (i % 2) * 10) + '%';
    }
    for (var k = 0; k < 4; k++) st[k].addEventListener('mouseenter', (function (n) { return function () { set(n); }; })(k));
    set(RM ? 1 : 0);
    every(el, 1800, function () { set((idx + 1) % 4); });
  };

  D['핫스팟'] = function (el) {
    css('df-css-hs',
      '.df-hs .p{position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.3);z-index:2}' +
      '.df-hs .p::before{content:"";position:absolute;left:4px;top:4px;width:4px;height:4px;border-radius:50%;background:#ff6a3d}' +
      '.df-hs .p::after{content:"";position:absolute;left:-2px;top:-2px;right:-2px;bottom:-2px;border-radius:50%;border:2px solid #fff;animation:df-hs-pl 1.8s ease-out infinite}' +
      '.df-hs .p:nth-of-type(2)::after{animation-delay:-.6s}.df-hs .p:nth-of-type(3)::after{animation-delay:-1.2s}' +
      '.df-hs .tp{position:absolute;left:50%;top:52%;margin-top:-12px;z-index:4;background:#fff;color:#111;font-size:11px;font-weight:700;padding:5px 9px;border-radius:7px;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.18);opacity:0;animation:df-hs-tp 7s infinite}' +
      '.df-hs .tp::after{content:"";position:absolute;left:50%;bottom:-4px;margin-left:-4px;width:8px;height:8px;background:#fff;transform:rotate(45deg)}' +
      '.df-hs .df-cur{animation:df-hs-cu 7s ease-in-out infinite}' +
      '.df-hs .df-cur i{animation:df-hs-ck 7s infinite}' +
      '@keyframes df-hs-pl{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.6);opacity:0}}' +
      '@keyframes df-hs-tp{0%,28%{opacity:0;transform:translate(-50%,-90%) scale(.9)}34%,80%{opacity:1;transform:translate(-50%,-100%) scale(1)}86%,100%{opacity:0;transform:translate(-50%,-90%) scale(.9)}}' +
      '@keyframes df-hs-cu{0%{left:86%;top:88%}22%,30%{left:51%;top:53%}44%,84%{left:64%;top:80%}100%{left:86%;top:88%}}' +
      '@keyframes df-hs-ck{0%,24%{opacity:0;transform:scale(.4)}26%{opacity:1}33%,100%{opacity:0;transform:scale(1.7)}}');
    wrap(el, 'df-hs', room() +
      '<span class="p" style="left:50%;top:52%"></span><span class="p" style="left:82.5%;top:22%"></span><span class="p" style="left:27%;top:22%"></span>' +
      '<div class="tp">소파 · 89만원</div>' + CUR, '-4s');
  };

  D['하프톤'] = function (el) {
    var o = canvasWrap(el, 'df-ht');
    loop(el, function (t) {
      var f = fitCanvas(o.cv, o.w), c = f.c, W = f.W, H = f.H, s = 7;
      c.fillStyle = '#f6efe2'; c.fillRect(0, 0, W, H);
      var cx = W * 0.5 + Math.sin(t * 0.5) * W * 0.12, cy = H * 0.46, R = H * 0.34;
      var lx = Math.cos(t * 0.7) * 0.8, ly = -0.55, lz = 0.7, ln = Math.sqrt(lx * lx + ly * ly + lz * lz);
      lx /= ln; ly /= ln; lz /= ln;
      c.fillStyle = '#1d1b2e'; c.beginPath();
      for (var row = 0, y = s / 2; y < H + s; y += s, row++) {
        for (var x = (row % 2) * s / 2; x < W + s; x += s) {
          var dx = (x - cx) / R, dy = (y - cy) / R, q = dx * dx + dy * dy, dark;
          if (q < 1) {
            var nz = Math.sqrt(1 - q), d = Math.max(0, dx * lx + dy * ly + nz * lz);
            dark = 1 - d * 0.95;
          } else {
            var ex = (x - cx - lx * R * 0.5) / (R * 0.95), ey = (y - cy - R * 1.08) / (R * 0.2), e = ex * ex + ey * ey;
            dark = 0.05 + 0.18 * (y / H) + (e < 1 ? 0.5 * (1 - e) : 0);
          }
          var r = s * 0.6 * Math.sqrt(dark);
          if (r > 0.35) { c.moveTo(x + r, y); c.arc(x, y, r, 0, 6.2832); }
        }
      }
      c.fill();
    }, 1.2);
  };

  /* ---------------- 배경 ---------------- */

  D['메시그라데이션'] = function (el) {
    css('df-css-mg',
      '.df-mg{background:#f3e6ff}' +
      '.df-mg .bx{position:absolute;top:-20%;left:-20%;right:-20%;bottom:-20%;filter:blur(26px)}' +
      '.df-mg .b{position:absolute;width:60%;height:70%;border-radius:50%}' +
      '.df-mg .b1{left:0;top:0;background:#ff8fb1;animation:df-mg-a 9s ease-in-out infinite alternate}' +
      '.df-mg .b2{right:0;top:8%;background:#7ad7ff;animation:df-mg-b 11s ease-in-out infinite alternate}' +
      '.df-mg .b3{left:18%;bottom:0;background:#ffd36e;animation:df-mg-c 10s ease-in-out infinite alternate}' +
      '.df-mg .b4{right:10%;bottom:6%;width:45%;height:55%;background:#a58bff;animation:df-mg-a 13s ease-in-out infinite alternate-reverse}' +
      '@keyframes df-mg-a{0%{transform:translate(0,0) scale(1)}100%{transform:translate(30%,20%) scale(1.2)}}' +
      '@keyframes df-mg-b{0%{transform:translate(0,0) scale(1)}100%{transform:translate(-35%,25%) scale(.9)}}' +
      '@keyframes df-mg-c{0%{transform:translate(0,0) scale(1)}100%{transform:translate(25%,-30%) scale(1.15)}}');
    wrap(el, 'df-mg', '<div class="bx"><i class="b b1"></i><i class="b b2"></i><i class="b b3"></i><i class="b b4"></i></div>', '-4s');
  };

  D['오로라'] = function (el) {
    var o = canvasWrap(el, 'df-au');
    o.cv.style.filter = 'blur(4px)';
    var B = [{ h: 150, y: 0.5, p: 0 }, { h: 172, y: 0.58, p: 1.7 }, { h: 275, y: 0.42, p: 3.1 }];
    loop(el, function (t) {
      var f = fitCanvas(o.cv, o.w), c = f.c, W = f.W, H = f.H;
      var bg = c.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#02040d'); bg.addColorStop(1, '#0b1730');
      c.globalCompositeOperation = 'source-over'; c.fillStyle = bg; c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'lighter';
      for (var b = 0; b < B.length; b++) {
        var k = B[b];
        for (var x = 0; x < W; x += 3) {
          var base = H * k.y + Math.sin(x * 0.018 + t * 0.6 + k.p) * 16 + Math.sin(x * 0.047 - t * 0.9 + k.p * 2) * 6;
          var len = 40 + 30 * (0.5 + 0.5 * Math.sin(x * 0.025 + t * 0.7 + k.p * 3));
          var g = c.createLinearGradient(0, base - len, 0, base + 6);
          g.addColorStop(0, 'hsla(' + k.h + ',90%,60%,0)');
          g.addColorStop(0.8, 'hsla(' + k.h + ',90%,62%,.28)');
          g.addColorStop(1, 'hsla(' + k.h + ',90%,72%,0)');
          c.fillStyle = g; c.fillRect(x, base - len, 3, len + 6);
        }
      }
      c.globalCompositeOperation = 'source-over';
    }, 2);
  };

  D['그레인'] = function (el) {
    css('df-css-gr',
      '.df-gr{background:linear-gradient(135deg,#ff9e7a,#ffd59e 50%,#9fb8ff)}' +
      '.df-gr canvas{mix-blend-mode:overlay;opacity:.55}' +
      '.df-gr .tx{position:absolute;left:0;right:0;top:50%;margin-top:-14px;text-align:center;font-size:22px;font-weight:800;color:rgba(40,20,30,.75);letter-spacing:-.02em}');
    var o = canvasWrap(el, 'df-gr', '<div class="tx">필름 질감</div>'), cw = 220, ch = 140;
    o.cv.width = cw; o.cv.height = ch;
    var c = o.cv.getContext('2d'), frames = [];
    for (var n = 0; n < 5; n++) {
      var im = c.createImageData(cw, ch), d = im.data;
      for (var i = 0; i < d.length; i += 4) { var v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      frames.push(im);
    }
    var a = 0, k = 0;
    c.putImageData(frames[0], 0, 0);
    loop(el, function (t, dt) {
      a += dt;
      if (a > 0.07) { a = 0; k = (k + 1) % frames.length; c.putImageData(frames[k], 0, 0); }
    });
  };

  D['도트그리드'] = function (el) {
    var o = canvasWrap(el, 'df-dg');
    loop(el, function (t) {
      var f = fitCanvas(o.cv, o.w), c = f.c, W = f.W, H = f.H, s = 14;
      c.fillStyle = '#fbfbfd'; c.fillRect(0, 0, W, H);
      var span = W + H * 0.5 + 200, pos = (t * 70) % span - 100;
      for (var y = s / 2; y < H; y += s) {
        for (var x = s / 2; x < W; x += s) {
          var dd = x + y * 0.5 - pos, b = Math.exp(-dd * dd / 1400);
          c.fillStyle = 'rgba(' + (95 - 15 * b | 0) + ',' + (100 - 10 * b | 0) + ',' + (130 + 110 * b | 0) + ',' + (0.25 + 0.65 * b) + ')';
          c.beginPath(); c.arc(x, y, 1.1 + 1.5 * b, 0, 6.2832); c.fill();
        }
      }
    }, 2.5);
  };

  D['빔'] = function (el) {
    css('df-css-bm',
      '.df-bm{background-color:#07090f;background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:24px 24px}' +
      '.df-bm::after{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse at 50% 50%,transparent 35%,#07090f 95%)}' +
      '.df-bm .h{position:absolute;left:-80px;height:1px;width:70px;background:linear-gradient(90deg,transparent,#5ee7ff,#fff);box-shadow:0 0 6px #5ee7ff;animation:df-bm-h 3.2s linear infinite}' +
      '.df-bm .v{position:absolute;top:-80px;width:1px;height:70px;background:linear-gradient(transparent,#c58bff,#fff);box-shadow:0 0 6px #c58bff;animation:df-bm-v 3.8s linear infinite}' +
      '@keyframes df-bm-h{from{transform:translateX(0)}to{transform:translateX(430px)}}' +
      '@keyframes df-bm-v{from{transform:translateY(0)}to{transform:translateY(280px)}}');
    wrap(el, 'df-bm',
      '<i class="h" style="top:48px"></i><i class="h" style="top:120px;animation-duration:4.2s;animation-delay:-1.6s"></i>' +
      '<i class="v" style="left:72px;animation-delay:-.8s"></i><i class="v" style="left:192px;animation-duration:3s;animation-delay:-2.2s"></i>' +
      '<i class="v" style="left:264px;animation-duration:4.6s;animation-delay:-3.4s"></i>', '-1.7s');
  };

  D['블롭'] = function (el) {
    var id = 'df-bl-g-' + uid();
    css('df-css-bl', '.df-bl{background:#f1efff}.df-bl svg{position:absolute;top:0;left:0;width:100%;height:100%;display:block}');
    var w = wrap(el, 'df-bl', '<svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#ff7eb6"/><stop offset="1" stop-color="#6c5cff"/></linearGradient></defs><path fill="url(#' + id + ')"/></svg>');
    var path = w.querySelector('path'), N = 7, K = [], PH = [];
    for (var i = 0; i < N; i++) { K.push(0.8 + Math.random() * 0.9); PH.push(Math.random() * 6.28); }
    loop(el, function (t) {
      var cx = 100 + 8 * Math.sin(t * 0.5), cy = 70 + 5 * Math.cos(t * 0.4), rot = t * 0.15, P = [];
      for (var i = 0; i < N; i++) {
        var a = i / N * 6.2832 + rot, r = 44 * (1 + 0.16 * Math.sin(t * 1.1 * K[i] + PH[i]) + 0.07 * Math.sin(t * 0.7 + i * 2));
        P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.9]);
      }
      var d = 'M' + P[0][0].toFixed(1) + ' ' + P[0][1].toFixed(1);
      for (var j = 0; j < N; j++) {
        var p0 = P[(j - 1 + N) % N], p1 = P[j], p2 = P[(j + 1) % N], p3 = P[(j + 2) % N];
        d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
          (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
      }
      path.setAttribute('d', d + 'Z');
    }, 1);
  };

  D['글로우오브'] = function (el) {
    css('df-css-go',
      '.df-go{background:#0a0820}' +
      '.df-go .o{position:absolute;border-radius:50%;mix-blend-mode:screen}' +
      '.df-go .o1{width:180px;height:180px;left:-20px;top:-40px;background:radial-gradient(circle,rgba(255,80,180,.9),rgba(255,80,180,0) 65%);animation:df-go-a 12s ease-in-out infinite alternate}' +
      '.df-go .o2{width:210px;height:210px;right:-50px;bottom:-70px;background:radial-gradient(circle,rgba(80,140,255,.85),rgba(80,140,255,0) 65%);animation:df-go-b 14s ease-in-out infinite alternate}' +
      '.df-go .o3{width:140px;height:140px;left:35%;top:25%;background:radial-gradient(circle,rgba(120,255,220,.6),rgba(120,255,220,0) 65%);animation:df-go-c 10s ease-in-out infinite alternate}' +
      '@keyframes df-go-a{0%{transform:translate(0,0)}100%{transform:translate(90px,60px)}}' +
      '@keyframes df-go-b{0%{transform:translate(0,0)}100%{transform:translate(-100px,-50px)}}' +
      '@keyframes df-go-c{0%{transform:translate(-40px,20px) scale(1)}100%{transform:translate(40px,-25px) scale(1.3)}}');
    wrap(el, 'df-go', '<i class="o o1"></i><i class="o o2"></i><i class="o o3"></i>', '-5s');
  };

  D['스타필드'] = function (el) {
    var o = canvasWrap(el, 'df-sf'), S = [], V = 0.35;
    function reset(s, z) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = z; }
    for (var i = 0; i < 180; i++) { var s = {}; reset(s, 0.05 + Math.random() * 0.95); S.push(s); }
    loop(el, function (t, dt) {
      var f = fitCanvas(o.cv, o.w), c = f.c, W = f.W, H = f.H, cx = W / 2, cy = H / 2, F = W * 0.3;
      c.fillStyle = '#02030a'; c.fillRect(0, 0, W, H);
      c.lineCap = 'round';
      for (var i = 0; i < S.length; i++) {
        var s = S[i], pz = s.z + 0.012 + dt * V * 2;
        s.z -= dt * V;
        var x = cx + s.x * F / s.z, y = cy + s.y * F / s.z;
        if (s.z <= 0.02 || x < -10 || x > W + 10 || y < -10 || y > H + 10) { reset(s, 1); continue; }
        var px = cx + s.x * F / pz, py = cy + s.y * F / pz, k = 1 - s.z;
        c.strokeStyle = 'rgba(220,230,255,' + (0.15 + 0.85 * k).toFixed(2) + ')';
        c.lineWidth = 0.4 + 2 * k;
        c.beginPath(); c.moveTo(px, py); c.lineTo(x, y); c.stroke();
      }
    });
  };
})();
