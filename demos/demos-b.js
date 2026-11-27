/* demos-b.js — live preview demos for 17 glossary terms (스타일 / 만드는 법).
   Contract: (window.DEMOS = window.DEMOS || {})[k] = function (el) {...}
   Plain browser JS, no deps. CSS injected once per demo, scoped by a db-* prefix class. */
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
  // shared: wrapper fill, pause CSS animations off-screen, static frame for reduced motion
  css('dbB-base',
    '.dbB{position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;box-sizing:border-box}' +
    '[data-on="0"] .dbB,[data-on="0"] .dbB *,[data-on="0"] .dbB *::before,[data-on="0"] .dbB *::after{animation-play-state:paused!important}' +
    '.dbB.rm,.dbB.rm *,.dbB.rm *::before,.dbB.rm *::after{animation-play-state:paused!important;animation-delay:var(--rmd,0s)!important}');

  function wrap(el, cls, html, rmd) {
    var w = document.createElement('div');
    w.className = 'dbB ' + cls + (RM ? ' rm' : '');
    if (rmd) w.style.setProperty('--rmd', rmd);
    w.innerHTML = html || '';
    el.appendChild(w);
    return w;
  }
  // rAF loop that only works while el.dataset.on === '1'; time only advances while visible
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

  /* ---------------- 스타일 ---------------- */

  D['다크모드'] = function (el) {
    var L = '{background:#eef0f3}', K = '{background:#0f1115}';
    css('db-dm-css',
      '.db-dm{display:flex;align-items:center;justify-content:center;animation:db-dm-bg 5s infinite}' +
      '@keyframes db-dm-bg{0%,40%,100%' + L + '50%,90%' + K + '}' +
      '.db-dm .c{width:150px;padding:14px;border-radius:14px;box-sizing:border-box;animation:db-dm-c 5s infinite}' +
      '@keyframes db-dm-c{0%,40%,100%{background:#fff;color:#16181d;box-shadow:0 6px 18px rgba(0,0,0,.08)}50%,90%{background:#1d2027;color:#eef0f5;box-shadow:0 6px 18px rgba(0,0,0,.55)}}' +
      '.db-dm .top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;font-size:12px;font-weight:700}' +
      '.db-dm .ic{width:18px;height:18px;border-radius:50%;animation:db-dm-ic 5s infinite}' +
      '@keyframes db-dm-ic{0%,44%,100%{background:#f6b40e;box-shadow:0 0 0 4px rgba(246,180,14,.22)}46%,94%{background:transparent;box-shadow:inset -6px -3px 0 0 #dfe3ff}}' +
      '.db-dm .lb{display:grid}.db-dm .lb span{grid-area:1/1}' +
      '.db-dm .l1{animation:db-dm-o 5s infinite}.db-dm .l2{animation:db-dm-o2 5s infinite}' +
      '@keyframes db-dm-o{0%,40%,100%{opacity:1}50%,90%{opacity:0}}' +
      '@keyframes db-dm-o2{0%,40%,100%{opacity:0}50%,90%{opacity:1}}' +
      '.db-dm .ln{height:6px;border-radius:3px;margin-top:7px;animation:db-dm-ln 5s infinite}' +
      '@keyframes db-dm-ln{0%,40%,100%{background:#e4e6ea}50%,90%{background:#353944}}' +
      '.db-dm .tg{margin-top:12px;width:34px;height:18px;border-radius:9px;position:relative;animation:db-dm-tg 5s infinite}' +
      '@keyframes db-dm-tg{0%,40%,100%{background:#d7dae0}50%,90%{background:#5b7cfa}}' +
      '.db-dm .tg:after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#fff;animation:db-dm-k 5s infinite}' +
      '@keyframes db-dm-k{0%,40%,100%{transform:translateX(0)}50%,90%{transform:translateX(16px)}}');
    wrap(el, 'db-dm',
      '<div class="c"><div class="top"><span class="lb"><span class="l1">라이트</span><span class="l2">다크</span></span><i class="ic"></i></div>' +
      '<div class="ln"></div><div class="ln" style="width:70%"></div><div class="tg"></div></div>', '-3.5s');
  };

  D['뉴모피즘'] = function (el) {
    var C = '#c2c8d2';
    css('db-nm-css',
      '.db-nm{background:#e4e8ee;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px}' +
      '.db-nm .b{width:74px;height:74px;border-radius:22px;background:#e4e8ee;display:flex;align-items:center;justify-content:center;animation:db-nm-p 2.6s ease-in-out infinite}' +
      '@keyframes db-nm-p{0%,35%,100%{box-shadow:8px 8px 16px ' + C + ',-8px -8px 16px #fff,inset 0 0 0 ' + C + ',inset 0 0 0 #fff}' +
      '50%,85%{box-shadow:0 0 0 ' + C + ',0 0 0 #fff,inset 6px 6px 12px ' + C + ',inset -6px -6px 12px #fff}}' +
      '.db-nm .i{width:16px;height:16px;border-radius:50%;border:3px solid #9aa3b2;animation:db-nm-i 2.6s ease-in-out infinite}' +
      '@keyframes db-nm-i{0%,35%,100%{border-color:#9aa3b2}50%,85%{border-color:#5b7cfa}}' +
      '.db-nm .t{font-size:11px;color:#8a93a3;font-weight:600}');
    wrap(el, 'db-nm', '<div class="b"><i class="i"></i></div><div class="t">볼록 ↔ 오목</div>');
  };

  D['글래스모피즘'] = function (el) {
    css('db-gl-css',
      '.db-gl{background:#f1f2f6}' +
      '.db-gl .o{position:absolute;border-radius:50%}' +
      '.db-gl .o1{width:90px;height:90px;background:#ff6fa5;left:10%;top:14%;animation:db-gl-a 6s ease-in-out infinite alternate}' +
      '.db-gl .o2{width:80px;height:80px;background:#5d8bff;right:10%;top:42%;animation:db-gl-b 7s ease-in-out infinite alternate}' +
      '.db-gl .o3{width:56px;height:56px;background:#ffc84a;left:46%;top:6%;animation:db-gl-a 5s ease-in-out infinite alternate-reverse}' +
      '@keyframes db-gl-a{to{transform:translate(70px,44px)}}@keyframes db-gl-b{to{transform:translate(-84px,-30px)}}' +
      '.db-gl .g{position:absolute;left:50%;top:50%;width:150px;height:96px;margin:-48px 0 0 -75px;padding:16px;box-sizing:border-box;border-radius:16px;' +
      'background:rgba(255,255,255,.22);-webkit-backdrop-filter:blur(14px) saturate(160%);backdrop-filter:blur(14px) saturate(160%);' +
      'border:1px solid rgba(255,255,255,.65);box-shadow:0 8px 24px rgba(0,0,0,.12)}' +
      '.db-gl .g i{display:block;height:7px;border-radius:4px;background:rgba(255,255,255,.8);margin-bottom:9px}');
    wrap(el, 'db-gl',
      '<div class="o o1"></div><div class="o o2"></div><div class="o o3"></div>' +
      '<div class="g"><i style="width:45%"></i><i></i><i style="width:70%"></i></div>', '-2.5s');
  };

  D['리퀴드글래스'] = function (el) {
    css('db-lq-css',
      '.db-lq .bg{position:absolute;top:0;bottom:0;left:0;right:-60px;' +
      'background:linear-gradient(transparent 47%,#222 47%,#222 53%,transparent 53%),repeating-linear-gradient(90deg,#ff5f6d 0 12px,#fff 12px 24px,#3aa0ff 24px 36px,#fff 36px 48px);' +
      'animation:db-lq-bg 8s linear infinite}@keyframes db-lq-bg{to{transform:translateX(-48px)}}' +
      '.db-lq .p{position:absolute;left:50%;top:50%;width:120px;height:62px;margin:-31px 0 0 -60px;border-radius:999px;background:rgba(255,255,255,.08);' +
      '-webkit-backdrop-filter:blur(2px) saturate(1.8) brightness(1.08);backdrop-filter:blur(2px) saturate(1.8) brightness(1.08);' +
      'box-shadow:inset 0 2px 1px rgba(255,255,255,.95),inset 0 -2px 3px rgba(255,255,255,.55),inset 8px 0 12px rgba(255,255,255,.35),inset -8px 0 12px rgba(255,255,255,.35),0 10px 24px rgba(0,0,0,.2);' +
      'animation:db-lq-w 4.5s ease-in-out infinite}' +
      '.db-lq .p:after{content:"";position:absolute;top:6px;left:18px;width:42%;height:10px;border-radius:10px;background:linear-gradient(rgba(255,255,255,.85),rgba(255,255,255,0))}' +
      '@keyframes db-lq-w{0%,100%{transform:translateX(-55px) scale(1,1)}20%{transform:translateX(-18px) scale(1.2,.84)}35%{transform:translateX(12px) scale(.92,1.1)}' +
      '50%{transform:translateX(55px) scale(1,1)}70%{transform:translateX(18px) scale(1.2,.84)}85%{transform:translateX(-12px) scale(.92,1.1)}}');
    var id = 'dblq' + uid();
    var w = wrap(el, 'db-lq',
      '<svg width="0" height="0" style="position:absolute"><filter id="' + id + '" x="0" y="0" width="100%" height="100%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="1" seed="4" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="28" xChannelSelector="R" yChannelSelector="G"/></filter></svg>' +
      '<div class="bg"></div><div class="p"></div>', '-1s');
    // refraction via SVG displacement in backdrop-filter (Chromium); other browsers keep the blur fallback
    var p = w.querySelector('.p'), v = 'url(#' + id + ') blur(0.5px) saturate(1.8) brightness(1.08)';
    if (/Chrome\//.test(navigator.userAgent) && window.CSS && CSS.supports && CSS.supports('backdrop-filter', v)) p.style.backdropFilter = v;
  };

  D['스큐어모피즘'] = function (el) {
    var up = 'transform:translateY(-6px);box-shadow:0 7px 0 #9c9c9c,0 9px 10px rgba(0,0,0,.45),inset 0 1px 0 #fff,inset 0 -3px 4px rgba(0,0,0,.08)';
    var dn = 'transform:translateY(0);box-shadow:0 1px 0 #9c9c9c,0 2px 3px rgba(0,0,0,.4),inset 0 1px 0 #fff,inset 0 -3px 4px rgba(0,0,0,.08)';
    css('db-sk-css',
      '.db-sk{background:linear-gradient(180deg,#dcdfe2,#b6babf);display:flex;align-items:center;justify-content:center}' +
      '.db-sk:before{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.14) 0 1px,rgba(0,0,0,.04) 1px 2px,transparent 2px 4px)}' +
      '.db-sk .w{position:relative;width:96px;height:96px;border-radius:18px;background:linear-gradient(#3a3d42,#1f2125);box-shadow:inset 0 2px 4px rgba(0,0,0,.7),0 1px 0 rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center}' +
      '.db-sk .k{position:relative;width:76px;height:72px;border-radius:13px;background:linear-gradient(180deg,#fff,#d9d9d9);display:flex;align-items:center;justify-content:center;' +
      'font-weight:700;color:#555;font-size:20px;text-shadow:0 1px 0 #fff;' + up + ';animation:db-sk-p 2.4s infinite}' +
      '.db-sk .k:before{content:"";position:absolute;top:7px;left:7px;right:7px;bottom:9px;border-radius:9px;background:radial-gradient(ellipse at 50% 25%,#fff,#ececec 70%,#e0e0e0);box-shadow:inset 0 1px 2px rgba(0,0,0,.12)}' +
      '.db-sk .k span{position:relative}' +
      '.db-sk .led{position:absolute;top:11px;right:11px;width:6px;height:6px;border-radius:50%;background:#2c3a2c;animation:db-sk-l 2.4s infinite}' +
      '@keyframes db-sk-p{0%,40%,100%{' + up + '}50%,75%{' + dn + '}}' +
      '@keyframes db-sk-l{0%,40%,100%{background:#2c3a2c;box-shadow:none}50%,75%{background:#5dff7a;box-shadow:0 0 6px #5dff7a}}');
    wrap(el, 'db-sk', '<div class="w"><div class="k"><span>ㄱ</span><i class="led"></i></div></div>', '-1.4s');
  };

  D['픽셀아트'] = function (el) {
    css('db-px-css',
      '.db-px{display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f4f4f4;' +
      'background-image:linear-gradient(rgba(0,0,0,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.05) 1px,transparent 1px);background-size:10px 10px}' +
      '.db-px .h{display:grid;grid-template-columns:repeat(9,10px);grid-auto-rows:10px;animation:db-px-b .9s steps(1) infinite}' +
      '.db-px .sh{width:50px;height:6px;margin-top:12px;background:rgba(0,0,0,.15);animation:db-px-s .9s steps(1) infinite}' +
      '@keyframes db-px-b{0%{transform:translateY(0)}50%{transform:translateY(-10px)}}' +
      '@keyframes db-px-s{0%{width:50px}50%{width:30px}}');
    var rows = ['.KK...KK.', 'KWRK.KRRK', 'KWRRKRRRK', 'KRRRRRRRK', '.KRRRRRK.', '..KRRRK..', '...KRK...', '....K....'];
    var col = { K: '#222', R: '#ff3b5c', W: '#fff', '.': 'transparent' }, h = '';
    rows.join('').split('').forEach(function (c) { h += '<i style="background:' + col[c] + '"></i>'; });
    wrap(el, 'db-px', '<div class="h">' + h + '</div><div class="sh"></div>');
  };

  D['도트매트릭스'] = function (el) {
    css('db-dot-css', '.db-dot{background:#0b0b0d}.db-dot canvas{position:absolute;left:0;top:0;width:100%;height:100%}');
    var w = wrap(el, 'db-dot', '<canvas></canvas>'), cv = w.firstChild;
    var ROWS = 13, MSG = '안녕하세요 ♥   ', F = '700 12px Pretendard, sans-serif';
    var src = document.createElement('canvas'), sx = src.getContext('2d');
    sx.font = F;
    var tw = Math.ceil(sx.measureText(MSG).width) + 2;
    src.width = tw; src.height = ROWS;
    sx.font = F; sx.textBaseline = 'middle'; sx.fillStyle = '#fff';
    sx.fillText(MSG, 0, ROWS / 2 + 1);
    var data = sx.getImageData(0, 0, tw, ROWS).data;
    function lit(x, y) { x = ((x % tw) + tw) % tw; return data[(y * tw + x) * 4 + 3] > 120; }
    var step = -1;
    loop(el, function (t) {
      var s = Math.floor(t * 12);
      if (s === step) return;
      step = s;
      var g = fitCanvas(cv, w), c = g.c, p = Math.max(5, Math.floor(g.H * 0.62 / ROWS));
      var cols = Math.floor((g.W - 16) / p), ox = (g.W - cols * p) / 2, oy = (g.H - ROWS * p) / 2;
      c.clearRect(0, 0, g.W, g.H);
      var on = new Path2D(), off = new Path2D(), r = p * 0.38;
      for (var y = 0; y < ROWS; y++) for (var x = 0; x < cols; x++) {
        var P = lit(x + s - cols, y) ? on : off, cx = ox + x * p + p / 2, cy = oy + y * p + p / 2;
        P.moveTo(cx + r, cy); P.arc(cx, cy, r, 0, 6.2832);
      }
      c.fillStyle = '#2a2116'; c.fill(off);
      c.fillStyle = '#ffb22e'; c.fill(on);
    }, 3);
  };

  D['글로우'] = function (el) {
    css('db-glow-css',
      '.db-glow{background:radial-gradient(circle at 50% 50%,#141826,#05060a 70%);display:flex;align-items:center;justify-content:center}' +
      '.db-glow .r{width:86px;height:86px;border-radius:50%;border:3px solid #7ff3ff;box-sizing:border-box;display:flex;align-items:center;justify-content:center;' +
      'color:#e9fdff;font-weight:700;font-size:15px;animation:db-glow-p 2.2s ease-in-out infinite}' +
      '@keyframes db-glow-p{0%,100%{box-shadow:0 0 4px #7ff3ff,0 0 10px #00d9ff,inset 0 0 6px #00d9ff;text-shadow:0 0 4px #00d9ff}' +
      '50%{box-shadow:0 0 8px #bff9ff,0 0 26px #00d9ff,0 0 52px #00a2ff,inset 0 0 16px #00d9ff;text-shadow:0 0 6px #fff,0 0 16px #00d9ff,0 0 30px #00a2ff}}' +
      '.db-glow .bar{position:absolute;left:50%;bottom:22px;width:60px;height:3px;margin-left:-30px;border-radius:2px;background:#ffd1ec;' +
      'box-shadow:0 0 6px #ff4fb8,0 0 16px #ff4fb8;animation:db-glow-f 3s steps(1) infinite}' +
      '@keyframes db-glow-f{0%{opacity:1}70%{opacity:.25}72%{opacity:1}74%{opacity:.4}76%{opacity:1}}');
    wrap(el, 'db-glow', '<div class="r">네온</div><div class="bar"></div>', '-1.1s');
  };

  D['무지갯빛'] = function (el) {
    css('db-iri-css',
      '.db-iri{background:linear-gradient(160deg,#e9eef5,#cbd5e2)}' +
      '.db-iri .b{position:absolute;left:50%;top:50%;width:112px;height:112px;margin:-56px 0 0 -70px;border-radius:50%;overflow:hidden;' +
      'box-shadow:inset 0 0 0 1px rgba(255,255,255,.75),inset -8px -12px 24px rgba(255,255,255,.35),0 10px 24px rgba(40,60,90,.15);animation:db-iri-f 4s ease-in-out infinite}' +
      '.db-iri .b2{width:42px;height:42px;margin:-10px 0 0 52px;animation-duration:3s;animation-direction:reverse}' +
      '.db-iri .b:before{content:"";position:absolute;top:-20%;left:-20%;right:-20%;bottom:-20%;opacity:.8;' +
      'background:conic-gradient(#ff8ad8,#ffd36e,#9dffb0,#7fd0ff,#b68cff,#ff8ad8);' +
      '-webkit-mask:radial-gradient(closest-side,transparent 52%,#000 74%);mask:radial-gradient(closest-side,transparent 52%,#000 74%);animation:db-iri-r 5s linear infinite}' +
      '.db-iri .b:after{content:"";position:absolute;left:20%;top:13%;width:32%;height:18%;border-radius:50%;background:radial-gradient(rgba(255,255,255,.95),rgba(255,255,255,0) 70%);transform:rotate(-30deg)}' +
      '@keyframes db-iri-r{from{transform:rotate(0);filter:blur(3px) hue-rotate(0deg)}to{transform:rotate(360deg);filter:blur(3px) hue-rotate(360deg)}}' +
      '@keyframes db-iri-f{0%,100%{transform:translateY(4px)}50%{transform:translateY(-6px)}}');
    wrap(el, 'db-iri', '<div class="b"></div><div class="b b2"></div>', '-1.6s');
  };

  D['코닉그라데이션'] = function (el) {
    css('db-con-css',
      '.db-con{display:flex;align-items:center;justify-content:center;gap:28px;background:#f4f4f4}' +
      '.db-con .r{width:96px;height:96px;border-radius:50%;background:conic-gradient(#ff4d6d,#ffbe0b,#3ad29f,#3a86ff,#8338ec,#ff4d6d);' +
      '-webkit-mask:radial-gradient(closest-side,transparent 66%,#000 69%);mask:radial-gradient(closest-side,transparent 66%,#000 69%);animation:db-con-s 3s linear infinite}' +
      '@keyframes db-con-s{to{transform:rotate(360deg)}}' +
      '.db-con .p{position:relative;width:76px;height:76px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#222}' +
      '.db-con .p:before{content:"";position:absolute;top:9px;left:9px;right:9px;bottom:9px;border-radius:50%;background:#f4f4f4}' +
      '.db-con .p span{position:relative}');
    var w = wrap(el, 'db-con', '<div class="r"></div><div class="p"><span></span></div>');
    var p = w.querySelector('.p'), lab = p.firstChild, prev = -1;
    loop(el, function (t) {
      var v = Math.min(100, Math.round((t % 5) * 28));
      if (v === prev) return;
      prev = v;
      p.style.background = 'conic-gradient(#3a86ff ' + v + '%,#dcdcdc 0)';
      lab.textContent = v + '%';
    }, 2.6);
  };

  D['종이질감'] = function (el) {
    var noise = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .24 0 0 0 0 .1 .4 0 0 0 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
    css('db-pap-css',
      '.db-pap{background:#e7e2d8;display:flex;align-items:center;justify-content:center}' +
      '.db-pap .c{position:relative;width:160px;height:118px;padding:16px;box-sizing:border-box;transform:rotate(-2deg);color:#5a3e1b;font-size:13px;font-weight:700;' +
      'background:' + noise + ',radial-gradient(circle at 18% 82%,rgba(140,95,40,.2),transparent 40%),radial-gradient(circle at 86% 14%,rgba(140,95,40,.15),transparent 35%),radial-gradient(ellipse at center,#f7ecd2 40%,#e3cb98 100%);' +
      'box-shadow:0 1px 2px rgba(60,40,10,.2),0 8px 18px rgba(60,40,10,.18)}' +
      '.db-pap .c i{display:block;height:1px;background:rgba(90,62,27,.35);margin-top:14px}' +
      '.db-pap .f{position:absolute;right:0;bottom:0;width:6px;height:6px;background:linear-gradient(to top left,#e7e2d8 50%,#c9ad74 50%,#efdcb0 100%);animation:db-pap-f 3.5s ease-in-out infinite}' +
      '@keyframes db-pap-f{0%,100%{width:6px;height:6px}50%{width:28px;height:28px}}');
    wrap(el, 'db-pap', '<div class="c">옛날 편지<i></i><i style="width:80%"></i><i style="width:55%"></i><div class="f"></div></div>', '-1.75s');
  };

  /* ---------------- 만드는 법 ---------------- */

  D['SVG'] = function (el) {
    css('db-svg-css',
      '.db-svg{display:flex;align-items:center;justify-content:center;background:#f4f4f4}' +
      '.db-svg svg{width:60px;height:60px;overflow:visible;animation:db-svg-z 6s ease-in-out infinite}' +
      '.db-svg path{fill:none;stroke:#111;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:100;stroke-dashoffset:100;animation:db-svg-d 6s ease-in-out infinite}' +
      '.db-svg circle{fill:#fff;stroke:#3a86ff;stroke-width:1.2;opacity:0;animation:db-svg-c 6s infinite}' +
      '.db-svg .t{position:absolute;left:0;right:0;bottom:12px;text-align:center;font-size:11px;color:#888;font-weight:600;opacity:0;animation:db-svg-c 6s infinite}' +
      '@keyframes db-svg-d{0%{stroke-dashoffset:100;opacity:1}30%,92%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}' +
      '@keyframes db-svg-z{0%,40%{width:60px;height:60px}60%,85%{width:150px;height:150px}100%{width:60px;height:60px}}' +
      '@keyframes db-svg-c{0%,38%{opacity:0}48%,88%{opacity:1}96%,100%{opacity:0}}');
    wrap(el, 'db-svg',
      '<svg viewBox="0 0 64 64"><path pathLength="100" d="M10 30 L32 12 L54 30 M16 25 V52 H48 V25 M27 52 V38 H37 V52"/>' +
      '<circle cx="10" cy="30" r="2"/><circle cx="32" cy="12" r="2"/><circle cx="54" cy="30" r="2"/><circle cx="16" cy="52" r="2"/><circle cx="48" cy="52" r="2"/></svg>' +
      '<div class="t">확대해도 선명</div>', '-4.2s');
  };

  D['캔버스'] = function (el) {
    css('db-cv-css', '.db-cv{background:#f4f4f4}.db-cv canvas{position:absolute;left:0;top:0;width:100%;height:100%}' +
      '.db-cv .t{position:absolute;left:12px;bottom:10px;font-size:11px;color:#888;font-weight:600;background:rgba(244,244,244,.85);padding:2px 6px;border-radius:6px}');
    var N = 90, w = wrap(el, 'db-cv', '<canvas></canvas><div class="t">점 ' + N + '개</div>'), cv = w.firstChild, ps = [], first = true;
    for (var i = 0; i < N; i++) {
      var a = Math.random() * 6.2832, s = 20 + Math.random() * 40;
      ps.push({ x: Math.random(), y: Math.random(), vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 1.2 + Math.random() * 1.6, c: i % 9 ? '#333' : '#3a86ff' });
    }
    loop(el, function (t, dt) {
      var g = fitCanvas(cv, w), c = g.c;
      c.fillStyle = first ? '#f4f4f4' : 'rgba(244,244,244,.28)'; // trails: the canvas is repainted every frame
      first = false;
      c.fillRect(0, 0, g.W, g.H);
      for (var i = 0; i < N; i++) {
        var p = ps[i], x = p.x * g.W + p.vx * dt, y = p.y * g.H + p.vy * dt;
        if (x < 0 || x > g.W) { p.vx = -p.vx; x = Math.max(0, Math.min(g.W, x)); }
        if (y < 0 || y > g.H) { p.vy = -p.vy; y = Math.max(0, Math.min(g.H, y)); }
        p.x = x / g.W; p.y = y / g.H;
        c.fillStyle = p.c;
        c.fillRect(x - p.r, y - p.r, p.r * 2, p.r * 2);
      }
    }, 0);
  };

  D['클립패스'] = function (el) {
    function poly(R, r) {
      var pts = [];
      for (var i = 0; i < 10; i++) {
        var a = (-90 + 36 * i) * Math.PI / 180, q = i % 2 ? r : R;
        pts.push((50 + q * Math.cos(a)).toFixed(1) + '% ' + (50 + q * Math.sin(a)).toFixed(1) + '%');
      }
      return 'polygon(' + pts.join(',') + ')';
    }
    var circ = poly(30, 30), star = poly(50, 21), big = poly(46, 46);
    var img = 'radial-gradient(circle at 68% 30%,#ffe27a 0 11%,transparent 12%),linear-gradient(155deg,transparent 62%,#2b2d5c 62%),linear-gradient(205deg,transparent 58%,#45478a 58%),linear-gradient(180deg,#ff7e5f,#feb47b 60%,#ffd9a0)';
    css('db-clip-css',
      '.db-clip{display:flex;align-items:center;justify-content:center;background-color:#f4f4f4;' +
      'background-image:conic-gradient(#e4e4e4 25%,#f7f7f7 0 50%,#e4e4e4 0 75%,#f7f7f7 0);background-size:16px 16px}' +
      '.db-clip .st{position:relative;width:140px;height:140px}' +
      '.db-clip .st i{position:absolute;top:0;left:0;right:0;bottom:0;background:' + img + '}' +
      '.db-clip .gh{opacity:.16}' +
      '.db-clip .im{animation:db-clip-m 4.5s ease-in-out infinite}' +
      '@keyframes db-clip-m{0%,12%,100%{clip-path:' + circ + '}40%,60%{clip-path:' + star + '}80%,88%{clip-path:' + big + '}}');
    wrap(el, 'db-clip', '<div class="st"><i class="gh"></i><i class="im"></i></div>', '-2.2s');
  };

  D['색반전'] = function (el) {
    css('db-fs-css',
      '.db-fs{display:flex;align-items:center;justify-content:center;background:#f4f4f4}' +
      '.db-fs .bt{position:relative;width:132px;height:46px;border:2px solid #111;border-radius:23px;overflow:hidden;box-sizing:border-box;font-weight:700;font-size:15px}' +
      '.db-fs .bt span{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center}' +
      '.db-fs .a{color:#111;background:#fff}' +
      '.db-fs .b{color:#fff;background:#111;clip-path:inset(0 100% 0 0);animation:db-fs-s 3.2s cubic-bezier(.6,0,.3,1) infinite}' +
      '@keyframes db-fs-s{0%,18%{clip-path:inset(0 100% 0 0)}45%,72%{clip-path:inset(0 0 0 0)}96%,100%{clip-path:inset(0 0 0 100%)}}' +
      '.db-fs .cu{position:absolute;left:50%;top:50%;width:14px;height:20px;filter:drop-shadow(0 0 1px #fff) drop-shadow(0 1px 2px rgba(0,0,0,.3));animation:db-fs-c 3.2s ease-in-out infinite}' +
      '.db-fs .cu:before{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:#111;clip-path:polygon(0 0,0 78%,26% 60%,44% 100%,58% 93%,40% 55%,74% 55%)}' +
      '@keyframes db-fs-c{0%{transform:translate(90px,60px);opacity:0}12%,74%{transform:translate(24px,6px);opacity:1}92%,100%{transform:translate(90px,60px);opacity:0}}');
    wrap(el, 'db-fs', '<div class="bt"><span class="a">시작하기</span><span class="b">시작하기</span></div><div class="cu"></div>', '-1.9s');
  };

  D['돋보기'] = function (el) {
    css('db-lens-css',
      '.db-lens{background:#f4f4f4}' +
      '.db-lens .ct{position:absolute;left:0;top:0;width:100%;height:100%;padding:14px 12px;box-sizing:border-box;overflow:hidden;white-space:nowrap;' +
      'font-size:9px;line-height:18px;color:#777;font-weight:600;background-image:radial-gradient(#d3d3d3 1px,transparent 1.3px);background-size:8px 8px;background-color:#f4f4f4}' +
      '.db-lens .ct b{color:#ff3b5c}' +
      '.db-lens .ln{position:absolute;left:0;top:0;width:76px;height:76px;border-radius:50%;overflow:hidden;' +
      'box-shadow:0 0 0 2px #fff,0 0 0 3px rgba(0,0,0,.18),0 8px 18px rgba(0,0,0,.25)}' +
      '.db-lens .ln .ct{transform-origin:0 0}' +
      '.db-lens .ln:after{content:"";position:absolute;top:0;left:0;right:0;bottom:0;border-radius:50%;background:radial-gradient(circle at 30% 25%,rgba(255,255,255,.55),transparent 40%)}');
    var txt = '', row = '작은 글씨도 <b>크게</b> 보여요 · 가나다라마바사 · ';
    for (var i = 0; i < 8; i++) txt += row.slice(i * 3 % 9) + row + '<br>';
    var w = wrap(el, 'db-lens', '<div class="ct">' + txt + '</div><div class="ln"><div class="ct">' + txt + '</div></div>');
    var ln = w.querySelector('.ln'), cl = ln.firstChild, R = 38, S = 2.2;
    loop(el, function (t) {
      var W = w.clientWidth || 280, H = w.clientHeight || 180;
      var cx = W / 2 + W * 0.3 * Math.sin(t * 0.9), cy = H / 2 + H * 0.22 * Math.sin(t * 1.4);
      ln.style.transform = 'translate(' + (cx - R) + 'px,' + (cy - R) + 'px)';
      cl.style.width = W + 'px'; cl.style.height = H + 'px';
      cl.style.transform = 'translate(' + (R - cx * S) + 'px,' + (R - cy * S) + 'px) scale(' + S + ')';
    }, 0.6);
  };

  D['반사광'] = function (el) {
    css('db-spec-css',
      '.db-spec{background:#0d0f14;display:flex;align-items:center;justify-content:center}' +
      '.db-spec .s{position:relative;width:170px;height:110px;border-radius:20px;overflow:hidden;--x:30%;--y:30%;' +
      'background:linear-gradient(160deg,#2a2f3a,#0f1116 60%,#07080b);box-shadow:inset 0 1px 0 rgba(255,255,255,.18),inset 0 -1px 0 rgba(0,0,0,.6),0 12px 30px rgba(0,0,0,.6)}' +
      '.db-spec .s:before{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at var(--x) var(--y),rgba(255,255,255,.6),rgba(255,255,255,.12) 16%,transparent 40%)}' +
      '.db-spec .s:after{content:"";position:absolute;top:-50%;bottom:-50%;left:var(--x);width:30px;margin-left:-15px;transform:rotate(20deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent)}');
    var w = wrap(el, 'db-spec', '<div class="s"></div>'), s = w.firstChild;
    var cx = 30, cy = 30, px = 0, py = 0, lastP = -1e9, now = 0;
    el.addEventListener('pointermove', function (e) {
      var r = s.getBoundingClientRect();
      if (!r.width) return;
      px = (e.clientX - r.left) / r.width * 100; py = (e.clientY - r.top) / r.height * 100; lastP = now;
      if (RM) { s.style.setProperty('--x', px + '%'); s.style.setProperty('--y', py + '%'); }
    });
    loop(el, function (t) {
      now = t;
      var follow = t - lastP < 1.5;
      var tx = follow ? px : 50 + 42 * Math.sin(t * 1.1), ty = follow ? py : 38 + 26 * Math.sin(t * 0.7 + 1);
      cx += (tx - cx) * (RM ? 1 : 0.12); cy += (ty - cy) * (RM ? 1 : 0.12);
      s.style.setProperty('--x', cx.toFixed(1) + '%'); s.style.setProperty('--y', cy.toFixed(1) + '%');
    }, 0.4);
  };
})();
