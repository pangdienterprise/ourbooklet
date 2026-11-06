(function () {
  var book = document.getElementById('book');
  var hint = document.getElementById('hint');
  var music = document.getElementById('music');
  var btn = document.getElementById('musicBtn');
  var leaves = Array.prototype.slice.call(document.querySelectorAll('.leaf'));
  var N = leaves.length;           // 翻页数量
  var step = 0;                    // 已翻过几张
  var userPaused = false;

  var opened = false;              // 礼物是否已拆开
  function hintFor(i) {
    if (i === 0) return '轻触书本打开';
    if (i < N) return '轻触右页翻下一页 · 轻触左页返回';
    return opened ? '轻触左页返回 · 到最后一页了 ♡' : '按住礼物的包装，往任意方向拖开 🎁';
  }

  function render() {
    book.classList.toggle('open', step > 0);
    leaves.forEach(function (l, i) { l.classList.toggle('flipped', i < step); });
    hint.textContent = hintFor(step);
  }
  function go(d) {
    var n = Math.max(0, Math.min(N, step + d));
    if (n === step) return;
    step = n;
    render();
    if (music.paused && !userPaused) play();
  }

  book.addEventListener('click', function (e) {
    var f = e.target.closest('[data-go]');
    if (f) go(f.getAttribute('data-go') === 'next' ? 1 : -1);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });
  var sx = null;
  document.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (dx < -50) go(1); else if (dx > 50) go(-1);
  }, { passive: true });

  /* ---------- 拆礼物 ---------- */
  var wrap = document.getElementById('wrap');
  var box = document.getElementById('giftBox');
  var page = document.getElementById('giftPage');
  var sx0 = 0, sy0 = 0, dx = 0, dy = 0, dragging = false;

  function scaleK() { return box.getBoundingClientRect().width / box.offsetWidth || 1; }
  function put(x, y, z) {
    wrap.style.transform = 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px) rotate(' + (x * 0.05) + 'deg)';
  }
  // 不让拖动触发翻页
  wrap.addEventListener('touchstart', function (e) { e.stopPropagation(); }, { passive: true });
  wrap.addEventListener('touchend', function (e) { e.stopPropagation(); }, { passive: true });
  wrap.addEventListener('click', function (e) { e.stopPropagation(); });

  wrap.addEventListener('pointerdown', function (e) {
    if (opened) return;
    dragging = true; dx = dy = 0; sx0 = e.clientX; sy0 = e.clientY;
    wrap.setPointerCapture(e.pointerId);
    wrap.classList.add('drag');
    wrap.style.transition = 'none';
    if (music.paused && !userPaused) play();
    e.stopPropagation();
  });
  wrap.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var k = scaleK();
    dx = (e.clientX - sx0) / k; dy = (e.clientY - sy0) / k;
    put(dx, dy, 14);
  });
  function release() {
    if (!dragging) return;
    dragging = false;
    wrap.classList.remove('drag');
    var dist = Math.hypot(dx, dy), w = box.offsetWidth;
    if (dist > w * 0.3) {
      var len = dist || 1, ux = dx / len, uy = dy / len;
      wrap.classList.add('released');   // 停掉抖动动画，不然包装纸会弹回原位
      wrap.style.transition = 'transform .7s ease-out, opacity .7s ease-out';
      put(dx + ux * w * 0, dy + uy * w * 0, 14);   // 停在松手的位置，只再滑出一点点
      wrap.style.opacity = '0';
      setTimeout(function () { wrap.style.display = 'none'; }, 750);
      opened = true;
      page.classList.add('opened');
      confetti();
      if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
      render();
    } else {
      wrap.style.transition = 'transform .5s cubic-bezier(.3,1.6,.5,1)';
      wrap.style.transform = '';
    }
  }
  wrap.addEventListener('pointerup', release);
  wrap.addEventListener('pointercancel', release);

  function confetti() {
    var colors = ['#e6c987', '#b5303f', '#fff', '#d98aa0', '#f2a65a'];
    for (var i = 0; i < 26; i++) {
      var p = document.createElement('i');
      var a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 130;
      p.className = 'conf';
      p.style.cssText = 'background:' + colors[i % colors.length] +
        ';--x:' + Math.cos(a) * d + 'px;--y:' + (Math.sin(a) * d - 40) + 'px;--r:' + (Math.random() * 720 - 360) + 'deg';
      box.appendChild(p);
      (function (n) { setTimeout(function () { n.remove(); }, 1500); })(p);
    }
  }

  /* ---------- 音乐 ---------- */
  function setPlaying(on) {
    btn.classList.toggle('playing', on);
    btn.style.opacity = on ? '1' : '.6';
  }
  function play() {
    var p = music.play();
    if (p && p.then) p.then(function () { setPlaying(true); }).catch(function () { setPlaying(false); });
  }
  setPlaying(false);
  play();
  function startOnFirstTouch() {
    if (music.paused && !userPaused) play();
    ['pointerdown', 'touchend', 'click', 'keydown'].forEach(function (e) {
      document.removeEventListener(e, startOnFirstTouch, true);
    });
  }
  ['pointerdown', 'touchend', 'click', 'keydown'].forEach(function (e) {
    document.addEventListener(e, startOnFirstTouch, true);
  });
  btn.addEventListener('click', function () {
    if (music.paused) { userPaused = false; play(); }
    else { userPaused = true; music.pause(); setPlaying(false); }
  });

  render();
})();