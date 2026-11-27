/* Text term demos (set E). Plain browser JS, no deps. */
(function () {
  var D = (window.DEMOS = window.DEMOS || {});
  function RM() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function css(p, txt) {
    var id = 'de-css-' + p;
    if (document.getElementById(id)) return;
    var s = document.createElement('style');
    s.id = id;
    s.textContent = '.' + p + '{position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#111;font-weight:800;letter-spacing:-.02em;text-align:center}' +
      txt + '[data-on="0"]>.' + p + ' *,[data-on="0"]>.' + p + ' *::before,[data-on="0"]>.' + p + ' *::after{animation-play-state:paused!important}' +
      '@media (prefers-reduced-motion: reduce){.' + p + ' *,.' + p + ' *::before,.' + p + ' *::after{animation:none!important;transition:none!important}}';
    document.head.appendChild(s);
  }
  function wrap(el, p, html) {
    var w = document.createElement('div');
    w.className = p;
    w.innerHTML = html || '';
    el.appendChild(w);
    return w;
  }
  // rAF loop: fn(t) runs only while el.dataset.on === '1'; reduced motion draws one still frame.
  function loop(el, fn, still) {
    var last = 0, acc = 0, seen = false;
    if (RM()) { fn(still, true); return; }
    function f(t) {
      if (el.isConnected) seen = true; else if (seen) return;
      var dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;
      if (el.dataset.on === '1') { acc += dt; fn(acc, false); }
      requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function spans(str, cls) {
    return str.split('').map(function (c, i) {
      return '<span class="' + cls + '" style="animation-delay:' + (i * 0.09).toFixed(2) + 's">' + (c === ' ' ? '&nbsp;' : c) + '</span>';
    }).join('');
  }

  /* 1. 스태거텍스트 */
  D['스태거텍스트'] = function (el) {
    css('de-st',
      '.de-st .w{font-size:30px;display:flex}' +
      '.de-st .c{display:inline-block;animation:deStA 2.8s cubic-bezier(.2,.8,.3,1.2) infinite both}' +
      '.de-st .s{margin-top:10px;font-size:12px;font-weight:500;color:#777}' +
      '@keyframes deStA{0%{opacity:0;transform:translateY(26px)}18%,78%{opacity:1;transform:none}92%,100%{opacity:0;transform:translateY(-10px)}}');
    wrap(el, 'de-st', '<div class="w">' + spans('안녕하세요', 'c') + '</div><div class="s">글자마다 0.09초씩 늦게</div>');
  };

  /* 2. 마스크리빌 */
  D['마스크리빌'] = function (el) {
    css('de-mr',
      '.de-mr .m{overflow:hidden;font-size:26px;line-height:1.3}' +
      '.de-mr .m span{display:block;animation:deMrA 3.2s cubic-bezier(.7,0,.2,1) infinite both}' +
      '.de-mr .m:nth-child(2) span{animation-delay:.15s}' +
      '@keyframes deMrA{0%{transform:translateY(110%)}22%,78%{transform:none}96%,100%{transform:translateY(-110%)}}');
    wrap(el, 'de-mr', '<div class="m"><span>보이지 않던</span></div><div class="m"><span>문장이 올라와요</span></div>');
  };

  /* 3. 블러인 */
  D['블러인'] = function (el) {
    css('de-bl',
      '.de-bl .w{font-size:28px;display:flex;gap:8px}' +
      '.de-bl .w span{display:inline-block;animation:deBlA 3s ease-out infinite both}' +
      '.de-bl .w span:nth-child(2){animation-delay:.2s}' +
      '@keyframes deBlA{0%{opacity:0;filter:blur(10px);transform:scale(1.06)}30%,80%{opacity:1;filter:blur(0);transform:none}95%,100%{opacity:0;filter:blur(10px)}}');
    wrap(el, 'de-bl', '<div class="w"><span>선명하게</span><span>등장</span></div>');
  };

  /* 4. 스크램블텍스트 */
  D['스크램블텍스트'] = function (el) {
    css('de-sc',
      '.de-sc .w{font-size:24px;white-space:pre;font-variant-numeric:tabular-nums}' +
      '.de-sc .w i{font-style:normal;color:#9a9a9a}');
    var w = wrap(el, 'de-sc', '<div class="w"></div>').firstChild;
    var target = '디자인 아카이브', pool = '가나다라마바사아자차카타파하#%&@*/<>?', lastTick = -1, html = '';
    loop(el, function (t) {
      var c = t % 3.4, tick = Math.floor(t * 18);
      if (tick === lastTick) return;
      lastTick = tick;
      var n = Math.floor(clamp((c - 0.4) / 1.6) * (target.length + 1)), out = '';
      for (var i = 0; i < target.length; i++) {
        var ch = target[i];
        if (i < n || ch === ' ') out += ch;
        else out += '<i>' + pool[Math.floor(Math.random() * pool.length)] + '</i>';
      }
      if (out !== html) { w.innerHTML = out; html = out; }
    }, 3);
  };

  /* 5. 단어로테이터 */
  D['단어로테이터'] = function (el) {
    css('de-wr',
      '.de-wr .w{font-size:24px;display:flex;align-items:center;gap:7px;line-height:1.4em}' +
      '.de-wr .slot{display:inline-block;height:1.4em;overflow:hidden;padding:0 6px;border-radius:6px;background:#fff;box-shadow:inset 0 -3px 0 #ffd400}' +
      '.de-wr .col{display:block;animation:deWrA 6s cubic-bezier(.7,0,.25,1) infinite}' +
      '.de-wr .col b{display:block;height:1.4em}' +
      '@keyframes deWrA{0%,25%{transform:translateY(0)}33%,58%{transform:translateY(-1.4em)}66%,91%{transform:translateY(-2.8em)}100%{transform:translateY(-4.2em)}}');
    wrap(el, 'de-wr', '<div class="w">오늘은 <span class="slot"><span class="col"><b>산책</b><b>독서</b><b>휴식</b><b>산책</b></span></span> 하는 날</div>');
  };

  /* 6. 스플릿플랩 */
  D['스플릿플랩'] = function (el) {
    css('de-sf',
      '.de-sf .row{display:flex;gap:3px}' +
      '.de-sf .tl{position:relative;width:26px;height:40px;perspective:200px;font-size:22px;color:#fff}' +
      '.de-sf .tl.sp{width:8px}.de-sf .tl.co{width:10px;color:#111;line-height:40px;text-align:center}' +
      '.de-sf .h{position:absolute;left:0;right:0;height:20px;overflow:hidden;background:#1c1c1c;backface-visibility:hidden}' +
      '.de-sf .h b{display:block;height:40px;line-height:40px;text-align:center}' +
      '.de-sf .u{top:0;border-radius:4px 4px 0 0;transform-origin:50% 100%}' +
      '.de-sf .d{top:20px;border-radius:0 0 4px 4px;transform-origin:50% 0;background:#232323}.de-sf .d b{margin-top:-20px}' +
      '.de-sf .f.d{transform:rotateX(90deg)}' +
      '.de-sf .go .f.u{animation:deSfU .11s ease-in forwards}.de-sf .go .f.d{animation:deSfD .11s .11s ease-out both}' +
      '.de-sf .lb{margin-top:10px;font-size:12px;font-weight:600;color:#777}' +
      '@keyframes deSfU{to{transform:rotateX(-90deg)}}@keyframes deSfD{from{transform:rotateX(90deg)}to{transform:rotateX(0)}}');
    var w = wrap(el, 'de-sf', '<div class="row"></div><div class="lb">출발 · DEPARTURES</div>'), row = w.firstChild;
    var targets = ['서울 14:30', '부산 16:05'], tiles = [], KO = '가나다라마바부산서울제주', NUM = '0123456789';
    targets[0].split('').forEach(function (ch, i) {
      var d = document.createElement('div');
      if (ch === ' ') d.className = 'tl sp';
      else if (ch === ':') { d.className = 'tl co'; d.textContent = ':'; }
      else {
        d.className = 'tl';
        d.innerHTML = '<div class="h u"><b></b></div><div class="h d"><b></b></div><div class="h f u"><b></b></div><div class="h f d"><b></b></div>';
        tiles.push({ el: d, i: i, cur: ch, q: [], nt: 0, b: d.querySelectorAll('b') });
      }
      row.appendChild(d);
    });
    function paint(T, next) {
      T.b[0].textContent = next; T.b[1].textContent = T.cur; T.b[2].textContent = T.cur; T.b[3].textContent = next;
      T.el.classList.remove('go'); void T.el.offsetWidth; T.el.classList.add('go');
      T.cur = next;
    }
    tiles.forEach(function (T) { for (var k = 0; k < 4; k++) T.b[k].textContent = T.cur; });
    var cyc = -1;
    loop(el, function (t, still) {
      if (still) return;
      var c = Math.floor(t / 4.5);
      if (c !== cyc) {
        cyc = c;
        var tgt = targets[(c + 1) % 2];
        tiles.forEach(function (T, j) {
          var pool = j < 2 ? KO : NUM, n = 3 + j;
          T.q = [];
          for (var k = 0; k < n; k++) T.q.push(pool[Math.floor(Math.random() * pool.length)]);
          T.q.push(tgt[T.i]); T.nt = t + j * 0.06;
        });
      }
      tiles.forEach(function (T) { if (T.q.length && t >= T.nt) { paint(T, T.q.shift()); T.nt = t + 0.24; } });
    }, 0);
  };

  /* 7. 숫자카운트업 */
  D['숫자카운트업'] = function (el) {
    css('de-cu',
      '.de-cu .n{font-size:38px;font-variant-numeric:tabular-nums;line-height:1}' +
      '.de-cu .n small{font-size:18px;margin-left:3px}' +
      '.de-cu .s{margin-top:10px;font-size:12px;font-weight:600;color:#777}');
    var w = wrap(el, 'de-cu', '<div class="n"><span>0</span><small>명</small></div><div class="s">누적 방문자</div>');
    var num = w.querySelector('span'), END = 12480, prev = -1;
    loop(el, function (t) {
      var p = clamp(((t % 4) - 0.3) / 1.9), e = 1 - Math.pow(1 - p, 3), v = Math.round(END * e);
      if (v !== prev) { num.textContent = String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ','); prev = v; }
    }, 3);
  };

  /* 8. 샤이니텍스트 */
  D['샤이니텍스트'] = function (el) {
    css('de-sh',
      '.de-sh .w{font-size:36px;font-weight:900;color:transparent;-webkit-background-clip:text;background-clip:text;' +
      'background-image:linear-gradient(110deg,#111 0%,#111 42%,#fff 50%,#111 58%,#111 100%);background-size:250% 100%;background-position:100% 0;animation:deShA 2.6s ease-in-out infinite}' +
      '.de-sh .s{margin-top:8px;font-size:12px;font-weight:600;color:#777}' +
      '@keyframes deShA{0%{background-position:100% 0}60%,100%{background-position:0% 0}}');
    wrap(el, 'de-sh', '<div class="w">프리미엄</div><div class="s">빛이 글자 위를 지나가요</div>');
  };

  /* 9. 형광펜 */
  D['형광펜'] = function (el) {
    css('de-hl',
      '.de-hl .w{font-size:24px;line-height:1.45}' +
      '.de-hl mark{color:inherit;padding:0 2px;background:linear-gradient(#ffe14d,#ffe14d) no-repeat 0 88%/100% 48%;animation:deHlA 3.4s cubic-bezier(.6,0,.3,1) infinite}' +
      '@keyframes deHlA{0%,12%{background-size:0% 48%}42%,86%{background-size:100% 48%;opacity:1}96%{background-size:100% 48%;opacity:0}100%{background-size:0% 48%;opacity:0}}');
    wrap(el, 'de-hl', '<div class="w">가장 중요한 건<br><mark>꾸준함</mark>이에요</div>');
  };

  /* 10. 글리치 */
  D['글리치'] = function (el) {
    css('de-gl',
      '.de-gl .g{position:relative;font-size:40px;font-weight:900;animation:deGlS 2.6s steps(1) infinite}' +
      '.de-gl .g::before,.de-gl .g::after{content:attr(data-t);position:absolute;inset:0;opacity:0;mix-blend-mode:multiply}' +
      '.de-gl .g::before{color:#ff2d55;animation:deGlA 2.6s steps(1) infinite}' +
      '.de-gl .g::after{color:#00b8ff;animation:deGlB 2.6s steps(1) infinite}' +
      '@keyframes deGlS{0%,62%,100%{transform:none}64%{transform:translate(-2px,1px) skewX(-6deg)}68%{transform:translate(3px,0)}72%{transform:none}80%{transform:translate(-1px,-1px)}82%{transform:none}}' +
      '@keyframes deGlA{0%,62%,84%,100%{opacity:0;transform:none;clip-path:none}63%{opacity:.9;transform:translate(-4px,0);clip-path:inset(10% 0 55% 0)}67%{opacity:.9;transform:translate(3px,0);clip-path:inset(60% 0 8% 0)}71%{opacity:.9;transform:translate(-2px,0);clip-path:inset(0 0 0 0)}75%{opacity:0}79%{opacity:.9;transform:translate(5px,0);clip-path:inset(35% 0 40% 0)}}' +
      '@keyframes deGlB{0%,62%,84%,100%{opacity:0;transform:none;clip-path:none}63%{opacity:.9;transform:translate(4px,0);clip-path:inset(50% 0 20% 0)}67%{opacity:.9;transform:translate(-3px,0);clip-path:inset(5% 0 70% 0)}71%{opacity:.9;transform:translate(2px,0);clip-path:inset(0 0 0 0)}75%{opacity:0}79%{opacity:.9;transform:translate(-5px,0);clip-path:inset(15% 0 60% 0)}}');
    wrap(el, 'de-gl', '<div class="g" data-t="신호 오류">신호 오류</div>');
  };

  /* 11. 마키 */
  D['마키'] = function (el) {
    css('de-mq',
      '.de-mq{gap:14px}' +
      '.de-mq .r{width:100%;overflow:hidden;white-space:nowrap}' +
      '.de-mq .t{display:inline-flex;animation:deMqA 9s linear infinite}' +
      '.de-mq .t span{padding-right:14px;font-size:26px}' +
      '.de-mq .r2 .t{animation-direction:reverse;animation-duration:12s}' +
      '.de-mq .r2 .t span{font-size:16px;font-weight:600;color:#777}' +
      '@keyframes deMqA{from{transform:translateX(0)}to{transform:translateX(-50%)}}');
    function row(words, cls) {
      var one = words.map(function (x) { return '<span>' + x + '</span>'; }).join('');
      return '<div class="r ' + cls + '"><div class="t">' + one + one + '</div></div>';
    }
    wrap(el, 'de-mq', row(['디자인 ✦', '모션 ✦', '타이포 ✦', '컬러 ✦', '레이아웃 ✦'], 'r1') +
      row(['끊김 없이 흐르는 한 줄 ·', '무한 반복 ·', '끊김 없이 흐르는 한 줄 ·', '무한 반복 ·'], 'r2'));
  };
})();
