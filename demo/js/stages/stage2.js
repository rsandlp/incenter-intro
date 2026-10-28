// 2단계 · 한 직선에 접하는 원
// 원의 중심이 될 점 찍기 → 직선 l 누르기 → 반지름이 내려오고 원이 그려짐 (최대 5개)
// 질문: 최대 몇 개까지? (1개 / 5개 / 무수히 많다) + 이유, 정답 판정 없음
// 끝냄: 원 5개 모두 그리기 + 제출

Stages[2] = {
  mount: function (area, api) {
    var LY = 160, MAX = 5;
    var saved = api.answers;
    var circles = (saved.circles || []).slice();
    var submitted = !!saved.submitted;
    var pending = null;
    var busy = false;
    var finishing = false;

    area.innerHTML =
      '<section class="card">' +
      '  <div class="row" style="justify-content:space-between;">' +
      '    <h2 style="margin:0;">2단계 · 한 직선에 접하는 원' + (api.review ? ' <span class="muted">(다시 보기)</span>' : '') + '</h2>' +
      '    <span class="counter" id="s2-cnt"></span>' +
      '  </div>' +
      '  <p class="muted">원의 중심이 될 점을 찍은 뒤, 직선 l을 눌러 보세요. 그 점을 중심으로 직선 l에 접하는 원이 그려져요.</p>' +
      '  <svg class="board" id="s2-svg" viewBox="0 0 600 320"></svg>' +
      '  <div class="status" id="s2-st"></div>' +
      '</section>' +
      '<section class="card" id="s2-q">' +
      '  <p style="margin-top:0;">주어진 한 직선에 접하는 원은 최대 몇 개까지 그릴 수 있을까요?</p>' +
      '  <div class="row" id="s2-choices">' +
      '    <label class="choice"><input type="radio" name="s2" value="1개"> 1개</label>' +
      '    <label class="choice"><input type="radio" name="s2" value="5개"> 5개</label>' +
      '    <label class="choice"><input type="radio" name="s2" value="무수히 많다"> 무수히 많다</label>' +
      '  </div>' +
      '  <div class="field" style="margin-top:10px;"><label for="s2-why">그렇게 생각한 이유</label>' +
      '    <textarea id="s2-why" placeholder="원을 그려 보며 알게 된 것을 적어 보세요"></textarea></div>' +
      '  <div class="row"><button class="btn primary" id="s2-go">제출하기</button><span class="msg" id="s2-msg"></span></div>' +
      '</section>';

    var svg = document.getElementById('s2-svg');
    var st = document.getElementById('s2-st');
    var bg = Svg.el('rect', { x: 0, y: 0, width: 600, height: 320, fill: 'transparent' }, svg);
    var cg = Svg.el('g', { style: 'pointer-events:none' }, svg);
    Svg.el('line', { x1: 30, y1: LY, x2: 570, y2: LY, stroke: '#1f2328', 'stroke-width': 2.5, style: 'pointer-events:none' }, svg);
    Svg.text(svg, 10, LY + 7, 'l', 'font-size:20px;font-style:italic;pointer-events:none;');
    var lineHit = Svg.el('line', { x1: 30, y1: LY, x2: 570, y2: LY, stroke: 'transparent', 'stroke-width': 30, style: 'cursor:pointer' }, svg);
    var pg = Svg.el('g', { style: 'pointer-events:none' }, svg);

    function say(text, warn) {
      st.textContent = text;
      st.classList.toggle('bad', !!warn);
    }

    function updateCount() {
      document.getElementById('s2-cnt').textContent = '그린 원 ' + circles.length + ' / ' + MAX;
    }

    function full() {
      say('아래 질문에 답하시오.', true);
      document.getElementById('s2-q').classList.add('focus');
    }

    // 원 하나 그리기 (animate: 반지름 → 원이 한 바퀴)
    function drawCircle(c, animate, done) {
      var r = Math.abs(c.y - LY), s = c.y < LY ? 1 : -1;
      var foot = { x: c.x, y: LY };
      var g = Svg.el('g', {}, cg);
      var path = Svg.el('path', {
        d: 'M' + c.x + ' ' + LY + ' a' + r + ' ' + r + ' 0 1 1 0 ' + (-2 * r * s) + ' a' + r + ' ' + r + ' 0 1 1 0 ' + (2 * r * s),
        fill: '#E1F5EE', 'fill-opacity': animate ? 0 : 0.6, stroke: '#0F6E56', 'stroke-width': 2
      }, g);
      var rad = Svg.el('line', { x1: c.x, y1: c.y, x2: c.x, y2: animate ? c.y : LY, stroke: '#D85A30', 'stroke-width': 2 }, g);
      var sq = Svg.rightAngle(g, foot, { x: 1, y: 0 }, c, 9, '#D85A30');
      Svg.el('circle', { cx: c.x, cy: c.y, r: 4, fill: '#0F6E56' }, g);
      var dot = Svg.el('circle', { cx: c.x, cy: LY, r: 4, fill: '#D85A30', opacity: animate ? 0 : 1 }, g);
      if (!animate) return;

      var L = 2 * Math.PI * r;
      Svg.set(path, { 'stroke-dasharray': L, 'stroke-dashoffset': L });
      sq.setAttribute('opacity', 0);
      var t0 = performance.now();
      function step(t) {
        var k = (t - t0) / 900;
        Svg.set(rad, { y2: c.y + (LY - c.y) * Math.min(1, k / 0.35) });
        if (k > 0.35) {
          var b = Math.min(1, (k - 0.35) / 0.65);
          Svg.set(path, { 'stroke-dashoffset': L * (1 - b), 'fill-opacity': 0.6 * b });
          sq.setAttribute('opacity', b);
        }
        if (k < 1) requestAnimationFrame(step);
        else { dot.setAttribute('opacity', 1); done(); }
      }
      requestAnimationFrame(step);
    }

    function afterDraw() {
      updateCount();
      var oneSide = circles.length >= 2 && (circles.every(function (q) { return q.y < LY; }) || circles.every(function (q) { return q.y > LY; }));
      if (circles.length >= MAX) say('원 5개를 모두 그렸어요. 아래 질문에 답해 보세요.');
      else say('원의 중심이 될 점을 또 찍어 보세요.' + (oneSide ? ' 직선의 반대쪽은 어떨까요?' : ''));
      tryFinish();
    }

    bg.addEventListener('click', function (e) {
      if (busy) return;
      if (circles.length >= MAX) { full(); return; }
      var p = Svg.point(svg, e);
      if (Math.abs(p.y - LY) < 12) { say('직선에서 조금 떨어진 곳에 중심을 찍어 보세요.'); return; }
      if (p.x < 50 || p.x > 550) { say('조금 더 안쪽에 찍어 보세요.'); return; }
      pending = p;
      pg.innerHTML = '';
      Svg.el('circle', { cx: p.x, cy: p.y, r: 7, fill: '#2563eb' }, pg);
      say('이제 직선 l을 눌러 보세요.');
    });

    lineHit.addEventListener('click', function () {
      if (busy) return;
      if (circles.length >= MAX) { full(); return; }
      if (!pending) { say('먼저 원의 중심이 될 점을 찍어 보세요.'); return; }
      var c = { x: Math.round(pending.x), y: Math.round(pending.y) };
      pending = null;
      pg.innerHTML = '';
      busy = true;
      drawCircle(c, true, function () {
        busy = false;
        circles.push(c);
        api.save('circles', circles);
        afterDraw();
      });
    });

    // ---------- 질문 ----------
    var why = document.getElementById('s2-why');
    var radios = area.querySelectorAll('input[name=s2]');
    radios.forEach(function (r) { r.checked = r.value === saved.choice; });
    why.value = saved.why || '';

    function tryFinish() {
      if (submitted && circles.length >= MAX && !api.review && !finishing) {
        finishing = true;
        setTimeout(api.finish, 1200);
      }
    }

    document.getElementById('s2-go').onclick = function () {
      var picked = area.querySelector('input[name=s2]:checked');
      var msg = document.getElementById('s2-msg');
      if (!picked || !why.value.trim()) {
        msg.className = 'msg bad';
        msg.textContent = '답과 이유를 모두 적어 주세요.';
        return;
      }
      if (saved.first === undefined) { saved.first = picked.value; api.save('first', picked.value); }
      api.save('choice', picked.value);
      api.save('why', why.value.trim());
      api.save('submitted', true);
      submitted = true;
      msg.className = 'msg ok';
      msg.textContent = circles.length >= MAX ? '제출했어요. 선생님 화면으로 전달됐어요.' : '제출했어요. 원 5개를 모두 그려 보세요.';
      tryFinish();
    };
    [why].concat([].slice.call(radios)).forEach(function (el) {
      el.addEventListener('input', function () { document.getElementById('s2-msg').textContent = ''; });
    });

    // 다시 보기·재입장: 그린 원 그대로 보여 줌
    circles.forEach(function (c) { drawCircle(c, false); });
    updateCount();
    say(circles.length ? (circles.length >= MAX ? '원 5개를 모두 그렸어요.' : '원의 중심이 될 점을 또 찍어 보세요.') : '원의 중심이 될 점을 찍어 보세요.');
    tryFinish();
  }
};
