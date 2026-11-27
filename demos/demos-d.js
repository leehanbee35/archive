/* demos-d.js — live preview demos for glossary terms (커서 · 폼).
   Contract: window.DEMOS[k] = function (el) {...}; el.dataset.on === '1' while visible. */
(function () {
  var D = (window.DEMOS = window.DEMOS || {});
  var RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var ARROW = '<svg width="18" height="22" viewBox="0 0 18 22"><path d="M1.5 1.5v16.5l4.3-3.9 2.9 6.6 3-1.3-2.9-6.5h6z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  var COMMON =
    '.dd-w{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#111;-webkit-user-select:none;user-select:none;line-height:1.2;font-size:13px}' +
    '.dd-w .dd-st{position:relative;width:220px;height:160px;flex:none}' +
    '.dd-w .dd-cur{position:absolute;left:0;top:0;width:18px;height:22px;pointer-events:none;z-index:30;transform:translate(240px,185px);transition:opacity .25s}' +
    '.dd-w .dd-cur.tw{transition:transform .6s cubic-bezier(.5,0,.2,1),opacity .25s}' +
    '.dd-w .dd-cur.hd{opacity:0}' +
    '.dd-w .dd-cur svg{display:block;transform-origin:2px 2px;transition:transform .12s;filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.3))}' +
    '.dd-w .dd-cur.dn svg{transform:scale(.8)}' +
    '.dd-w .dd-k{width:1.5px;height:17px;background:#111;margin-left:1px;flex:none;animation:dd-k 1s steps(1) infinite}' +
    '@keyframes dd-k{50%{opacity:0}}' +
    '@media (prefers-reduced-motion: reduce){.dd-w *,.dd-w *::before,.dd-w *::after{animation:none!important;transition:none!important}}';

  function css(id, txt) {
    if (document.getElementById(id)) return;
    var s = document.createElement('style');
    s.id = id; s.textContent = txt;
    document.head.appendChild(s);
  }
  function mk(el, p, style, html) {
    css('dd-css-common', COMMON);
    css('dd-css-' + p, style);
    var w = document.createElement('div');
    w.className = 'dd-w dd-' + p;
    w.innerHTML = '<div class="dd-st">' + html + '</div>';
    el.appendChild(w);
    var st = w.firstChild;
    return {
      w: w, st: st,
      q: function (s) { return st.querySelector(s); },
      qa: function (s) { return Array.prototype.slice.call(st.querySelectorAll(s)); },
      cur: function (tw) { var c = document.createElement('div'); c.className = 'dd-cur' + (tw ? ' tw' : ''); c.innerHTML = ARROW; st.appendChild(c); return c; }
    };
  }
  function life(el) { var seen = false; return function () { if (el.isConnected) { seen = true; return true; } return !seen; }; }
  function hold(el) { el._ddHold = Date.now(); }
  // cyclic step machine [[waitMs, fn], ...]; pauses off-screen or while the real pointer was just used
  function seq(el, steps, still) {
    if (RM) { if (still) still(); return; }
    var alive = life(el), i = 0;
    (function tick() {
      if (!alive()) return;
      if (el.dataset.on !== '1' || (el._ddHold && Date.now() - el._ddHold < 2000)) { setTimeout(tick, 350); return; }
      var s = steps[i]; i = (i + 1) % steps.length;
      s[1](); setTimeout(tick, s[0]);
    })();
  }
  function raf(el, fn) {
    var alive = life(el);
    (function f(t) {
      if (!alive()) return;
      if (el.dataset.on === '1') { fn(t || 0); requestAnimationFrame(f); }
      else setTimeout(function () { requestAnimationFrame(f); }, 300);
    })(0);
  }
  function mv(c, x, y, dn) { c.style.transform = 'translate(' + x + 'px,' + y + 'px)'; c.classList.toggle('dn', !!dn); }
  function local(st, e) { var r = st.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function lp(a, b, k) { return RM ? b : a + (b - a) * k; }
  function cl(v, a, b) { return Math.max(a, Math.min(b, v)); }
  // pointer driver: fake cursor follows path(t); the real pointer takes over for 2s after it moves.
  // Reduced motion: fn called once at the `still` point.
  function track(el, m, path, fn, still, noArrow) {
    var c = noArrow ? null : m.cur(), S = { real: 0, x: 0, y: 0 };
    if (RM) { if (c) mv(c, still.x, still.y); fn(still.x, still.y, 0, false); return; }
    m.w.addEventListener('pointermove', function (e) { var p = local(m.st, e); S.x = p.x; S.y = p.y; S.real = Date.now(); });
    m.w.addEventListener('pointerleave', function () { S.real = 0; });
    raf(el, function (t) {
      var r = Date.now() - S.real < 2000, p = r ? S : path(t);
      if (c) { if (!r) mv(c, p.x, p.y); c.classList.toggle('hd', r); }
      fn(p.x, p.y, t, r);
    });
  }
  // fake click at (x,y): move, press (fn), release
  function clk(c, x, y, fn) {
    return [[650, function () { c.classList.remove('hd'); mv(c, x, y); }], [150, function () { mv(c, x, y, 1); fn(); }], [380, function () { mv(c, x, y); }]];
  }
  function away(c) { mv(c, 240, 185); }

  /* ───────── 커서 ───────── */

  D['마그네틱버튼'] = function (el) {
    var m = mk(el, 'mag',
      '.dd-mag .mg-f{position:absolute;left:40px;top:10px;width:140px;height:140px;box-sizing:border-box;border-radius:50%;border:1.5px dashed #d2d2d2;transition:border-color .3s}' +
      '.dd-mag .mg-f.on{border-color:#9a9a9a}' +
      '.dd-mag .mg-b{position:absolute;left:62px;top:60px;width:96px;height:40px;border-radius:20px;background:#111;color:#fff;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;will-change:transform;box-shadow:0 4px 12px rgba(0,0,0,.18)}' +
      '.dd-mag .mg-b span{display:block;will-change:transform}',
      '<div class="mg-f"></div><div class="mg-b"><span>구매하기</span></div>');
    var f = m.q('.mg-f'), b = m.q('.mg-b'), s = m.q('.mg-b span'), bx = 0, by = 0;
    track(el, m, function (t) { return { x: 110 + 100 * Math.sin(t / 1500), y: 80 + 34 * Math.sin(t / 830) }; }, function (x, y) {
      var dx = x - 110, dy = y - 80, k = Math.sqrt(dx * dx + dy * dy) < 70;
      bx = lp(bx, k ? dx * .4 : 0, .16); by = lp(by, k ? dy * .4 : 0, .16);
      b.style.transform = 'translate(' + bx + 'px,' + by + 'px)';
      s.style.transform = 'translate(' + bx * .35 + 'px,' + by * .35 + 'px)';
      f.classList.toggle('on', k);
    }, { x: 142, y: 98 });
  };

  D['이미지트레일'] = function (el) {
    var G = ['linear-gradient(140deg,#dcdcdc,#8a8a8a)', 'linear-gradient(160deg,#eccbb0,#b0703f)', 'linear-gradient(140deg,#c3d3e2,#56779a)',
      'linear-gradient(150deg,#d3e0c8,#6c8c5d)', 'linear-gradient(140deg,#555,#111)', 'linear-gradient(160deg,#e3d6ea,#8f73a3)'];
    var m = mk(el, 'itr',
      '.dd-itr .it-h{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#cdcdcd;letter-spacing:-.02em}' +
      '.dd-itr .it-p{position:absolute;width:36px;height:46px;margin:-23px 0 0 -18px;border-radius:5px;box-shadow:0 4px 10px rgba(0,0,0,.18);transform:rotate(var(--r));animation:dd-itr-f .9s ease-out forwards;pointer-events:none}' +
      '@keyframes dd-itr-f{0%{opacity:0;transform:rotate(var(--r)) scale(.5)}15%{opacity:1;transform:rotate(var(--r)) scale(1)}60%{opacity:1}100%{opacity:0;transform:rotate(var(--r)) scale(.85)}}',
      '<div class="it-h">움직여 보세요</div>');
    var lx = -99, ly = -99, n = 0, live = 0;
    function drop(x, y, keep) {
      var p = document.createElement('div');
      p.className = 'it-p'; p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.background = G[n++ % G.length];
      p.style.setProperty('--r', (keep ? (n % 2 ? -6 : 7) : Math.random() * 16 - 8) + 'deg');
      if (!keep) { live++; p.addEventListener('animationend', function () { live--; p.remove(); }); }
      m.st.appendChild(p);
    }
    if (RM) { [[42, 62], [78, 98], [118, 74], [158, 104]].forEach(function (p) { drop(p[0], p[1], 1); }); }
    track(el, m, function (t) { return { x: 110 + 90 * Math.sin(t / 1300), y: 80 + 55 * Math.sin(t / 700 + 1) }; }, function (x, y) {
      if (RM || Math.hypot(x - lx, y - ly) < 26 || live > 18) return;
      lx = x; ly = y; drop(x, y);
    }, { x: 166, y: 110 });
  };

  D['호버리빌'] = function (el) {
    var W = ['서울', '도쿄', '파리'], G = ['linear-gradient(150deg,#d4d4d4,#6d6d6d)', 'linear-gradient(150deg,#ebcdb8,#a2603d)', 'linear-gradient(150deg,#c6d3e0,#4f6b88)'];
    var m = mk(el, 'hrv',
      '.dd-hrv .hv-w{position:absolute;left:22px;height:36px;display:flex;align-items:center;font-size:26px;font-weight:800;letter-spacing:-.03em;color:#c4c4c4;transition:color .25s}' +
      '.dd-hrv .hv-w.on{color:#111}' +
      '.dd-hrv .hv-c{position:absolute;left:0;top:0;width:64px;height:80px;border-radius:6px;box-shadow:0 6px 16px rgba(0,0,0,.22);opacity:0;pointer-events:none;transition:opacity .25s;z-index:5;will-change:transform}' +
      '.dd-hrv .hv-c.on{opacity:1}',
      W.map(function (w, i) { return '<div class="hv-w" style="top:' + (22 + i * 40) + 'px">' + w + '</div>'; }).join('') + '<div class="hv-c"></div>');
    var ws = m.qa('.hv-w'), c = m.q('.hv-c'), cx = 60, cy = 40, sc = .6, cur = -1;
    track(el, m, function (t) { return { x: 70 + 75 * Math.sin(t / 1900), y: 80 + 52 * Math.sin(t / 1100) }; }, function (x, y) {
      var i = Math.floor((y - 22) / 40), hit = x > 16 && x < 92 && i >= 0 && i < 3 && (y - 22) - i * 40 < 36 ? i : -1;
      if (hit !== cur) {
        if (cur >= 0) ws[cur].classList.remove('on');
        cur = hit; c.classList.toggle('on', hit >= 0);
        if (hit >= 0) { ws[hit].classList.add('on'); c.style.background = G[hit]; }
      }
      var tx = cl(x + 18, 0, 152), ty = cl(y - 44, 0, 80), rot = cl((tx - cx) * .5, -12, 12);
      cx = lp(cx, tx, .2); cy = lp(cy, ty, .2); sc = lp(sc, hit >= 0 ? 1 : .6, .2);
      c.style.transform = 'translate(' + cx + 'px,' + cy + 'px) rotate(' + (RM ? 4 : rot) + 'deg) scale(' + sc + ')';
    }, { x: 56, y: 80 });
  };

  D['블렌드커서'] = function (el) {
    var m = mk(el, 'bln',
      '.dd-bln .bl-b{position:absolute;inset:0;border-radius:10px;background:#fff;overflow:hidden;isolation:isolate;cursor:none}' +
      '.dd-bln .bl-t{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:42px;font-weight:900;letter-spacing:-.04em;color:#111;line-height:1}' +
      '.dd-bln .bl-t small{font-size:12px;font-weight:600;letter-spacing:0;margin-top:10px}' +
      '.dd-bln .bl-c{position:absolute;left:0;top:0;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;background:#fff;mix-blend-mode:difference;pointer-events:none;will-change:transform}',
      '<div class="bl-b"><div class="bl-t">반전<small>색이 뒤집혀요</small></div><div class="bl-c"></div></div>');
    var c = m.q('.bl-c'), cx = 110, cy = 80;
    track(el, m, function (t) { return { x: 110 + 80 * Math.sin(t / 1400), y: 74 + 32 * Math.sin(t / 900) }; }, function (x, y) {
      cx = lp(cx, x, .2); cy = lp(cy, y, .2);
      c.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
    }, { x: 96, y: 68 }, true);
  };

  D['스포트라이트'] = function (el) {
    var m = mk(el, 'spt',
      '.dd-spt .sp-b{position:absolute;inset:0;border-radius:10px;background:#1a1a1a;overflow:hidden}' +
      '.dd-spt .sp-t{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#fff;font-weight:800;font-size:22px;letter-spacing:-.02em}' +
      '.dd-spt .sp-t span{font-size:12px;font-weight:500;color:#bdbdbd;letter-spacing:0}' +
      '.dd-spt .sp-m{position:absolute;inset:0;background:radial-gradient(circle at var(--x,50%) var(--y,50%),rgba(26,26,26,0) 0,rgba(26,26,26,0) 24px,rgba(26,26,26,.97) 62px)}',
      '<div class="sp-b"><div class="sp-t">빛을 비춰요<span>숨은 글자가 보여요</span></div><div class="sp-m"></div></div>');
    var o = m.q('.sp-m'), cx = 110, cy = 80;
    track(el, m, function (t) { return { x: 110 + 82 * Math.sin(t / 1500), y: 80 + 34 * Math.sin(t / 950) }; }, function (x, y) {
      cx = lp(cx, x, .18); cy = lp(cy, y, .18);
      o.style.setProperty('--x', cx + 'px'); o.style.setProperty('--y', cy + 'px');
    }, { x: 92, y: 72 });
  };

  D['틸트카드'] = function (el) {
    var m = mk(el, 'tlt',
      '.dd-tlt .tl-p{position:absolute;inset:0;perspective:520px}' +
      '.dd-tlt .tl-c{position:absolute;left:55px;top:12px;width:110px;height:136px;border-radius:12px;background:linear-gradient(150deg,#3c3c3c,#0e0e0e);box-shadow:0 10px 24px rgba(0,0,0,.25);overflow:hidden;will-change:transform}' +
      '.dd-tlt .tl-c i{position:absolute;left:12px;top:12px;width:26px;height:20px;border-radius:4px;background:linear-gradient(135deg,#e6e6e6,#9a9a9a)}' +
      '.dd-tlt .tl-c b{position:absolute;left:12px;bottom:12px;color:#fff;font-size:14px;font-weight:700}' +
      '.dd-tlt .tl-g{position:absolute;inset:0;background:radial-gradient(circle at var(--gx,50%) var(--gy,50%),rgba(255,255,255,.35),rgba(255,255,255,0) 60%);opacity:var(--go,0)}',
      '<div class="tl-p"><div class="tl-c"><i></i><b>멤버십</b><div class="tl-g"></div></div></div>');
    var c = m.q('.tl-c'), g = m.q('.tl-g'), rx = 0, ry = 0, go = 0;
    track(el, m, function (t) { return { x: 110 + 82 * Math.sin(t / 1600), y: 80 + 52 * Math.sin(t / 1000) }; }, function (x, y) {
      var nx = (x - 110) / 55, ny = (y - 80) / 68, ins = Math.abs(nx) <= 1 && Math.abs(ny) <= 1;
      ry = lp(ry, ins ? nx * 18 : 0, .12); rx = lp(rx, ins ? -ny * 18 : 0, .12); go = lp(go, ins ? 1 : 0, .12);
      c.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      g.style.setProperty('--gx', (x - 55) / 1.1 + '%'); g.style.setProperty('--gy', (y - 12) / 1.36 + '%'); g.style.setProperty('--go', go);
    }, { x: 146, y: 46 });
  };

  D['커서라벨'] = function (el) {
    var m = mk(el, 'clb',
      '.dd-clb .cl-p{position:absolute;top:22px;width:94px;height:116px;border-radius:8px;cursor:none}' +
      '.dd-clb .cl-a{left:12px;background:linear-gradient(150deg,#dadada,#7c7c7c)}' +
      '.dd-clb .cl-b{left:114px;background:linear-gradient(150deg,#c4c4c4,#4c4c4c)}' +
      '.dd-clb .cl-l{position:absolute;left:0;top:0;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;background:#111;color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:31;box-shadow:0 0 0 2px rgba(255,255,255,.85);transform:scale(0);will-change:transform}' +
      '.dd-clb .dd-cur.lb{opacity:0}',
      '<div class="cl-p cl-a"></div><div class="cl-p cl-b"></div><div class="cl-l">보기</div>');
    var l = m.q('.cl-l'), ar, sc = 0, lx = 0, ly = 0;
    track(el, m, function (t) { return { x: 110 + 95 * Math.sin(t / 1700), y: 80 + 44 * Math.sin(t / 950) }; }, function (x, y) {
      var hit = y > 22 && y < 138 && ((x > 12 && x < 106) || (x > 114 && x < 208));
      ar = ar || m.q('.dd-cur'); ar.classList.toggle('lb', hit);
      sc = lp(sc, hit ? 1 : 0, .2); lx = lp(lx, x, .35); ly = lp(ly, y, .35);
      l.style.transform = 'translate(' + lx + 'px,' + ly + 'px) scale(' + sc + ')';
    }, { x: 60, y: 82 });
  };

  D['리플'] = function (el) {
    var m = mk(el, 'rpl',
      '.dd-rpl .rp-b{position:absolute;left:30px;top:52px;width:160px;height:56px;border-radius:14px;background:#111;color:#fff;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;transition:transform .12s}' +
      '.dd-rpl .rp-b.dn{transform:scale(.97)}.dd-rpl .rp-b span{position:relative;pointer-events:none}' +
      '.dd-rpl .rp-r{position:absolute;width:200px;height:200px;margin:-100px 0 0 -100px;border-radius:50%;background:rgba(255,255,255,.32);transform:scale(0);animation:dd-rpl-a .75s ease-out forwards;pointer-events:none}' +
      '.dd-rpl .rp-r.st{transform:scale(.42);opacity:.85}' +
      '@keyframes dd-rpl-a{to{transform:scale(1);opacity:0}}',
      '<div class="rp-b"><span>눌러보세요</span></div>');
    var b = m.q('.rp-b'), c = m.cur(true), P = [[52, 18], [118, 38], [86, 26], [134, 16]], i = 0;
    function rip(x, y, keep) {
      var r = document.createElement('i'); r.className = 'rp-r' + (keep ? ' st' : '');
      r.style.left = x + 'px'; r.style.top = y + 'px';
      if (!keep) r.addEventListener('animationend', function () { r.remove(); });
      b.insertBefore(r, b.firstChild);
    }
    b.addEventListener('pointerdown', function (e) { var p = local(b, e); rip(p.x, p.y); hold(el); c.classList.add('hd'); });
    seq(el, [
      [650, function () { c.classList.remove('hd'); mv(c, P[i][0] + 30, P[i][1] + 52); }],
      [150, function () { mv(c, P[i][0] + 30, P[i][1] + 52, 1); b.classList.add('dn'); rip(P[i][0], P[i][1]); }],
      [550, function () { mv(c, P[i][0] + 30, P[i][1] + 52); b.classList.remove('dn'); i = (i + 1) % P.length; }]
    ], function () { rip(86, 26, 1); mv(c, 116, 78); });
  };

  D['커서트레일'] = function (el) {
    var N = 12, h = '';
    for (var k = 0; k < N; k++) h += '<i class="ct-d" style="width:' + (12 - k * .7) + 'px;height:' + (12 - k * .7) + 'px;opacity:' + (1 - k / N * .85) + '"></i>';
    var m = mk(el, 'ctr', '.dd-ctr .ct-d{position:absolute;left:0;top:0;border-radius:50%;background:#111;pointer-events:none;will-change:transform}', h);
    var ds = m.qa('.ct-d'), P = ds.map(function () { return { x: 110, y: 80 }; });
    function path(t) { return { x: 110 + 85 * Math.sin(t / 900), y: 80 + 52 * Math.sin(t / 1300 + .5) }; }
    function put(i) { var s = 12 - i * .7; ds[i].style.transform = 'translate(' + (P[i].x - s / 2) + 'px,' + (P[i].y - s / 2) + 'px)'; }
    var sp = path(3000);
    track(el, m, path, function (x, y) {
      for (var i = 0; i < N; i++) {
        if (RM) P[i] = path(3000 - i * 70);
        else { var tg = i ? P[i - 1] : { x: x, y: y }; P[i].x = lp(P[i].x, tg.x, .42); P[i].y = lp(P[i].y, tg.y, .42); }
        put(i);
      }
    }, sp);
  };

  /* ───────── 폼 ───────── */

  var ROWCSS = function (p) {
    return '.dd-' + p + ' .r{position:absolute;left:34px;display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;cursor:pointer}' +
      '.dd-' + p + ' .r em{font-style:normal;font-weight:500;font-size:12px;color:#999;margin-left:2px}';
  };

  D['체크박스'] = function (el) {
    var T = ['이용약관 동의', '개인정보 수집', '마케팅 수신'];
    var m = mk(el, 'chk', ROWCSS('chk') +
      '.dd-chk .ck-b{width:20px;height:20px;border-radius:5px;border:2px solid #b5b5b5;box-sizing:border-box;background:#fff;display:flex;align-items:center;justify-content:center;transition:background .2s,border-color .2s}' +
      '.dd-chk .ck-b svg{width:14px;height:14px;fill:none;stroke:#fff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:20;stroke-dashoffset:20;transition:stroke-dashoffset .25s .05s}' +
      '.dd-chk .r.on .ck-b{background:#111;border-color:#111}.dd-chk .r.on svg{stroke-dashoffset:0}',
      T.map(function (t, i) { return '<div class="r" style="top:' + (34 + i * 34) + 'px"><span class="ck-b"><svg viewBox="0 0 14 14"><path d="M2.5 7.3l3 3 6-6.3"/></svg></span>' + t + '</div>'; }).join(''));
    var rs = m.qa('.r'), c = m.cur(true);
    function tg(i, v) { rs[i].classList.toggle('on', v); }
    rs.forEach(function (r) { r.addEventListener('click', function () { r.classList.toggle('on'); hold(el); away(c); }); });
    seq(el, [].concat(
      clk(c, 44, 45, function () { tg(0, true); }),
      clk(c, 44, 79, function () { tg(1, true); }),
      [[1300, function () { away(c); }], [700, function () { rs.forEach(function (r, i) { tg(i, false); }); }]]
    ), function () { tg(0, true); tg(1, true); mv(c, 44, 79); });
  };

  D['라디오버튼'] = function (el) {
    var T = ['일반 배송', '빠른 배송', '새벽 배송'], E = ['무료', '+3,000원', '+5,000원'];
    var m = mk(el, 'rad', ROWCSS('rad') +
      '.dd-rad .rd-o{width:20px;height:20px;border-radius:50%;border:2px solid #b5b5b5;box-sizing:border-box;display:flex;align-items:center;justify-content:center;background:#fff;transition:border-color .2s}' +
      '.dd-rad .rd-o::after{content:"";width:10px;height:10px;border-radius:50%;background:#111;transform:scale(0);transition:transform .2s}' +
      '.dd-rad .r.on .rd-o{border-color:#111}.dd-rad .r.on .rd-o::after{transform:scale(1)}',
      T.map(function (t, i) { return '<div class="r" style="top:' + (34 + i * 34) + 'px"><span class="rd-o"></span>' + t + '<em>' + E[i] + '</em></div>'; }).join(''));
    var rs = m.qa('.r'), c = m.cur(true);
    function sel(i) { rs.forEach(function (r, j) { r.classList.toggle('on', i === j); }); }
    sel(0);
    rs.forEach(function (r, i) { r.addEventListener('click', function () { sel(i); hold(el); away(c); }); });
    seq(el, [].concat(
      clk(c, 44, 79, function () { sel(1); }), [[900, function () {}]],
      clk(c, 44, 113, function () { sel(2); }), [[900, function () {}]],
      clk(c, 44, 45, function () { sel(0); }), [[900, function () { away(c); }]]
    ), function () { sel(1); mv(c, 44, 79); });
  };

  D['드롭다운'] = function (el) {
    var O = ['서울', '부산', '제주'];
    var m = mk(el, 'drp',
      '.dd-drp .dp-f{position:absolute;left:30px;top:14px;width:160px;height:36px;box-sizing:border-box;border:1.5px solid #cfcfcf;border-radius:9px;background:#fff;display:flex;align-items:center;padding:0 12px;color:#999;transition:border-color .2s}' +
      '.dd-drp .dp-f.v{color:#111;font-weight:600}.dd-drp .dp-f.op{border-color:#111}' +
      '.dd-drp .dp-f svg{margin-left:auto;width:12px;height:12px;fill:none;stroke:#111;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:transform .2s}' +
      '.dd-drp .dp-f.op svg{transform:rotate(180deg)}' +
      '.dd-drp .dp-m{position:absolute;left:30px;top:54px;width:160px;box-sizing:border-box;padding:4px;border-radius:9px;background:#fff;box-shadow:0 6px 18px rgba(0,0,0,.14);opacity:0;transform:translateY(-6px);transition:opacity .2s,transform .2s}' +
      '.dd-drp .dp-m.op{opacity:1;transform:none}' +
      '.dd-drp .dp-i{height:28px;border-radius:6px;display:flex;align-items:center;padding:0 9px;transition:background .15s}.dd-drp .dp-i.hv{background:#ededed}',
      '<div class="dp-f"><span>지역 선택</span><svg viewBox="0 0 12 12"><path d="M2 4.5l4 4 4-4"/></svg></div>' +
      '<div class="dp-m">' + O.map(function (o) { return '<div class="dp-i">' + o + '</div>'; }).join('') + '</div>');
    var f = m.q('.dp-f'), v = m.q('.dp-f span'), mn = m.q('.dp-m'), its = m.qa('.dp-i'), c = m.cur(true);
    function open(o) { f.classList.toggle('op', o); mn.classList.toggle('op', o); }
    function hv(i) { its.forEach(function (it, j) { it.classList.toggle('hv', i === j); }); }
    seq(el, [].concat(
      clk(c, 150, 32, function () { open(true); }),
      [[450, function () { mv(c, 80, 72); hv(0); }], [500, function () { mv(c, 80, 100); hv(1); }]],
      clk(c, 80, 100, function () { v.textContent = '부산'; f.classList.add('v'); open(false); hv(-1); }),
      [[1300, function () { away(c); }], [700, function () { v.textContent = '지역 선택'; f.classList.remove('v'); }]]
    ), function () { open(true); hv(1); mv(c, 80, 100); });
  };

  D['콤보박스'] = function (el) {
    var O = ['서울', '부산', '대전', '제주'];
    var m = mk(el, 'cmb',
      '.dd-cmb .cb-f{position:absolute;left:30px;top:10px;width:160px;height:36px;box-sizing:border-box;border:1.5px solid #cfcfcf;border-radius:9px;background:#fff;display:flex;align-items:center;padding:0 12px;font-weight:600;transition:border-color .2s}' +
      '.dd-cmb .cb-f.op{border-color:#111}.dd-cmb .cb-ph{color:#aaa;font-weight:400}' +
      '.dd-cmb .cb-m{position:absolute;left:30px;top:50px;width:160px;box-sizing:border-box;padding:4px;border-radius:9px;background:#fff;box-shadow:0 6px 18px rgba(0,0,0,.14);opacity:0;transform:translateY(-6px);transition:opacity .2s,transform .2s}' +
      '.dd-cmb .cb-m.op{opacity:1;transform:none}' +
      '.dd-cmb .cb-i{height:24px;border-radius:6px;display:flex;align-items:center;padding:0 9px;color:#444}.dd-cmb .cb-i.hv{background:#ededed}.dd-cmb .cb-i b{color:#111;font-weight:800}',
      '<div class="cb-f"></div><div class="cb-m">' + O.map(function () { return '<div class="cb-i"></div>'; }).join('') + '</div>');
    var f = m.q('.cb-f'), mn = m.q('.cb-m'), its = m.qa('.cb-i'), c = m.cur(true);
    function R(q, op, hv, val) {
      f.innerHTML = val ? '<span>' + val + '</span>' : q ? '<span>' + q + '</span><i class="dd-k"></i>' : (op ? '<i class="dd-k" style="margin:0 1px 0 0"></i>' : '') + '<span class="cb-ph">도시 검색</span>';
      f.classList.toggle('op', !!op); mn.classList.toggle('op', !!op);
      its.forEach(function (it, i) {
        var w = O[i], hit = !q || w.indexOf(q) >= 0;
        it.style.display = hit ? '' : 'none'; it.classList.toggle('hv', hv && hit);
        it.innerHTML = q && hit ? w.replace(q, '<b>' + q + '</b>') : w;
      });
    }
    R('', false);
    seq(el, [].concat(
      clk(c, 150, 28, function () { R('', true); }),
      [[700, function () { mv(c, 172, 40); }], [700, function () { R('서', true); }], [600, function () { mv(c, 80, 66); R('서', true, true); }]],
      clk(c, 80, 66, function () { R('', false, false, '서울'); }),
      [[1300, function () { away(c); }], [700, function () { R('', false); }]]
    ), function () { R('서', true, true); mv(c, 80, 66); });
  };

  D['스테퍼'] = function (el) {
    var m = mk(el, 'stp',
      '.dd-stp .sp-l{position:absolute;left:35px;top:34px;font-size:12px;font-weight:700;color:#555}' +
      '.dd-stp .sp-g{position:absolute;left:35px;top:56px;width:150px;height:48px;box-sizing:border-box;border:1.5px solid #d0d0d0;border-radius:12px;background:#fff;display:flex;overflow:hidden}' +
      '.dd-stp .sp-k{width:46px;display:flex;align-items:center;justify-content:center;font-size:22px;color:#111;cursor:pointer;transition:background .15s,color .2s}' +
      '.dd-stp .sp-k.dn{background:#efefef}.dd-stp .sp-k.off{color:#ccc;cursor:default}' +
      '.dd-stp .sp-v{flex:1;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;border-left:1px solid #eee;border-right:1px solid #eee;font-variant-numeric:tabular-nums;overflow:hidden}' +
      '.dd-stp .sp-v span.u{animation:dd-stp-u .25s ease-out}.dd-stp .sp-v span.d{animation:dd-stp-d .25s ease-out}' +
      '@keyframes dd-stp-u{from{transform:translateY(70%);opacity:0}}@keyframes dd-stp-d{from{transform:translateY(-70%);opacity:0}}',
      '<div class="sp-l">수량</div><div class="sp-g"><div class="sp-k">−</div><div class="sp-v"><span>3</span></div><div class="sp-k">+</div></div>');
    var ks = m.qa('.sp-k'), vb = m.q('.sp-v'), n = 3, c = m.cur(true), Q = [1, 1, -1, -1, -1, -1, 1, 1], steps = [];
    function set(d) {
      var v = cl(n + d, 1, 9); if (v === n) return; n = v;
      vb.innerHTML = '<span class="' + (d > 0 ? 'u' : 'd') + '">' + n + '</span>';
      ks[0].classList.toggle('off', n === 1); ks[1].classList.toggle('off', n === 9);
    }
    function press(i, d) { ks[i].classList.add('dn'); set(d); setTimeout(function () { ks[i].classList.remove('dn'); }, 160); }
    ks.forEach(function (k, i) { k.addEventListener('click', function () { press(i, i ? 1 : -1); hold(el); away(c); }); });
    Q.forEach(function (d) { var i = d > 0 ? 1 : 0; steps = steps.concat(clk(c, i ? 160 : 60, 82, function () { press(i, d); })); });
    steps.push([900, function () { away(c); }]);
    seq(el, steps, function () { set(2); mv(c, 160, 82); });
  };

  D['라벨'] = function (el) {
    var m = mk(el, 'lbl',
      '.dd-lbl .lb-l{position:absolute;left:30px;top:32px;font-size:12px;font-weight:700;color:#777;cursor:pointer;transition:color .2s}' +
      '.dd-lbl .f .lb-l{color:#111}' +
      '.dd-lbl .lb-i{position:absolute;left:30px;top:52px;width:160px;height:40px;box-sizing:border-box;border:1.5px solid #cfcfcf;border-radius:9px;background:#fff;display:flex;align-items:center;padding:0 12px;font-size:14px;font-weight:600;transition:border-color .2s,box-shadow .2s}' +
      '.dd-lbl .f .lb-i{border-color:#111;box-shadow:0 0 0 3px rgba(17,17,17,.08)}' +
      '.dd-lbl .lb-i .dd-k{display:none}.dd-lbl .f .lb-i .dd-k{display:block}' +
      '.dd-lbl .lb-h{position:absolute;left:30px;top:100px;font-size:11px;color:#999}',
      '<div class="lb-l">이름</div><div class="lb-i"><span></span><i class="dd-k"></i></div><div class="lb-h">이름표를 눌러도 칸이 선택돼요</div>');
    var tx = m.q('.lb-i span'), c = m.cur(true);
    function foc(v) { m.st.classList.toggle('f', v); }
    m.q('.lb-l').addEventListener('click', function () { foc(true); hold(el); away(c); });
    seq(el, [].concat(
      clk(c, 40, 38, function () { foc(true); }),
      [[300, function () { tx.textContent = '홍'; }], [300, function () { tx.textContent = '홍길'; }], [1400, function () { tx.textContent = '홍길동'; }],
        [700, function () { away(c); foc(false); tx.textContent = ''; }]]
    ), function () { foc(true); tx.textContent = '홍길동'; mv(c, 40, 38); });
  };

  D['플레이스홀더'] = function (el) {
    var S = 'hi@mail.com';
    var m = mk(el, 'plh',
      '.dd-plh .ph-i{position:absolute;left:25px;top:58px;width:170px;height:44px;box-sizing:border-box;border:1.5px solid #cfcfcf;border-radius:10px;background:#fff;transition:border-color .2s}' +
      '.dd-plh .ph-i.f{border-color:#111}' +
      '.dd-plh .ph-p,.dd-plh .ph-x{position:absolute;left:14px;top:0;height:100%;display:flex;align-items:center;font-size:14px}' +
      '.dd-plh .ph-p{color:#a8a8a8;transition:opacity .25s,transform .25s}.dd-plh .ph-i.t .ph-p{opacity:0;transform:translateX(8px)}' +
      '.dd-plh .ph-x{font-weight:600}.dd-plh .ph-x .dd-k{display:none}.dd-plh .ph-i.f .ph-x .dd-k{display:block}',
      '<div class="ph-i"><div class="ph-p">이메일 주소</div><div class="ph-x"><span></span><i class="dd-k"></i></div></div>');
    var box = m.q('.ph-i'), tx = m.q('.ph-x span'), c = m.cur(true), steps;
    function set(s) { tx.textContent = s; box.classList.toggle('t', !!s); }
    steps = clk(c, 150, 80, function () { box.classList.add('f'); });
    steps.push([500, function () { away(c); }]);
    for (var i = 1; i <= S.length; i++) (function (s) { steps.push([110, function () { set(s); }]); })(S.slice(0, i));
    steps.push([1400, function () {}]);
    for (var j = S.length - 1; j >= 0; j--) (function (s) { steps.push([45, function () { set(s); }]); })(S.slice(0, j));
    steps.push([1100, function () {}], [800, function () { box.classList.remove('f'); }]);
    seq(el, steps, function () { box.classList.add('f'); set('hi@'); });
  };

  D['입력마스크'] = function (el) {
    var S = '01012345678', T = '___-____-____';
    var m = mk(el, 'msk',
      '.dd-msk .mk-l{position:absolute;left:25px;top:34px;font-size:12px;font-weight:700;color:#555}' +
      '.dd-msk .mk-i{position:absolute;left:25px;top:54px;width:170px;height:44px;box-sizing:border-box;border:1.5px solid #111;border-radius:10px;background:#fff;display:flex;align-items:center;padding:0 14px;font-size:16px;font-weight:700;letter-spacing:.02em;font-variant-numeric:tabular-nums;white-space:pre}' +
      '.dd-msk .mk-i u{text-decoration:none;color:#c9c9c9;font-weight:500}' +
      '.dd-msk .mk-r{position:absolute;left:25px;top:108px;font-size:11px;color:#999;font-variant-numeric:tabular-nums}',
      '<div class="mk-l">휴대폰 번호</div><div class="mk-i"></div><div class="mk-r"></div>');
    var box = m.q('.mk-i'), raw = m.q('.mk-r'), steps = [];
    function R(d) {
      var s = d.slice(0, 3) + (d.length > 3 ? '-' + d.slice(3, 7) : '') + (d.length > 7 ? '-' + d.slice(7) : '');
      box.innerHTML = '<span>' + s + '</span><i class="dd-k"></i><u>' + T.slice(s.length) + '</u>';
      raw.textContent = '입력한 숫자 ' + (d || '—');
    }
    R('');
    steps.push([700, function () { R(''); }]);
    for (var i = 1; i <= S.length; i++) (function (d) { steps.push([150, function () { R(d); }]); })(S.slice(0, i));
    steps.push([1700, function () {}]);
    seq(el, steps, function () { R(S); });
  };
})();
