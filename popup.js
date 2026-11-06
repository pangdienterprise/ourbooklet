(function () {
  var pop = document.getElementById('popup');
  var img = document.getElementById('popupImg');
  var tTitle = document.getElementById('popupTitle');
  var tDate = document.getElementById('popupDate');
  var tText = document.getElementById('popupText');
  var items = document.querySelectorAll('.timeline li');

  function open(li) {
    img.style.display = '';
    img.src = li.getAttribute('data-photo') || '';
    tTitle.textContent = li.getAttribute('data-title') || '';
    tDate.textContent = li.getAttribute('data-date') || '';
    tText.textContent = li.getAttribute('data-text') || '';
    pop.classList.add('show');
    pop.setAttribute('aria-hidden', 'false');
  }
  function close() {
    pop.classList.remove('show');
    pop.setAttribute('aria-hidden', 'true');
  }

  Array.prototype.forEach.call(items, function (li) {
    // stopPropagation：点时间线不要触发翻页
    li.addEventListener('click', function (e) { e.stopPropagation(); open(li); });
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); open(li); }
    });
  });

  pop.addEventListener('click', function (e) { if (e.target === pop) close(); });
  document.getElementById('popupX').addEventListener('click', close);
  // 弹窗打开时，滑动和方向键不要翻书
  pop.addEventListener('touchstart', function (e) { e.stopPropagation(); }, { passive: true });
  pop.addEventListener('touchend', function (e) { e.stopPropagation(); }, { passive: true });
  document.addEventListener('keydown', function (e) {
    if (!pop.classList.contains('show')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.stopImmediatePropagation();
  }, true);
})();
