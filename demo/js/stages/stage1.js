// 1단계 · 돌아보기
// 직선 l을 위아래로 움직여 원 O와 만나는 점의 개수 확인 → 한 문단 빈칸 4개 단답형(칸마다 바로 채점)
// 끝냄: 직선을 한 번 이상 접하는 위치에 놓기 + 네 칸 모두 정답

Stages[1] = {
  mount: function (area, api) {
    var O = { x: 300, y: 160 }, R = 95;
    var ly = 290;
    var saved = api.answers;
    var touched = !!saved.touched;
    var values = (saved.blanks || ['', '', '', '']).slice();
    var first = saved.first || {};      // 칸마다 처음 채점했을 때 맞았는지 (교사 화면 정답률용)
    var state = ['', '', '', ''];       // 칸마다 'ok' / 'bad' / ''
    var finishing = false;

    var BLANKS = [
      { ok: ['접한다', '접'], cand: ['지난다', '접한다', '만난다'] },
      { ok: ['접선'], cand: ['지름', '할선', '접선'] },
      { ok: ['접점'], cand: ['중심', '접점', '교점'] },
      { ok: ['수직'], cand: ['평행', '수직'] }
    ];
    var NUM = ['①', '②', '③', '④'];

    area.innerHTML =
      '<section class="card">' +
      '  <h2>1단계 · 돌아보기' + (api.review ? ' <span class="muted">(다시 보기)</span>' : '') + '</h2>' +
      '  <p class="muted">직선 l을 오른쪽 파란 손잡이로 위아래로 끌어, 원 O와 만나는 점의 개수를 살펴보세요.</p>' +
      '  <svg class="board" id="s1-svg" viewBox="0 0 600 330"></svg>' +
      '  <div class="status" id="s1-count"></div>' +
      '</section>' +
      '<section class="card">' +
      '  <h3>용어 정리</h3>' +
      '  <p class="para">직선 l이 원 O와 한 점 T에서 만날 때, 직선 l은 원 O에 ' + blank(0) + '라고 한다. ' +
      '이때 직선 l을 원 O의 ' + blank(1) + '이라 하고, 점 T를 ' + blank(2) + '이라고 한다. ' +
      '원의 접선은 접점을 지나는 반지름에 ' + blank(3) + '이다.</p>' +
      '  <div id="s1-hints"></div>' +
      '  <div class="msg" id="s1-msg"></div>' +
      '  <p class="muted" style="margin:6px 0 0;">칸을 다 쓰고 다른 칸을 누르거나 Enter를 치면 바로 확인돼요.</p>' +
      '</section>';

    function blank(i) {
      return '<input type="text" class="blank" data-i="' + i + '" placeholder="' + NUM[i] + '" autocomplete="off">';
    }

    // ---------- 그림 ----------
    var svg = document.getElementById('s1-svg');
    Svg.el('circle', { cx: O.x, cy: O.y, r: R, fill: 'none', stroke: '#1f2328', 'stroke-width': 2 }, svg);
    Svg.el('circle', { cx: O.x, cy: O.y, r: 4, fill: '#1f2328' }, svg);
    Svg.text(svg, O.x + 8, O.y - 8, 'O', 'font-size:17px;');
    var marks = Svg.el('g', {}, svg);
    var line = Svg.el('line', { x1: 60, x2: 540, stroke: '#1f2328', 'stroke-width': 2.5 }, svg);
    var label = Svg.text(svg, 38, 0, 'l', 'font-size:20px;font-style:italic;');
    var grip = Svg.el('circle', { cx: 552, r: 12, fill: '#e8f0fe', stroke: '#2563eb', 'stroke-width': 2 }, svg);
    var hit = Svg.el('line', { x1: 40, x2: 570, stroke: 'transparent', 'stroke-width': 34, style: 'cursor:ns-resize' }, svg);

    function drawLine() {
      [line, hit].forEach(function (e) { Svg.set(e, { y1: ly, y2: ly }); });
      Svg.set(label, { y: ly + 7 });
      Svg.set(grip, { cy: ly });
      marks.innerHTML = '';
      var d = Math.abs(ly - O.y);
      var count = document.getElementById('s1-count');

      if (d > R + 0.01) {
        count.textContent = '만나는 점: 0개 · 만나지 않아요';
        return;
      }
      if (Math.abs(d - R) > 0.01) {
        count.textContent = '만나는 점: 2개 · 두 점에서 만나요';
        var w = Math.sqrt(R * R - d * d);
        [-w, w].forEach(function (dx) { Svg.el('circle', { cx: O.x + dx, cy: ly, r: 5, fill: '#534AB7' }, marks); });
        return;
      }
      // 접할 때: 접점 T, 반지름 OT, 직각 표시
      count.textContent = '만나는 점: 1개 · 한 점에서 만나요 (∠OTl = 90°)';
      var T = { x: O.x, y: ly };
      Svg.el('line', { x1: O.x, y1: O.y, x2: T.x, y2: T.y, stroke: '#D85A30', 'stroke-width': 2.5 }, marks);
      Svg.rightAngle(marks, T, { x: 1, y: 0 }, O, 13, '#D85A30', 2);
      Svg.el('circle', { cx: T.x, cy: T.y, r: 5, fill: '#D85A30' }, marks);
      Svg.text(marks, T.x - 22, ly > O.y ? ly + 24 : ly - 12, 'T', 'font-size:17px;fill:#D85A30;');

      if (!touched) {
        touched = true;
        api.save('touched', true);
        tryFinish();
      }
    }

    Svg.drag(svg, hit, function (p) {
      var y = Math.max(30, Math.min(318, p.y));
      [O.y - R, O.y + R].forEach(function (t) { if (Math.abs(y - t) < 8) y = t; }); // 접하는 위치 가까이면 붙임
      ly = y;
      drawLine();
    });

    // ---------- 빈칸 채점 ----------
    var inputs = area.querySelectorAll('input.blank');

    function norm(s) { return s.replace(/\s/g, ''); }

    function check(i) {
      var v = norm(inputs[i].value);
      values[i] = inputs[i].value;
      if (!v) { state[i] = ''; paint(); return; }
      var ok = BLANKS[i].ok.indexOf(v) >= 0;
      state[i] = ok ? 'ok' : 'bad';
      if (first[i] === undefined) { first[i] = ok; api.save('first', first); }
      api.save('blanks', values);
      paint();
      tryFinish();
    }

    function paint() {
      var hints = '';
      inputs.forEach(function (el, i) {
        el.classList.toggle('ok', state[i] === 'ok');
        el.classList.toggle('bad', state[i] === 'bad');
        if (state[i] === 'bad') {
          hints += '<div class="hintbox bad">' + NUM[i] + ' 다시 생각해보세요. 힌트는 다음 용어 중 하나입니다. <b>' + BLANKS[i].cand.join(' · ') + '</b></div>';
        }
      });
      document.getElementById('s1-hints').innerHTML = hints;
    }

    function allOk() {
      return state.every(function (s) { return s === 'ok'; });
    }

    function tryFinish() {
      var msg = document.getElementById('s1-msg');
      if (!allOk()) { msg.textContent = ''; return; }
      if (!touched) {
        msg.className = 'msg';
        msg.textContent = '모두 맞았어요. 위 그림에서 직선을 원에 접하게도 해 보세요.';
        return;
      }
      msg.className = 'msg ok';
      msg.textContent = '모두 맞았어요.';
      if (!api.review && !finishing) {
        finishing = true;
        setTimeout(api.finish, 1200);
      }
    }

    inputs.forEach(function (el, i) {
      el.value = values[i] || '';
      el.addEventListener('blur', function () { check(i); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(i); } });
      el.addEventListener('input', function () {
        if (state[i] === 'bad') { state[i] = ''; paint(); }
      });
    });

    // 다시 보기·재입장: 저장된 답을 채점된 상태로 보여 줌
    inputs.forEach(function (el, i) {
      var v = norm(el.value);
      if (v) state[i] = BLANKS[i].ok.indexOf(v) >= 0 ? 'ok' : 'bad';
    });
    paint();
    drawLine();
    tryFinish();
  }
};
