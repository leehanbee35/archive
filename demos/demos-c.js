/* Motion term demos (set C). Plain browser JS, no deps. */
(function () {
  var D = (window.DEMOS = window.DEMOS || {});
  function RM() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function css(p, txt) {
    var id = 'dcss-' + p;
    if (document.getElementById(id)) return;
    var s = document.createElement('style');
    s.id = id;
    s.textContent = txt + '[data-on="0"]>.' + p + ' *{animation-play-state:paused!important}' +
      '@media (prefers-reduced-motion: reduce){.' + p + ' *{animation:none!important;transition:none!important}}';
    document.head.appendChild(s);
  }
  function wrap(el, p, html) {
    var w = document.createElement('div');
    w.className = p;
    w.style.cssText = 'position:absolute;inset:0;overflow:hidden';
    w.innerHTML = html || '';
    el.appendChild(w);
    return w;
  }
  // rAF loop: runs fn(time, dt) only while el.dataset.on === '1'; reduced motion draws one still frame.
  function loop(el, fn, still) {
    var last = 0, acc = 0, seen = false, rm = RM();
    function f(t) {
      if (el.isConnected) seen = true; else if (seen) return;
      var dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;
      if (el.dataset.on === '1') {
        if (rm) { fn(still || 0, 0, true); return; }
        acc += dt;
        fn(acc, dt, false);
      }
      requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }
  function size(el) { return [el.clientWidth || 280, el.clientHeight || 180]; }
  function fit(c, el, x) {
    var s = size(el), d = window.devicePixelRatio || 1;
    if (c.width !== Math.round(s[0] * d) || c.height !== Math.round(s[1] * d)) {
      c.width = Math.round(s[0] * d); c.height = Math.round(s[1] * d);
    }
    x.setTransform(d, 0, 0, d, 0, 0);
    return s;
  }
  function ease(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  var CANVAS = '{position:absolute;inset:0;width:100%;height:100%;display:block}';

  /* 1. Squash & Stretch */
  D['스쿼시스트레치'] = function (el) {
    css('dc-sq',
      '.dc-sq .g{position:absolute;left:22%;right:22%;bottom:30px;height:2px;border-radius:1px;background:#d6d6d6}' +
      '.dc-sq .sh{position:absolute;left:50%;bottom:26px;width:44px;height:8px;margin-left:-22px;border-radius:50%;background:#000;opacity:.12;animation:dcsqD 1.1s infinite}' +
      '.dc-sq .y{position:absolute;left:50%;bottom:31px;width:40px;height:40px;margin-left:-20px;transform:translateY(-55px);animation:dcsqY 1.1s infinite}' +
      '.dc-sq .b{width:40px;height:40px;border-radius:50%;background:#111;transform-origin:50% 100%;transform:scale(.88,1.14);animation:dcsqS 1.1s infinite}' +
      '@keyframes dcsqY{0%,100%{transform:translateY(0);animation-timing-function:cubic-bezier(.3,.7,.5,1)}50%{transform:translateY(-100px);animation-timing-function:cubic-bezier(.5,0,.7,.3)}}' +
      '@keyframes dcsqS{0%,100%{transform:scale(1.45,.6)}9%{transform:scale(.8,1.25)}30%,70%{transform:scale(1,1)}93%{transform:scale(.82,1.22)}}' +
      '@keyframes dcsqD{0%,100%{transform:scale(1.15);opacity:.22}50%{transform:scale(.5);opacity:.07}}');
    wrap(el, 'dc-sq', '<div class="g"></div><div class="sh"></div><div class="y"><div class="b"></div></div>');
  };

  /* 2. Particles */
  D['파티클'] = function (el) {
    css('dc-pt', '.dc-pt canvas' + CANVAS +
      '.dc-pt .b{position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:#111;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;line-height:1}');
    var w = wrap(el, 'dc-pt', '<canvas></canvas><div class="b">♥</div>');
    var c = w.querySelector('canvas'), x = c.getContext('2d'), btn = w.querySelector('.b'), ps = [], tb = -9;
    function burst() {
      ps = [];
      for (var i = 0; i < 30; i++) {
        var a = Math.random() * 6.283, s = 70 + Math.random() * 130;
        ps.push({ x: Math.cos(a) * 20, y: Math.sin(a) * 20, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 1.5 + Math.random() * 3, c: i % 4 ? '#222' : '#ff4d6d' });
      }
    }
    function step(dt) { ps.forEach(function (p) { p.vy += 240 * dt; p.vx *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt; }); }
    function draw(life) {
      var s = fit(c, el, x), a = Math.max(0, 1 - life / 1.1);
      x.clearRect(0, 0, s[0], s[1]);
      x.globalAlpha = a;
      ps.forEach(function (p) { x.fillStyle = p.c; x.beginPath(); x.arc(s[0] / 2 + p.x, s[1] / 2 + p.y, p.r * (0.4 + 0.6 * a), 0, 6.283); x.fill(); });
      x.globalAlpha = 1;
      btn.style.transform = 'scale(' + (life < 0.25 ? 1 + 0.18 * Math.sin(life / 0.25 * Math.PI) : 1) + ')';
    }
    loop(el, function (t, dt, still) {
      if (still) { burst(); for (var i = 0; i < 20; i++) step(0.016); draw(0.32); return; }
      if (t - tb >= 1.6) { tb = t; burst(); }
      step(dt); draw(t - tb);
    });
  };

  /* 3. Metaball (canvas field) */
  D['메타볼'] = function (el) {
    css('dc-mb', '.dc-mb canvas' + CANVAS);
    var w = wrap(el, 'dc-mb', '<canvas></canvas>');
    var c = w.firstChild, x = c.getContext('2d'), GH = 60, GW = 0, img;
    loop(el, function (t) {
      var s = size(el), gw = Math.max(10, Math.round(GH * s[0] / s[1]));
      if (gw !== GW) { GW = gw; c.width = GW; c.height = GH; img = x.createImageData(GW, GH); }
      var k = GH / 180, cx = GW / 2, cy = GH / 2;
      var b = [
        [cx + Math.cos(t * 0.9) * GW * 0.28, cy + Math.sin(t * 1.3) * GH * 0.16, 26 * k],
        [cx + Math.cos(t * 0.7 + 2) * GW * 0.3, cy + Math.sin(t * 1.1 + 1) * GH * 0.2, 21 * k],
        [cx + Math.sin(t * 0.5) * GW * 0.1, cy + Math.cos(t * 0.8) * GH * 0.24, 17 * k]
      ];
      var d = img.data, i = 0;
      for (var yy = 0; yy < GH; yy++) for (var xx = 0; xx < GW; xx++) {
        var f = 0;
        for (var j = 0; j < 3; j++) { var dx = xx - b[j][0], dy = yy - b[j][1]; f += b[j][2] * b[j][2] / (dx * dx + dy * dy + 0.01); }
        var a = Math.min(1, Math.max(0, (f - 1) * 4)), v = 244 - a * 227;
        d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; i += 4;
      }
      x.putImageData(img, 0, 0);
    }, 1.15);
  };

  /* 4. Gooey filter: plain vs. goo */
  D['끈적효과'] = function (el) {
    var id = 'dcgoo' + Math.random().toString(36).slice(2, 9), dots = '';
    [-60, -30, 0, 30, 60].forEach(function (v) { dots += '<i style="--x:' + v + 'px"></i>'; });
    css('dc-go',
      '.dc-go .r{position:absolute;left:0;right:0;height:72px}.dc-go .r1{top:14px}.dc-go .r2{top:94px}' +
      '.dc-go .r span{position:absolute;left:12px;top:4px;font-size:11px;color:#999;font-weight:600}.dc-go .r2 span{color:#7c5cff}' +
      '.dc-go .d{position:absolute;inset:0}' +
      '.dc-go .d i{position:absolute;left:50%;top:50%;width:22px;height:22px;margin:-11px;border-radius:50%;background:#111;transform:translateX(calc(var(--x) * .5));animation:dcgoM 2.6s ease-in-out infinite}' +
      '@keyframes dcgoM{0%,10%,90%,100%{transform:translateX(var(--x))}42%,58%{transform:translateX(calc(var(--x) * .28))}}');
    wrap(el, 'dc-go',
      '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="' + id + '"><feGaussianBlur stdDeviation="5"/>' +
      '<feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"/></filter></svg>' +
      '<div class="r r1"><span>기본</span><div class="d">' + dots + '</div></div>' +
      '<div class="r r2"><span>Gooey</span><div class="d" style="filter:url(#' + id + ')">' + dots + '</div></div>');
  };

  /* 5. Spring physics */
  D['튕김스프링'] = function (el) {
    css('dc-sp', '.dc-sp svg' + CANVAS + '.dc-sp text{font-size:12px;font-weight:600;fill:#888}');
    var w = wrap(el, 'dc-sp',
      '<svg viewBox="0 0 300 180" preserveAspectRatio="xMidYMid meet"><line x1="150" y1="50" x2="150" y2="130" stroke="#ccc" stroke-dasharray="4 4"/>' +
      '<rect x="20" y="55" width="6" height="70" rx="2" fill="#bbb"/><polyline fill="none" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<rect y="70" width="40" height="40" rx="8" fill="#111"/><text x="150" y="160" text-anchor="middle"></text></svg>');
    var pl = w.querySelector('polyline'), bx = w.querySelectorAll('rect')[1], tx = w.querySelector('text');
    var X = 0, V = 0, pulling = true;
    function draw(X, label) {
      var x0 = 26, x1 = 130 + X, n = 12, pts = [x0 + ',90'];
      for (var i = 1; i < n; i++) pts.push((x0 + (x1 - x0) * i / n).toFixed(1) + ',' + (i % 2 ? 80 : 100));
      pts.push(x1.toFixed(1) + ',90');
      pl.setAttribute('points', pts.join(' '));
      bx.setAttribute('x', x1.toFixed(1));
      tx.textContent = label;
    }
    loop(el, function (t, dt, still) {
      if (still) { draw(45, ''); return; }
      var ph = t % 3;
      if (ph < 0.7) { X = 80 * ease(ph / 0.7); V = 0; pulling = true; }
      else {
        pulling = false;
        for (var i = 0; i < 4; i++) { var h = dt / 4; V += (-180 * X - 4 * V) * h; X += V * h; }
      }
      draw(X, pulling ? '당기기' : '놓기!');
    });
  };

  /* 6. Typewriter (with Hangul jamo composition) */
  D['타이핑효과'] = function (el) {
    css('dc-ty',
      '.dc-ty .bx{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);min-width:170px;height:52px;padding:0 16px;box-sizing:border-box;background:#fff;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.08);display:flex;align-items:center;font-size:24px;font-weight:700;color:#111;letter-spacing:-.02em}' +
      '.dc-ty .c{display:inline-block;width:2px;height:26px;margin-left:2px;background:#111;animation:dctyC 1s step-end infinite}' +
      '@keyframes dctyC{50%{opacity:0}}');
    var w = wrap(el, 'dc-ty', '<div class="bx"><span class="t"></span><span class="c"></span></div>');
    var tEl = w.querySelector('.t'), seq = [], P = 0;
    ['ㅇ', '아', '안', '안ㄴ', '안녀', '안녕', '안녕ㅎ', '안녕하', '안녕하ㅅ', '안녕하세', '안녕하세ㅇ', '안녕하세요'].forEach(function (s, i, a) { seq.push([s, i === a.length - 1 ? 1.4 : 0.13]); });
    ['안녕하세', '안녕하', '안녕', '안'].forEach(function (s) { seq.push([s, 0.09]); });
    seq.push(['', 0.6]);
    seq.forEach(function (s) { P += s[1]; });
    var cur = null;
    loop(el, function (t, dt, still) {
      var r = still ? P - 2 : t % P, s = '';
      for (var i = 0; i < seq.length; i++) { if (r < seq[i][1]) { s = seq[i][0]; break; } r -= seq[i][1]; }
      if (still) s = '안녕하세요';
      if (s !== cur) { cur = s; tEl.textContent = s; }
    });
  };

  /* 7. Page curl */
  D['페이지넘김'] = function (el) {
    var W = 150, H = 124;
    function pg(c) { return '<div class="p ' + c + '"><b></b><i></i><i></i><i style="width:60%"></i><i></i><i style="width:40%"></i><em></em></div>'; }
    css('dc-pc',
      '.dc-pc .st{position:absolute;left:50%;top:50%;width:' + W + 'px;height:' + H + 'px;margin:' + (-H / 2) + 'px 0 0 ' + (-W / 2) + 'px}' +
      '.dc-pc .p{position:absolute;inset:0;background:#fff;border-radius:3px;padding:14px;box-sizing:border-box;box-shadow:0 1px 3px rgba(0,0,0,.12)}' +
      '.dc-pc .p b{display:block;height:10px;width:50%;background:#111;border-radius:3px}' +
      '.dc-pc .p i{display:block;height:6px;background:#e3e3e3;border-radius:3px;margin:9px 0}' +
      '.dc-pc .p em{position:absolute;right:10px;bottom:8px;font-size:10px;font-weight:700;font-style:normal;color:#999}' +
      '.dc-pc .sh{position:absolute;left:' + (-W) + 'px;top:' + (-H) + 'px;width:' + (2 * W) + 'px;height:' + (2 * H) + 'px;filter:drop-shadow(-2px -2px 3px rgba(0,0,0,.25));pointer-events:none}' +
      '.dc-pc .fl{position:absolute;inset:0;background:linear-gradient(135deg,#bdbdbd 30%,#fff 60%,#e6e6e6)}');
    var w = wrap(el, 'dc-pc', '<div class="st">' + pg('p2') + pg('p1') + '<div class="sh"><div class="fl"></div></div></div>');
    var p1 = w.querySelector('.p1'), fl = w.querySelector('.fl'), ems = w.querySelectorAll('em'), R = [[0, 0], [W, 0], [W, H], [0, H]], n = -1;
    function clip(c, less) {
      var o = [];
      for (var i = 0; i < 4; i++) {
        var P = R[i], Q = R[(i + 1) % 4], a = P[0] + P[1] - c, b = Q[0] + Q[1] - c;
        if (less ? a <= 0 : a >= 0) o.push(P);
        if ((a < 0) !== (b < 0) && a !== b) { var k = a / (a - b); o.push([P[0] + (Q[0] - P[0]) * k, P[1] + (Q[1] - P[1]) * k]); }
      }
      return o;
    }
    function poly(pts, ox, oy) {
      if (pts.length < 3) return 'polygon(0 0,0 0,0 0)';
      return 'polygon(' + pts.map(function (p) { return (p[0] + ox).toFixed(1) + 'px ' + (p[1] + oy).toFixed(1) + 'px'; }).join(',') + ')';
    }
    function set(s) {
      var c = W + H - s;
      p1.style.clipPath = poly(clip(c, true), 0, 0);
      fl.style.clipPath = poly(clip(c, false).map(function (p) { return [c - p[1], c - p[0]]; }), W, H);
    }
    loop(el, function (t, dt, still) {
      var cyc = still ? 0 : Math.floor(t / 2.6), ph = still ? 0 : t % 2.6;
      if (cyc !== n) { n = cyc; ems[0].textContent = (n % 9) + 2; ems[1].textContent = (n % 9) + 1; }
      set(still ? 80 : ph < 1.7 ? ease(ph / 1.7) * (W + H + 12) : W + H + 12);
    }, 0);
  };

  /* 8. Unfold / expand */
  D['펼치기'] = function (el) {
    css('dc-uf',
      '.dc-uf .c{position:absolute;left:50%;top:26px;width:184px;margin-left:-92px;background:#fff;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.08);overflow:hidden}' +
      '.dc-uf .h{display:flex;justify-content:space-between;align-items:center;padding:11px 14px;font-size:13px;font-weight:700;color:#111}' +
      '.dc-uf .h s{text-decoration:none;display:inline-block;font-size:12px;color:#888;transform:rotate(180deg);animation:dcufR 3.4s infinite}' +
      '.dc-uf .b{height:78px;overflow:hidden;animation:dcufH 3.4s infinite}' +
      '.dc-uf .b i{display:block;height:7px;margin:2px 14px 12px;background:#e3e3e3;border-radius:4px}' +
      '@keyframes dcufH{0%,14%{height:0;animation-timing-function:cubic-bezier(.3,0,.2,1)}40%,72%{height:78px;animation-timing-function:cubic-bezier(.5,0,.3,1)}92%,100%{height:0}}' +
      '@keyframes dcufR{0%,14%{transform:rotate(0)}40%,72%{transform:rotate(180deg)}92%,100%{transform:rotate(0)}}');
    wrap(el, 'dc-uf', '<div class="c"><div class="h">자세히 보기<s>▾</s></div><div class="b"><i></i><i style="width:70%"></i><i></i><i style="width:45%"></i></div></div>');
  };

  /* 9. Screen transition (crossfade) */
  D['화면전환'] = function (el) {
    css('dc-tr',
      '.dc-tr .lb{position:absolute;left:12px;top:10px;font-size:11px;font-weight:600;color:#999}' +
      '.dc-tr .ph{position:absolute;left:50%;top:14px;width:92px;height:152px;margin-left:-46px;border-radius:16px;background:#111}' +
      '.dc-tr .s{position:absolute;inset:5px;border-radius:11px;background:#fff;overflow:hidden;padding:12px 8px;box-sizing:border-box}' +
      '.dc-tr .s i{display:block;height:14px;border-radius:4px;background:#e6e6e6;margin-bottom:7px}.dc-tr .s i.k{height:8px;width:55%;background:#111}' +
      '.dc-tr .b{opacity:.5;animation:dctrF 4.4s ease-in-out infinite}.dc-tr .b .im{height:62px;border-radius:7px;background:#333;margin-bottom:9px}' +
      '.dc-tr .b i{height:7px}' +
      '@keyframes dctrF{0%,28%{opacity:0}46%,78%{opacity:1}96%,100%{opacity:0}}');
    wrap(el, 'dc-tr', '<span class="lb">Crossfade</span><div class="ph">' +
      '<div class="s a"><i class="k"></i><i></i><i></i><i></i><i></i><i></i></div>' +
      '<div class="s b"><div class="im"></div><i class="k"></i><i></i><i style="width:70%"></i></div></div>');
  };

  /* 10. Morphing button: idle -> spinner -> check -> idle */
  D['상태전환'] = function (el) {
    css('dc-mo',
      '.dc-mo .bt{position:absolute;left:50%;top:50%;height:44px;width:128px;margin-top:-22px;transform:translateX(-50%);border-radius:22px;background:#111;color:#fff;overflow:hidden;animation:dcmoB 4s cubic-bezier(.5,0,.3,1) infinite}' +
      '.dc-mo .bt>*{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}' +
      '.dc-mo .lb{font-size:14px;font-weight:700;white-space:nowrap;animation:dcmoL 4s infinite}' +
      '.dc-mo .sw{opacity:0;animation:dcmoW 4s infinite}.dc-mo .sp{width:18px;height:18px;box-sizing:border-box;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:dcmoS .7s linear infinite}' +
      '.dc-mo .ck{opacity:0;animation:dcmoC 4s infinite}.dc-mo .ck path{stroke-dasharray:16;stroke-dashoffset:16;animation:dcmoP 4s infinite}' +
      '@keyframes dcmoB{0%,15%{width:128px;background:#111}22%,55%{width:44px;background:#111}60%,86%{width:44px;background:#22c55e}96%,100%{width:128px;background:#111}}' +
      '@keyframes dcmoL{0%,11%{opacity:1}16%,90%{opacity:0}97%,100%{opacity:1}}' +
      '@keyframes dcmoW{0%,20%{opacity:0}25%,53%{opacity:1}57%,100%{opacity:0}}' +
      '@keyframes dcmoC{0%,58%{opacity:0}62%,86%{opacity:1}90%,100%{opacity:0}}' +
      '@keyframes dcmoP{0%,60%{stroke-dashoffset:16}70%,100%{stroke-dashoffset:0}}' +
      '@keyframes dcmoS{to{transform:rotate(360deg)}}');
    wrap(el, 'dc-mo', '<div class="bt"><span class="lb">보내기</span><span class="sw"><span class="sp"></span></span>' +
      '<span class="ck"><svg width="20" height="20" viewBox="0 0 20 20"><path d="M5 10.5l3.5 3.5L15 7" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>');
  };

  /* 11. Theme switch with circular reveal */
  D['테마전환'] = function (el) {
    var at = ' at calc(50% + 58px) calc(50% - 40px))';
    css('dc-th',
      '.dc-th .L{position:absolute;inset:0;background:var(--bg)}' +
      '.dc-th .lt{--bg:#f4f4f4;--cd:#fff;--ink:#111;--mu:#e3e3e3;--tg:#d9d9d9}' +
      '.dc-th .dk{--bg:#141414;--cd:#262626;--ink:#f5f5f5;--mu:#3f3f3f;--tg:#ffb020;clip-path:circle(60px' + at + ';animation:dcthC 5s ease-in-out infinite}' +
      '.dc-th .cd{position:absolute;left:50%;top:50%;width:170px;height:120px;margin:-60px 0 0 -85px;box-sizing:border-box;padding:14px;border-radius:12px;background:var(--cd)}' +
      '.dc-th .tg{position:absolute;top:12px;right:12px;width:30px;height:16px;border-radius:8px;background:var(--tg)}' +
      '.dc-th .tg i{position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:#fff}.dc-th .dk .tg i{left:16px}' +
      '.dc-th .av{width:26px;height:26px;border-radius:50%;background:var(--ink)}' +
      '.dc-th .cd b{display:block;width:60%;height:8px;margin:10px 0 8px;border-radius:4px;background:var(--ink)}' +
      '.dc-th .cd em{display:block;height:6px;margin-bottom:6px;border-radius:3px;background:var(--mu)}' +
      '.dc-th .cd u{display:block;width:56px;height:16px;margin-top:9px;border-radius:8px;background:var(--ink)}' +
      '@keyframes dcthC{0%,14%{clip-path:circle(0px' + at + '}44%,64%{clip-path:circle(260px' + at + '}94%,100%{clip-path:circle(0px' + at + '}}');
    function ui(c) { return '<div class="L ' + c + '"><div class="cd"><div class="tg"><i></i></div><div class="av"></div><b></b><em></em><em style="width:70%"></em><u></u></div></div>'; }
    wrap(el, 'dc-th', ui('lt') + ui('dk'));
  };

  /* 12. Blink */
  D['깜빡임'] = function (el) {
    css('dc-bl',
      '.dc-bl .f{position:absolute;left:50%;top:50%;width:112px;height:100px;margin:-50px 0 0 -56px;border-radius:50% 50% 46% 46%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.08)}' +
      '.dc-bl .e{position:absolute;top:34px;width:12px;height:18px;border-radius:6px;background:#111;transform-origin:50% 60%;animation:dcblE 3.6s infinite}' +
      '.dc-bl .e.l{left:32px}.dc-bl .e.r{right:32px}' +
      '.dc-bl .ch{position:absolute;top:58px;width:16px;height:8px;border-radius:50%;background:#ff9bb0;opacity:.7}.dc-bl .ch.l{left:16px}.dc-bl .ch.r{right:16px}' +
      '.dc-bl .m{position:absolute;left:50%;top:60px;width:16px;height:8px;margin-left:-8px;box-sizing:border-box;border:2.5px solid #111;border-top:0;border-radius:0 0 10px 10px}' +
      '@keyframes dcblE{0%,40%,48%,78%,84%,90%,100%{transform:scaleY(1)}44%,81%,87%{transform:scaleY(.08)}}');
    wrap(el, 'dc-bl', '<div class="f"><i class="e l"></i><i class="e r"></i><i class="ch l"></i><i class="ch r"></i><i class="m"></i></div>');
  };

  /* 13. Caustics (low-res canvas, upscaled) */
  D['물결'] = function (el) {
    css('dc-ca', '.dc-ca canvas' + CANVAS);
    var w = wrap(el, 'dc-ca', '<canvas></canvas>');
    var c = w.firstChild, x = c.getContext('2d'), GH = 48, GW = 0, img, TAU = 6.28318;
    loop(el, function (tt) {
      var s = size(el), gw = Math.max(10, Math.round(GH * s[0] / s[1]));
      if (gw !== GW) { GW = gw; c.width = GW; c.height = GH; img = x.createImageData(GW, GH); }
      var time = tt * 0.5 + 23, d = img.data, k = 0;
      for (var yy = 0; yy < GH; yy++) for (var xx = 0; xx < GW; xx++) {
        var px = xx / GH * TAU * 0.9 - 250, py = yy / GH * TAU * 0.9 - 250, ix = px, iy = py, cc = 1;
        for (var n = 0; n < 4; n++) {
          var t = time * (1 - 3.5 / (n + 1)), nx = px + Math.cos(t - ix) + Math.sin(t + iy), ny = py + Math.sin(t - iy) + Math.cos(t + ix);
          ix = nx; iy = ny;
          var ax = px / (Math.sin(ix + t) / 0.005), ay = py / (Math.cos(iy + t) / 0.005);
          cc += 1 / Math.sqrt(ax * ax + ay * ay);
        }
        cc = 1.17 - Math.pow(cc / 4, 1.4);
        var v = Math.pow(Math.abs(cc), 8) * 255;
        d[k] = Math.min(255, 30 + v); d[k + 1] = Math.min(255, 150 + v); d[k + 2] = Math.min(255, 185 + v); d[k + 3] = 255; k += 4;
      }
      x.putImageData(img, 0, 0);
    }, 3);
  };

  /* 14. Timer with countdown ring */
  D['타이머'] = function (el) {
    var C = 2 * Math.PI * 50;
    css('dc-tm',
      '.dc-tm svg{position:absolute;left:50%;top:50%;width:132px;height:132px;margin:-66px 0 0 -66px}' +
      '.dc-tm .n{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}' +
      '.dc-tm .n span{font-size:11px;font-weight:600;color:#888;margin-bottom:2px}' +
      '.dc-tm .n b{font-size:26px;font-weight:800;color:#111;font-variant-numeric:tabular-nums;letter-spacing:-.02em}');
    var w = wrap(el, 'dc-tm',
      '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="#e2e2e2" stroke-width="8"/>' +
      '<circle class="fg" cx="60" cy="60" r="50" fill="none" stroke="#ff5a36" stroke-width="8" stroke-linecap="round" transform="rotate(-90 60 60)" stroke-dasharray="' + C.toFixed(2) + '"/></svg>' +
      '<div class="n"><span>집중</span><b>00:10</b></div>');
    var fg = w.querySelector('.fg'), num = w.querySelector('b'), T = 10, last = '';
    loop(el, function (t) {
      var rem = T - (t % T), s = '00:' + ('0' + Math.ceil(rem)).slice(-2);
      fg.setAttribute('stroke-dashoffset', (C * (1 - rem / T)).toFixed(2));
      if (s !== last) { last = s; num.textContent = s; }
    }, 3.2);
  };
})();
