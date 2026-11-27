/* demos-a.js — live preview demos for glossary terms (종류 · 상호작용).
   Contract: window.DEMOS[k] = function (el) {...}; el.dataset.on === '1' while visible. */
(function () {
  var D = (window.DEMOS = window.DEMOS || {});
  var RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var ARROW = '<svg width="18" height="22" viewBox="0 0 18 22"><path d="M1.5 1.5v16.5l4.3-3.9 2.9 6.6 3-1.3-2.9-6.5h6z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  var COMMON =
    '.da-w{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#111;-webkit-user-select:none;user-select:none;line-height:1.2}' +
    '.da-w .da-st{position:relative;width:220px;height:160px;flex:none}' +
    '.da-w .da-cur{position:absolute;left:0;top:0;width:18px;height:22px;pointer-events:none;z-index:20;transform:translate(240px,185px);transition:transform .7s cubic-bezier(.5,0,.2,1),opacity .3s}' +
    '.da-w .da-cur svg{display:block;transform-origin:2px 2px;transition:transform .12s;filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.3))}' +
    '.da-w .da-cur.dn svg{transform:scale(.8)}' +
    '@media (prefers-reduced-motion: reduce){.da-w *,.da-w *::before,.da-w *::after{animation:none!important;transition:none!important}}';

  function css(id, txt) {
    if (document.getElementById(id)) return;
    var s = document.createElement('style');
    s.id = id; s.textContent = txt;
    document.head.appendChild(s);
  }
  function mk(el, p, style, html) {
    css('da-css-common', COMMON);
    css('da-css-' + p, style);
    var w = document.createElement('div');
    w.className = 'da-w da-' + p;
    w.innerHTML = '<div class="da-st">' + html + '</div>';
    el.appendChild(w);
    var st = w.firstChild;
    return {
      st: st,
      q: function (s) { return st.querySelector(s); },
      qa: function (s) { return st.querySelectorAll(s); },
      cur: function () { var c = document.createElement('div'); c.className = 'da-cur'; c.innerHTML = ARROW; st.appendChild(c); return c; }
    };
  }
  // stop loops once el was attached and later removed
  function life(el) { var seen = false; return function () { if (el.isConnected) { seen = true; return true; } return !seen; }; }
  // cyclic step machine: steps = [[waitMs, fn], ...]; pauses while off-screen
  function seq(el, steps, still) {
    if (RM) { if (still) still(); return; }
    var alive = life(el), i = 0;
    (function tick() {
      if (!alive()) return;
      if (el.dataset.on !== '1') { setTimeout(tick, 400); return; }
      var s = steps[i]; i = (i + 1) % steps.length;
      s[1](); setTimeout(tick, s[0]);
    })();
  }
  // rAF loop; fn(t). Reduced motion: fn(stillT) once.
  function raf(el, fn, stillT) {
    if (RM) { fn(stillT || 0); return; }
    var alive = life(el);
    (function f(t) {
      if (!alive()) return;
      if (el.dataset.on === '1') { fn(t || 0); requestAnimationFrame(f); }
      else setTimeout(function () { requestAnimationFrame(f); }, 300);
    })(0);
  }
  function mv(c, x, y, dn) { c.style.transform = 'translate(' + x + 'px,' + y + 'px)'; c.classList.toggle('dn', !!dn); }
  function restart(n, cls) { n.classList.remove(cls); void n.offsetWidth; n.classList.add(cls); }
  function local(st, e) { var r = st.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

  /* ───────── 종류 ───────── */

  D['토글'] = function (el) {
    var m = mk(el, 'tg',
      '.da-tg .tg-r{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:14px;cursor:pointer}' +
      '.da-tg .tg-b{width:40px;height:40px;box-sizing:border-box;border:2.5px solid #111;border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;transition:background .2s,transform .15s}' +
      '.da-tg .tg-b svg{width:26px;height:26px}' +
      '.da-tg .tg-b path{fill:none;stroke:#fff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:24;stroke-dashoffset:24;transition:stroke-dashoffset .3s .05s}' +
      '.da-tg .on .tg-b{background:#111}.da-tg .on .tg-b path{stroke-dashoffset:0}' +
      '.da-tg .tg-r.pop .tg-b{animation:tg-pop .3s}@keyframes tg-pop{40%{transform:scale(.86)}}' +
      '.da-tg .tg-l{font-size:18px;font-weight:700;width:3em;color:#999;transition:color .2s}.da-tg .on .tg-l{color:#111}',
      '<div class="tg-r"><div class="tg-b"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><span class="tg-l">꺼짐</span></div>');
    var r = m.q('.tg-r'), l = m.q('.tg-l'), on = false;
    function set(v) { on = v; r.classList.toggle('on', v); l.textContent = v ? '켜짐' : '꺼짐'; if (!RM) restart(r, 'pop'); }
    r.addEventListener('click', function () { set(!on); });
    seq(el, [[1600, function () { set(!on); }]], function () { set(true); });
  };

  D['스위치'] = function (el) {
    var m = mk(el, 'sw',
      '.da-sw .sw-r{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:12px;font-size:13px;font-weight:600;color:#aaa}' +
      '.da-sw .sw-r span{transition:color .3s}.da-sw .sw-r:not(.on) .sw-0,.da-sw .sw-r.on .sw-1{color:#111}' +
      '.da-sw .sw-p{position:relative;width:72px;height:40px;border-radius:20px;background:#cfcfcf;cursor:pointer;transition:background .35s}' +
      '.da-sw .sw-k{position:absolute;left:4px;top:4px;width:32px;height:32px;border-radius:50%;background:#fff;box-shadow:0 2px 5px rgba(0,0,0,.25);transition:transform .4s cubic-bezier(.4,1.5,.5,1)}' +
      '.da-sw .on .sw-p{background:#34c759}.da-sw .on .sw-k{transform:translateX(32px)}',
      '<div class="sw-r"><span class="sw-0">꺼짐</span><div class="sw-p"><i class="sw-k"></i></div><span class="sw-1">켜짐</span></div>');
    var r = m.q('.sw-r'), on = false;
    function set(v) { on = v; r.classList.toggle('on', v); }
    m.q('.sw-p').addEventListener('click', function () { set(!on); });
    seq(el, [[1500, function () { set(!on); }]], function () { set(true); });
  };

  D['버튼'] = function (el) {
    var m = mk(el, 'bt',
      '.da-bt .bt-b{position:absolute;left:55px;top:62px;width:110px;height:42px;border-radius:12px;background:#111;color:#fff;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;transition:transform .12s,background .12s}' +
      '.da-bt .bt-b.dn{transform:scale(.94);background:#333}' +
      '.da-bt .bt-rp{position:absolute;left:50%;top:50%;width:12px;height:12px;margin:-6px;border-radius:50%;background:rgba(255,255,255,.45);opacity:0}' +
      '.da-bt .bt-rp.go{animation:bt-rp .6s ease-out}@keyframes bt-rp{from{opacity:1;transform:scale(0)}to{opacity:0;transform:scale(14)}}' +
      '.da-bt .bt-t{position:absolute;left:0;right:0;top:28px;text-align:center;font-size:13px;font-weight:600;color:#555;opacity:0;transform:translateY(6px);transition:opacity .25s,transform .25s}' +
      '.da-bt .bt-t.show{opacity:1;transform:none}',
      '<div class="bt-t">보냄 ✓</div><div class="bt-b">보내기<i class="bt-rp"></i></div>');
    var b = m.q('.bt-b'), rp = m.q('.bt-rp'), t = m.q('.bt-t'), c = m.cur();
    function press() { b.classList.add('dn'); restart(rp, 'go'); }
    b.addEventListener('pointerdown', press);
    b.addEventListener('pointerup', function () { b.classList.remove('dn'); t.classList.add('show'); });
    seq(el, [
      [800, function () { t.classList.remove('show'); mv(c, 240, 185); }],
      [800, function () { mv(c, 118, 86); }],
      [160, function () { mv(c, 118, 86, true); press(); }],
      [1000, function () { mv(c, 118, 86); b.classList.remove('dn'); t.classList.add('show'); }],
      [800, function () { mv(c, 190, 150); }]
    ], function () { mv(c, 118, 86); t.classList.add('show'); });
  };

  D['로딩'] = function (el) {
    mk(el, 'ld',
      '.da-ld .ld-c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}' +
      '.da-ld .ld-s{width:44px;height:44px;box-sizing:border-box;border-radius:50%;border:4px solid #d9d9d9;border-top-color:#111;animation:ld-r .8s linear infinite;transform:rotate(45deg)}' +
      '@keyframes ld-r{to{transform:rotate(405deg)}}' +
      '.da-ld .ld-d{display:flex;gap:5px;align-items:center;font-size:13px;font-weight:600;color:#666}' +
      '.da-ld .ld-d i{width:5px;height:5px;border-radius:50%;background:#666;animation:ld-b 1.2s infinite}' +
      '.da-ld .ld-d i:nth-child(2){animation-delay:.15s}.da-ld .ld-d i:nth-child(3){animation-delay:.3s}' +
      '@keyframes ld-b{0%,60%,100%{opacity:.25;transform:none}30%{opacity:1;transform:translateY(-3px)}}',
      '<div class="ld-c"><div class="ld-s"></div><div class="ld-d">로딩 중&nbsp;<i></i><i></i><i></i></div></div>');
  };

  D['프로그레스바'] = function (el) {
    var m = mk(el, 'pb',
      '.da-pb .pb-c{position:absolute;left:20px;right:20px;top:56px}' +
      '.da-pb .pb-h{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px}' +
      '.da-pb .pb-h b{font-size:13px;color:#666;font-weight:600}.da-pb .pb-n{font-size:24px;font-weight:800;font-variant-numeric:tabular-nums}' +
      '.da-pb .pb-t{height:10px;border-radius:5px;background:#dcdcdc;overflow:hidden}' +
      '.da-pb .pb-f{height:100%;width:100%;background:#111;border-radius:5px;transform-origin:left;transform:scaleX(0)}',
      '<div class="pb-c"><div class="pb-h"><b>업로드</b><span class="pb-n">0%</span></div><div class="pb-t"><div class="pb-f"></div></div></div>');
    var f = m.q('.pb-f'), n = m.q('.pb-n'), last = -1;
    raf(el, function (t) {
      var p = Math.min(1, (t % 3400) / 2500), e = 1 - Math.pow(1 - p, 2.2), v = Math.round(e * 100);
      if (v === last) return; last = v;
      f.style.transform = 'scaleX(' + e + ')'; n.textContent = v + '%';
    }, 1200);
  };

  D['내비게이션'] = function (el) {
    var ic = [
      '<path d="M3.5 11 12 4l8.5 7v8.5a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
      '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
      '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c.8-3.7 3.8-5.5 7.5-5.5s6.7 1.8 7.5 5.5"/>'
    ], names = ['홈', '검색', '내 정보'];
    var m = mk(el, 'nv',
      '.da-nv .nv-bar{position:absolute;left:22px;top:42px;width:176px;height:54px;box-sizing:border-box;padding:6px;display:flex;background:#fff;border-radius:18px;box-shadow:0 4px 14px rgba(0,0,0,.08)}' +
      '.da-nv .nv-ind{position:absolute;left:6px;top:6px;width:calc((100% - 12px)/3);height:42px;border-radius:13px;background:#111;transition:transform .45s cubic-bezier(.5,1.4,.5,1)}' +
      '.da-nv .nv-t{position:relative;flex:1;display:flex;align-items:center;justify-content:center;color:#9a9a9a;cursor:pointer;transition:color .3s}.da-nv .nv-t.on{color:#fff}' +
      '.da-nv .nv-t svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
      '.da-nv .nv-lb{position:absolute;left:0;right:0;top:110px;text-align:center;font-size:13px;font-weight:600;color:#555}',
      '<div class="nv-bar"><i class="nv-ind"></i>' + ic.map(function (p) { return '<div class="nv-t"><svg viewBox="0 0 24 24">' + p + '</svg></div>'; }).join('') + '</div><div class="nv-lb"></div>');
    var tabs = m.qa('.nv-t'), ind = m.q('.nv-ind'), lb = m.q('.nv-lb'), cur = 0;
    function go(i) {
      cur = i; ind.style.transform = 'translateX(' + i * 100 + '%)'; lb.textContent = names[i] + ' 화면';
      for (var k = 0; k < tabs.length; k++) tabs[k].classList.toggle('on', k === i);
    }
    Array.prototype.forEach.call(tabs, function (t, i) { t.addEventListener('click', function () { go(i); }); });
    go(0);
    seq(el, [[1300, function () { go((cur + 1) % 3); }]], function () { go(1); });
  };

  D['메뉴'] = function (el) {
    var m = mk(el, 'dk',
      '.da-dk .dk-d{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);display:flex;align-items:flex-end;gap:6px;padding:7px;background:rgba(255,255,255,.9);border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,.1)}' +
      '.da-dk .dk-d i{display:block;flex:none;width:30px;height:30px;border-radius:9px;background:#111}' +
      '.da-dk .dk-d i:nth-child(2){background:#444}.da-dk .dk-d i:nth-child(3){background:#777}.da-dk .dk-d i:nth-child(4){background:#aaa}.da-dk .dk-d i:nth-child(5){background:#cfcfcf}',
      '<div class="dk-d"><i></i><i></i><i></i><i></i><i></i></div>');
    var ic = m.qa('.dk-d i'), c = m.cur(), real = 0, rx = 0, ry = 0;
    c.style.transition = 'opacity .3s';
    m.st.parentNode.addEventListener('pointermove', function (e) { var p = local(m.st, e); rx = p.x; ry = p.y; real = Date.now(); });
    raf(el, function (t) {
      var x, y, useReal = Date.now() - real < 1500;
      if (useReal) { x = rx; y = ry; } else {
        var ph = t % 6000;
        x = 110 - 88 * Math.cos(Math.PI * Math.min(1, ph / 4200));
        y = ph < 4200 ? 114 : 114 - 70 * Math.sin(Math.PI * (ph - 4200) / 1800);
        mv(c, x, y);
      }
      c.style.opacity = useReal ? '0' : '1';
      var near = Math.max(0, Math.min(1, (y - 70) / 30));
      for (var i = 0; i < 5; i++) {
        var dx = x - (38 + 36 * i), s = 1 + 0.65 * near * Math.exp(-dx * dx / 1400);
        ic[i].style.width = ic[i].style.height = (30 * s).toFixed(1) + 'px';
      }
    }, 900);
  };

  D['대시보드'] = function (el) {
    var bars = [[.3, .8], [.6, .4], [.2, .9], [.7, .5], [.4, 1]];
    var m = mk(el, 'db',
      '.da-db .db-g{position:absolute;inset:4px 0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8px}' +
      '.da-db .db-t{background:#fff;border-radius:10px;padding:8px 10px;box-sizing:border-box;overflow:hidden}' +
      '.da-db .db-t b{display:block;font-size:10px;font-weight:600;color:#888}' +
      '.da-db .db-n{display:block;margin-top:6px;font-size:22px;font-weight:800;font-variant-numeric:tabular-nums}' +
      '.da-db .db-bars{display:flex;align-items:flex-end;gap:4px;height:38px;margin-top:4px}' +
      '.da-db .db-bars i{flex:1;height:100%;background:#111;border-radius:2px;transform-origin:bottom;transform:scaleY(var(--b));animation:db-bar 1.6s ease-in-out infinite alternate}' +
      '@keyframes db-bar{from{transform:scaleY(var(--a))}to{transform:scaleY(var(--b))}}' +
      '.da-db .db-w{grid-column:span 2;display:flex;align-items:center;gap:10px}.da-db .db-w b{flex:none}' +
      '.da-db .db-w svg{flex:1;height:34px;min-width:0}.da-db .db-w path{fill:none;stroke:#111;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:160;animation:db-ln 4s ease-out infinite}' +
      '@keyframes db-ln{from{stroke-dashoffset:160}40%,100%{stroke-dashoffset:0}}' +
      '.da-db .db-w em{font-style:normal;font-size:14px;font-weight:800;color:#16a34a}',
      '<div class="db-g"><div class="db-t"><b>방문자</b><span class="db-n">0</span></div>' +
      '<div class="db-t"><b>매출</b><div class="db-bars">' + bars.map(function (v, i) { return '<i style="--a:' + v[0] + ';--b:' + v[1] + ';animation-delay:-' + (i * .3) + 's"></i>'; }).join('') + '</div></div>' +
      '<div class="db-t db-w"><b>이번 주</b><svg viewBox="0 0 120 30" preserveAspectRatio="none"><path d="M2 25 20 20 38 22 56 13 74 16 92 7 118 5"/></svg><em>+12%</em></div></div>');
    var n = m.q('.db-n'), last = -1;
    raf(el, function (t) {
      var p = Math.min(1, (t % 4000) / 1600), v = Math.round(1284 * (1 - Math.pow(1 - p, 3)));
      if (v !== last) { last = v; n.textContent = String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    }, 4000);
  };

  D['버튼세트'] = function (el) {
    mk(el, 'vr',
      '.da-vr .vr-c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}' +
      '.da-vr .vr-r{display:flex;align-items:center;gap:8px}' +
      '.da-vr .vr-r span{display:flex;align-items:center;justify-content:center;box-sizing:border-box;border-radius:9px;font-weight:700;background:#111;color:#fff;border:1.5px solid #111;animation:vr-pop 4.5s var(--d) infinite both}' +
      '@keyframes vr-pop{0%{opacity:0;transform:translateY(8px) scale(.85)}10%,82%{opacity:1;transform:none}92%,100%{opacity:0;transform:scale(.95)}}' +
      '.da-vr .vr-s{height:26px;padding:0 10px;font-size:11px}.da-vr .vr-m{height:32px;padding:0 13px;font-size:13px}.da-vr .vr-l{height:40px;padding:0 17px;font-size:15px}' +
      '.da-vr .vr-r span.vr-o{background:#fff;color:#111}.da-vr .vr-r span.vr-a{background:#3b6cff;border-color:#3b6cff}',
      '<div class="vr-c"><div class="vr-r"><span class="vr-s" style="--d:0s">작게</span><span class="vr-m" style="--d:.12s">보통</span><span class="vr-l" style="--d:.24s">크게</span></div>' +
      '<div class="vr-r"><span class="vr-m" style="--d:.5s">기본</span><span class="vr-m vr-o" style="--d:.62s">보조</span><span class="vr-m vr-a" style="--d:.74s">강조</span></div></div>');
  };

  /* ───────── 상호작용 ───────── */

  D['호버'] = function (el) {
    var m = mk(el, 'hv',
      '.da-hv .hv-b{position:absolute;left:50px;top:58px;width:120px;height:44px;box-sizing:border-box;border-radius:12px;background:#fff;border:1.5px solid #d0d0d0;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;transition:all .25s ease}' +
      '.da-hv .hv-b.on,.da-hv .hv-b:hover{background:#111;color:#fff;border-color:#111;transform:translateY(-4px);box-shadow:0 10px 18px rgba(0,0,0,.18)}' +
      '.da-hv .hv-h{position:absolute;left:0;right:0;top:122px;text-align:center;font-size:12px;font-weight:600;color:#999;transition:color .25s}.da-hv .hv-h.on{color:#111}',
      '<div class="hv-b">버튼</div><div class="hv-h">올리기 전</div>');
    var b = m.q('.hv-b'), h = m.q('.hv-h'), c = m.cur();
    function set(v) { b.classList.toggle('on', v); h.classList.toggle('on', v); h.textContent = v ? '올렸을 때' : '올리기 전'; }
    seq(el, [
      [750, function () { mv(c, 118, 84); }],
      [1400, function () { set(true); }],
      [1300, function () { set(false); mv(c, 195, 148); }]
    ], function () { mv(c, 118, 84); set(true); });
  };

  D['호버강조'] = function (el) {
    var names = ['거실', '침실', '주방'];
    var m = mk(el, 'lh',
      '.da-lh .lh-row{position:absolute;left:6px;width:92px;height:26px;box-sizing:border-box;padding:0 10px;border-radius:8px;display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600;background:#fff;color:#555;transition:background .2s,color .2s}' +
      '.da-lh .lh-row i{width:7px;height:7px;border-radius:50%;background:#bbb;transition:background .2s}' +
      '.da-lh .lh-sh{position:absolute;box-sizing:border-box;border:1.5px solid #c6c6c6;background:#fff;border-radius:4px;transition:background .2s,border-color .2s}' +
      '.da-lh .on.lh-row{background:#ffedd5;color:#111}.da-lh .on.lh-row i{background:#ff8a00}.da-lh .on.lh-sh{background:#ffd8a8;border-color:#ff8a00}',
      names.map(function (n, i) { return '<div class="lh-row" data-i="' + i + '" style="top:' + (37 + i * 32) + 'px"><i></i>' + n + '</div>'; }).join('') +
      '<div class="lh-sh" data-i="0" style="left:112px;top:30px;width:56px;height:100px"></div>' +
      '<div class="lh-sh" data-i="1" style="left:171px;top:30px;width:43px;height:48px"></div>' +
      '<div class="lh-sh" data-i="2" style="left:171px;top:81px;width:43px;height:49px"></div>');
    var all = m.qa('[data-i]'), c = m.cur();
    function hi(k) { for (var j = 0; j < all.length; j++) all[j].classList.toggle('on', +all[j].dataset.i === k); }
    Array.prototype.forEach.call(all, function (n) {
      n.addEventListener('pointerenter', function () { hi(+n.dataset.i); });
      n.addEventListener('pointerleave', function () { hi(-1); });
    });
    seq(el, [
      [650, function () { mv(c, 60, 50); }], [1000, function () { hi(0); }],
      [650, function () { hi(-1); mv(c, 60, 82); }], [1000, function () { hi(1); }],
      [650, function () { hi(-1); mv(c, 190, 104); }], [1100, function () { hi(2); }],
      [900, function () { hi(-1); mv(c, 240, 185); }]
    ], function () { mv(c, 60, 82); hi(1); });
  };

  D['마우스따라가기'] = function (el) {
    var m = mk(el, 'mf',
      '.da-mf .mf-e{position:absolute;top:57px;width:46px;height:46px;box-sizing:border-box;border-radius:50%;background:#fff;border:2.5px solid #111}' +
      '.da-mf .mf-p{position:absolute;left:50%;top:50%;width:18px;height:18px;margin:-9px;border-radius:50%;background:#111}',
      '<div class="mf-e" style="left:59px"><i class="mf-p"></i></div><div class="mf-e" style="left:115px"><i class="mf-p"></i></div>');
    var ps = m.qa('.mf-p'), cx = [82, 138], c = m.cur(), real = 0, rx = 0, ry = 0;
    c.style.transition = 'opacity .3s';
    m.st.parentNode.addEventListener('pointermove', function (e) { var p = local(m.st, e); rx = p.x; ry = p.y; real = Date.now(); });
    raf(el, function (t) {
      var useReal = Date.now() - real < 2000, x, y;
      if (useReal) { x = rx; y = ry; } else { x = 110 + 92 * Math.sin(t / 1100); y = 80 + 58 * Math.sin(t / 730); mv(c, x, y); }
      c.style.opacity = useReal ? '0' : '1';
      for (var i = 0; i < 2; i++) {
        var dx = x - cx[i], dy = y - 80, d = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(1, d / 60) * 11 / d;
        ps[i].style.transform = 'translate(' + (dx * k).toFixed(1) + 'px,' + (dy * k).toFixed(1) + 'px)';
      }
    }, 0);
    if (RM) { mv(c, 180, 128); for (var i = 0; i < 2; i++) ps[i].style.transform = 'translate(8px,7px)'; }
  };

  D['드래그'] = function (el) {
    var m = mk(el, 'dg',
      '.da-dg .dg-s{position:absolute;left:132px;top:53px;width:64px;height:50px;box-sizing:border-box;border:2px dashed #b5b5b5;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:#aaa;transition:border-color .2s,background .2s}' +
      '.da-dg .dg-s.ok{border-style:solid;border-color:#111;background:#e6e6e6;color:transparent}' +
      '.da-dg .dg-c{position:absolute;left:24px;top:55px;width:60px;height:46px;border-radius:10px;background:#111;z-index:5;padding:10px;box-sizing:border-box;transition:transform .7s cubic-bezier(.5,0,.2,1),opacity .35s,box-shadow .2s}' +
      '.da-dg .dg-c i{display:block;height:4px;border-radius:2px;background:#fff;opacity:.85;margin-bottom:5px}.da-dg .dg-c i+i{width:60%;opacity:.5}' +
      '.da-dg .dg-c.lift{box-shadow:0 12px 20px rgba(0,0,0,.25)}' +
      '.da-dg .dg-h{position:absolute;left:0;right:0;top:122px;text-align:center;font-size:12px;font-weight:600;color:#999}',
      '<div class="dg-s">여기</div><div class="dg-c"><i></i><i></i></div><div class="dg-h">끌어서 놓기</div>');
    var s = m.q('.dg-s'), k = m.q('.dg-c'), c = m.cur();
    function card(dx, lift) { k.style.transform = 'translate(' + dx + 'px,0)' + (lift ? ' rotate(-4deg) scale(1.06)' : ''); k.classList.toggle('lift', lift); }
    seq(el, [
      [800, function () { k.style.transition = 'none'; card(0, false); s.classList.remove('ok'); void k.offsetWidth; k.style.transition = ''; k.style.opacity = '1'; mv(c, 240, 185); }],
      [800, function () { mv(c, 54, 78); }],
      [260, function () { mv(c, 54, 78, true); card(0, true); }],
      [850, function () { mv(c, 164, 78, true); card(110, true); }],
      [1000, function () { mv(c, 164, 78); card(110, false); s.classList.add('ok'); }],
      [700, function () { mv(c, 200, 150); k.style.opacity = '0'; }]
    ], function () { card(110, false); s.classList.add('ok'); mv(c, 164, 78); });
  };

  D['길게누르기'] = function (el) {
    var m = mk(el, 'lp',
      '.da-lp .lp-r{position:absolute;left:67px;top:20px;width:86px;height:86px}' +
      '.da-lp .lp-r svg{position:absolute;inset:0;transform:rotate(-90deg)}.da-lp .lp-r circle{fill:none;stroke-width:4}' +
      '.da-lp .lp-bg{stroke:#dcdcdc}.da-lp .lp-p{stroke:#111;stroke-linecap:round;stroke-dasharray:251.3;stroke-dashoffset:251.3;transition:stroke-dashoffset .3s}' +
      '.da-lp .hold .lp-p{stroke-dashoffset:0;transition:stroke-dashoffset 1.4s linear}.da-lp .done .lp-p{stroke:#34c759}' +
      '.da-lp .lp-b{position:absolute;left:11px;top:11px;width:64px;height:64px;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.1);display:flex;align-items:center;justify-content:center;transition:transform .2s,background .25s}' +
      '.da-lp .hold .lp-b{transform:scale(.92)}.da-lp .done .lp-b{background:#34c759;transform:none}' +
      '.da-lp .lp-b svg{position:absolute;width:26px;height:26px;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;transition:opacity .2s,transform .25s}' +
      '.da-lp .lp-i{stroke:#111}.da-lp .lp-ok{stroke:#fff;opacity:0;transform:scale(.5)}' +
      '.da-lp .done .lp-i{opacity:0}.da-lp .done .lp-ok{opacity:1;transform:none}' +
      '.da-lp .lp-l{position:absolute;left:0;right:0;top:120px;text-align:center;font-size:13px;font-weight:700;color:#555}',
      '<div class="lp-r"><svg viewBox="0 0 86 86"><circle class="lp-bg" cx="43" cy="43" r="40"/><circle class="lp-p" cx="43" cy="43" r="40"/></svg>' +
      '<div class="lp-b"><svg class="lp-i" viewBox="0 0 24 24"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/></svg><svg class="lp-ok" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div></div>' +
      '<div class="lp-l">꾹 누르기</div>');
    var r = m.q('.lp-r'), l = m.q('.lp-l'), c = m.cur();
    seq(el, [
      [800, function () { r.classList.remove('hold', 'done'); l.textContent = '꾹 누르기'; mv(c, 240, 185); }],
      [800, function () { mv(c, 112, 66); }],
      [1500, function () { mv(c, 112, 66, true); r.classList.add('hold'); l.textContent = '누르는 중…'; }],
      [1300, function () { mv(c, 112, 66); r.classList.add('done'); l.textContent = '삭제 완료'; }],
      [600, function () { mv(c, 195, 150); }]
    ], function () { r.classList.add('hold', 'done'); l.textContent = '삭제 완료'; mv(c, 112, 66); });
  };

  D['클립보드'] = function (el) {
    var m = mk(el, 'cb',
      '.da-cb .cb-f{position:absolute;left:15px;top:44px;width:190px;height:40px;box-sizing:border-box;background:#fff;border:1px solid #dcdcdc;border-radius:10px;padding-left:12px;display:flex;align-items:center;font-size:13px;color:#333}' +
      '.da-cb .cb-x{border-radius:3px;transition:background .2s}.da-cb .cp .cb-x{background:#dbe4ff}' +
      '.da-cb .cb-b{position:absolute;right:5px;top:4px;width:30px;height:30px;border-radius:8px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .12s,background .2s}' +
      '.da-cb .cb-b.dn{transform:scale(.88)}.da-cb .cp .cb-b{background:#dcfce7}' +
      '.da-cb .cb-b svg{position:absolute;width:16px;height:16px;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:opacity .2s}' +
      '.da-cb .cb-i{stroke:#333}.da-cb .cb-ok{stroke:#16a34a;opacity:0}.da-cb .cp .cb-i{opacity:0}.da-cb .cp .cb-ok{opacity:1}' +
      '.da-cb .cb-t{position:absolute;left:50%;top:110px;padding:7px 14px;border-radius:99px;background:#111;color:#fff;font-size:12px;font-weight:700;white-space:nowrap;opacity:0;transform:translate(-50%,14px);transition:opacity .25s,transform .3s cubic-bezier(.4,1.5,.5,1)}' +
      '.da-cb .cb-t.show{opacity:1;transform:translate(-50%,0)}',
      '<div class="cb-f"><span class="cb-x">hi@mail.com</span><div class="cb-b"><svg class="cb-i" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg><svg class="cb-ok" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div></div>' +
      '<div class="cb-t">✓ 복사됨</div>');
    var f = m.q('.cb-f'), b = m.q('.cb-b'), t = m.q('.cb-t'), c = m.cur();
    function done(v) { f.classList.toggle('cp', v); t.classList.toggle('show', v); }
    b.addEventListener('click', function () { done(true); setTimeout(function () { done(false); }, 1400); });
    seq(el, [
      [800, function () { done(false); mv(c, 240, 185); }],
      [800, function () { mv(c, 186, 64); }],
      [150, function () { mv(c, 186, 64, true); b.classList.add('dn'); }],
      [1600, function () { mv(c, 186, 64); b.classList.remove('dn'); done(true); }],
      [600, function () { mv(c, 205, 150); }]
    ], function () { done(true); mv(c, 186, 64); });
  };

  D['확인버튼'] = function (el) {
    var m = mk(el, 'cf',
      '.da-cf .cf-g{position:absolute;left:15px;top:22px;width:190px;height:44px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:#aaa}' +
      '.da-cf .cf-row{position:absolute;left:15px;top:22px;width:190px;height:44px;box-sizing:border-box;background:#fff;border-radius:10px;padding-left:9px;display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;transition:opacity .35s,transform .35s}' +
      '.da-cf .cf-row.gone{opacity:0;transform:translateX(-24px) scale(.96)}' +
      '.da-cf .cf-ic{width:26px;height:26px;border-radius:6px;background:#d6d6d6}' +
      '.da-cf .cf-del{position:absolute;right:7px;top:7px;width:30px;height:30px;border-radius:8px;background:#fdecec;display:flex;align-items:center;justify-content:center;transition:transform .12s}' +
      '.da-cf .cf-del svg{width:16px;height:16px;fill:none;stroke:#e5484d;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
      '.da-cf .dn{transform:scale(.88)}' +
      '.da-cf .cf-pop{position:absolute;left:77px;top:74px;width:128px;box-sizing:border-box;padding:10px;background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.14);transform-origin:90% 0;opacity:0;transform:translateY(-6px) scale(.94);pointer-events:none;transition:opacity .2s,transform .25s cubic-bezier(.4,1.4,.5,1)}' +
      '.da-cf .cf-pop.show{opacity:1;transform:none}' +
      '.da-cf .cf-pop b{display:block;font-size:13px;margin-bottom:8px}.da-cf .cf-bs{display:flex;gap:6px}' +
      '.da-cf .cf-bs span{flex:1;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;background:#eee;color:#444;transition:transform .12s}' +
      '.da-cf .cf-bs span.cf-ok{background:#e5484d;color:#fff}',
      '<div class="cf-g">삭제됨</div><div class="cf-row"><i class="cf-ic"></i>사진.jpg<div class="cf-del"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/></svg></div></div>' +
      '<div class="cf-pop"><b>정말요?</b><div class="cf-bs"><span>취소</span><span class="cf-ok">삭제</span></div></div>');
    var row = m.q('.cf-row'), del = m.q('.cf-del'), pop = m.q('.cf-pop'), ok = m.q('.cf-ok'), c = m.cur();
    seq(el, [
      [800, function () { row.classList.remove('gone'); pop.classList.remove('show'); mv(c, 240, 185); }],
      [800, function () { mv(c, 183, 44); }],
      [150, function () { mv(c, 183, 44, true); del.classList.add('dn'); }],
      [900, function () { mv(c, 183, 44); del.classList.remove('dn'); pop.classList.add('show'); }],
      [800, function () { mv(c, 170, 122); }],
      [150, function () { mv(c, 170, 122, true); ok.classList.add('dn'); }],
      [1300, function () { mv(c, 170, 122); ok.classList.remove('dn'); pop.classList.remove('show'); row.classList.add('gone'); }],
      [600, function () { mv(c, 205, 155); }]
    ], function () { pop.classList.add('show'); mv(c, 170, 122); });
  };
})();
