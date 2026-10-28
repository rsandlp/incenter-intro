// 4단계 · 또 다른 원 그리기
// [선 긋기]로 3단계 원들의 중심을 이음 → 두 각 크기 자동 표시(이등분선 확인)
// [원 그리기]: 이등분선 위에 중심 찍기 → 손잡이로 반지름 조절 → 수선의 발 P, Q에 닿으면 접함
// 발문은 차례로: 원이 처음 접함 → 발문 1(고르기) → 정답 → 발문 2(서술) → 제출하면 끝냄

Stages[4] = {
  mount: function (area, api) {
    var G = STAGE3_RAYS, V = G.V, D1 = G.dirs[0], D2 = G.dirs[1], S = Math.sin(G.half);
    var saved = api.answers;
    var pts = [V].concat(G.radii.map(function (r) { return { x: V.x + G.bis.x * r / S, y: V.y + G.bis.y * r / S, r: r }; }));
    var mode = '', sel = [];
    var lineDir = saved.lineDrawn ? G.bis : null;
    var circles = (saved.circles || []).slice();
    var q1open = !!saved.q1open, q1ok = !!saved.q1ok;
    var finishing = false;

    area.innerHTML =
      '<section class="card">' +
      '  <h2>4단계 · 또 다른 원 그리기' + (api.review ? ' <span class="muted">(다시 보기)</span>' : '') + '</h2>' +
      '  <div class="row" style="margin-bottom:6px;">' +
      '    <button class="btn" id="s4-line">📏 선 긋기</button>' +
      '    <button class="btn" id="s4-circle">⭕ 원 그리기</button>' +
      '  </div>' +
      '  <svg class="board" id="s4-svg" viewBox="0 0 600 300"></svg>' +
      '  <div class="status" id="s4-st"></div>' +
      '</section>' +
      '<section class="card hidden" id="s4-q1">' +
      '  <p class="para" style="margin:0;"><b>발문 1</b> 원이 두 반직선에 접할 때, 원의 반지름의 길이는 원의 중심에서 ' +
      '  <select id="s4-sel"><option value="">선택</option><option>꼭짓점</option><option>수선의 발 P, Q</option><option>다른 원의 중심</option></select>' +
      '  까지의 거리와 같다.</p>' +
      '  <div class="row"><button class="btn primary" id="s4-ck">확인하기</button><span class="msg" id="s4-m1"></span></div>' +
      '</section>' +
      '<section class="card hidden" id="s4-q2">' +
      '  <p style="margin-top:0;"><b>발문 2</b> 두 반직선 l, m에 동시에 접하는 또 다른 원을 그리려면 어떻게 하면 될까요?</p>' +
      '  <textarea id="s4-ans" placeholder="원의 중심과 반지름을 어떻게 정해야 하는지 적어 보세요"></textarea>' +
      '  <div class="row" style="margin-top:6px;"><button class="btn primary" id="s4-go">제출하기</button><span class="msg" id="s4-m2"></span></div>' +
      '</section>';

    var svg = document.getElementById('s4-svg');
    var st = document.getElementById('s4-st');
    var bg = Svg.el('rect', { x: 0, y: 0, width: 600, height: 300, fill: 'transparent' }, svg);
    var base = Svg.el('g', { style: 'pointer-events:none' }, svg);
    var lg = Svg.el('g', { style: 'pointer-events:none' }, svg);
    var ag = Svg.el('g', { style: 'pointer-events:none' }, svg);
    var cg = Svg.el('g', { style: 'pointer-events:none' }, svg);
    var pg = Svg.el('g', {}, svg);
    var hd = Svg.el('circle', { r: 11, fill: '#e8f0fe', stroke: '#2563eb', 'stroke-width': 2, style: 'pointer-events:none;display:none' }, svg);
    var hh = Svg.el('circle', { r: 24, fill: 'transparent', style: 'cursor:grab;display:none' }, svg);

    function say(t) { st.textContent = t; }
    function crs(p, d) { return (p.x - V.x) * d.y - (p.y - V.y) * d.x; }
    function footOn(c, d) { var t = (c.x - V.x) * d.x + (c.y - V.y) * d.y; return { x: V.x + t * d.x, y: V.y + t * d.y }; }

    // 두 반직선과 3단계 원들(흐린 점선)
    Svg.el('line', { x1: V.x, y1: V.y, x2: 562, y2: 27, stroke: '#1f2328', 'stroke-width': 2.5 }, base);
    Svg.el('line', { x1: V.x, y1: V.y, x2: 587, y2: 258, stroke: '#1f2328', 'stroke-width': 2.5 }, base);
    Svg.text(base, 568, 32, 'l', 'font-size:20px;font-style:italic;');
    Svg.text(base, 593, 276, 'm', 'font-size:20px;font-style:italic;');
    pts.slice(1).forEach(function (p) {
      Svg.el('circle', { cx: p.x, cy: p.y, r: p.r, fill: 'none', stroke: '#c4c9d1', 'stroke-dasharray': '4 4' }, base);
    });

    function drawPts() {
      pg.innerHTML = '';
      pts.forEach(function (p, i) {
        var on = sel.indexOf(i) >= 0;
        Svg.el('circle', { cx: p.x, cy: p.y, r: on ? 8 : 5, fill: on ? '#2563eb' : '#7F77DD', style: 'pointer-events:none' }, pg);
        var h = Svg.el('circle', { cx: p.x, cy: p.y, r: 16, fill: 'transparent', style: 'cursor:' + (mode === 'line' ? 'pointer' : 'default') + ';pointer-events:' + (mode === 'line' ? 'auto' : 'none') }, pg);
        h.addEventListener('click', function () { pick(i); });
      });
    }

    function drawLineAndAngles() {
      lg.innerHTML = '';
      ag.innerHTML = '';
      if (!lineDir) return;
      var u = lineDir;
      Svg.el('line', { x1: V.x, y1: V.y, x2: V.x + u.x * 620, y2: V.y + u.y * 620, stroke: '#2563eb', 'stroke-width': 2 }, lg);
      var R = Math.PI / 180;
      var a = Math.atan2(u.y, u.x) / R, al = Math.atan2(D1.y, D1.x) / R, am = Math.atan2(D2.y, D2.x) / R;
      [[al, a, 70, '#D85A30'], [a, am, 90, '#1D9E75']].forEach(function (x) {
        var r = x[2];
        Svg.el('path', {
          d: 'M' + (V.x + r * Math.cos(x[0] * R)) + ' ' + (V.y + r * Math.sin(x[0] * R)) + ' A' + r + ' ' + r + ' 0 0 1 ' + (V.x + r * Math.cos(x[1] * R)) + ' ' + (V.y + r * Math.sin(x[1] * R)),
          fill: 'none', stroke: x[3], 'stroke-width': 2.5
        }, ag);
        var m = (x[0] + x[1]) / 2 * R;
        Svg.text(ag, V.x + (r + 32) * Math.cos(m) - 9, V.y + (r + 32) * Math.sin(m) + 5, Math.round(x[1] - x[0]) + '°', 'font-size:14px;font-weight:700;fill:' + x[3]);
      });
    }

    function pick(i) {
      if (mode !== 'line' || sel.indexOf(i) >= 0) return;
      sel.push(i);
      drawPts();
      if (sel.length < 2) { say('한 점을 더 골라 보세요.'); return; }
      var P = pts[sel[0]], Q = pts[sel[1]];
      var u = Geo.unit({ x: Q.x - P.x, y: Q.y - P.y });
      if (u.x < 0) u = { x: -u.x, y: -u.y };
      lineDir = u;
      mode = '';
      sel = [];
      api.save('lineDrawn', true);
      drawPts();
      drawLineAndAngles();
      say('두 각이 같아요. 이 선이 각의 이등분선이에요. [원 그리기]를 누르고 이 선 위에 원의 중심을 찍어 보세요.');
    }

    function isTangent(c) { return Math.abs(c.r - Math.abs(crs(c, D1))) < 0.01; }

    function drawCircles() {
      cg.innerHTML = '';
      circles.forEach(function (c, i) {
        var act = i === circles.length - 1, ok = isTangent(c);
        Svg.el('circle', { cx: c.x, cy: c.y, r: c.r, fill: ok ? '#E1F5EE' : '#EEEDFE', 'fill-opacity': act ? 0.75 : 0.35, stroke: ok ? '#0F6E56' : '#534AB7', 'stroke-width': act ? 2 : 1 }, cg);
        if (act) {
          [[footOn(c, D1), 'P', D1], [footOn(c, D2), 'Q', D2]].forEach(function (f) {
            Svg.el('line', { x1: c.x, y1: c.y, x2: f[0].x, y2: f[0].y, stroke: ok ? '#D85A30' : '#6b7280', 'stroke-width': ok ? 2.2 : 1.3, 'stroke-dasharray': ok ? '' : '4 3' }, cg);
            Svg.el('circle', { cx: f[0].x, cy: f[0].y, r: 4, fill: '#D85A30' }, cg);
            Svg.rightAngle(cg, f[0], f[2], c, 9, ok ? '#D85A30' : '#6b7280', ok ? 2 : 1.3);
            var n = Geo.unit({ x: f[0].x - c.x, y: f[0].y - c.y });
            Svg.text(cg, f[0].x + n.x * 15 - 5, f[0].y + n.y * 15 + 6, f[1], 'font-size:15px;font-weight:700;fill:#993C1D;');
          });
        }
        Svg.el('circle', { cx: c.x, cy: c.y, r: 4.5, fill: ok ? '#0F6E56' : '#534AB7' }, cg);
      });
      var c = circles[circles.length - 1];
      if (!c) { hd.style.display = 'none'; hh.style.display = 'none'; return; }
      Svg.set(hd, { cx: c.x + c.r, cy: c.y });
      Svg.set(hh, { cx: c.x + c.r, cy: c.y });
      hd.style.display = '';
      hh.style.display = '';
      var d = Math.abs(crs(c, D1));
      if (isTangent(c)) {
        say('두 반직선에 접했어요. 접점이 어디에 있는지 보고, 아래 발문 1에 답해 보세요.');
        if (!q1open) { q1open = true; api.save('q1open', true); showQuestions(); }
      } else {
        say('반지름: ' + (c.r / 40).toFixed(1) + ' · ' + (c.r < d ? '아직 두 반직선에 닿지 않아요. 손잡이를 끌어 키워 보세요.' : '두 반직선을 넘어갔어요. 줄여 보세요.'));
      }
    }

    function saveCircles() {
      api.save('circles', circles.map(function (c) { return { x: c.x, y: c.y, r: c.r }; }));
    }

    bg.addEventListener('click', function (e) {
      if (mode !== 'circle') return;
      var p = Svg.point(svg, e), u = lineDir;
      var s = (p.x - V.x) * u.x + (p.y - V.y) * u.y;
      var off = Math.abs((p.x - V.x) * u.y - (p.y - V.y) * u.x);
      if (off > 16 || s < 20) { say('원의 중심은 파란 이등분선 위에 찍어 보세요.'); return; }
      circles.push({ x: V.x + s * u.x, y: V.y + s * u.y, r: 12 });
      if (circles.length > 3) circles.shift();
      saveCircles();
      drawCircles();
    });

    Svg.drag(svg, hh, function (p) {
      var c = circles[circles.length - 1], d = Math.abs(crs(c, D1));
      var r = Math.max(6, Math.min(220, Geo.dist(p, c)));
      if (Math.abs(r - d) < 6) r = d;   // 수선의 발 가까이 오면 붙음
      c.r = r;
      drawCircles();
    }, saveCircles);

    document.getElementById('s4-line').onclick = function () {
      mode = 'line';
      sel = [];
      drawPts();
      say('첫 번째 점을 골라 보세요. (원의 중심 또는 꼭짓점)');
    };
    document.getElementById('s4-circle').onclick = function () {
      if (!lineDir) { say('먼저 [선 긋기]로 중심들을 잇는 선을 그어 보세요.'); return; }
      mode = 'circle';
      drawPts();
      say('파란 선 위에 원의 중심을 찍어 보세요.');
    };

    // ---------- 발문 ----------
    var sel1 = document.getElementById('s4-sel');
    var ans = document.getElementById('s4-ans');

    function showQuestions() {
      document.getElementById('s4-q1').classList.toggle('hidden', !q1open);
      document.getElementById('s4-q2').classList.toggle('hidden', !q1ok);
      if (q1ok) {
        sel1.value = '수선의 발 P, Q';
        sel1.disabled = true;
        sel1.classList.add('ok');
      }
    }

    sel1.addEventListener('change', function () {
      sel1.classList.remove('bad');
      document.getElementById('s4-m1').textContent = '';
    });

    document.getElementById('s4-ck').onclick = function () {
      var m = document.getElementById('s4-m1');
      if (q1ok) return;
      if (!sel1.value) { sel1.classList.add('bad'); m.className = 'msg bad'; m.textContent = '먼저 골라 주세요.'; return; }
      var ok = sel1.value === '수선의 발 P, Q';
      if (saved.q1first === undefined) { saved.q1first = sel1.value; api.save('q1first', sel1.value); }
      sel1.classList.toggle('ok', ok);
      sel1.classList.toggle('bad', !ok);
      m.className = 'msg ' + (ok ? 'ok' : 'bad');
      m.textContent = ok ? '맞아요. 접점이 곧 수선의 발이에요. (1단계: 접선 ⟂ 반지름)' : '원이 접할 때 반지름이 끝나는 점을 그림에서 찾아보세요.';
      if (ok) { q1ok = true; api.save('q1ok', true); showQuestions(); }
    };

    ans.value = saved.q2 || '';
    ans.addEventListener('input', function () { ans.classList.remove('bad'); document.getElementById('s4-m2').textContent = ''; });

    document.getElementById('s4-go').onclick = function () {
      var m = document.getElementById('s4-m2');
      var v = ans.value.trim();
      if (!v) { ans.classList.add('bad'); m.className = 'msg bad'; m.textContent = '답을 먼저 적어 주세요.'; return; }
      api.save('q2', v);
      m.className = 'msg ok';
      m.textContent = '제출했어요. 선생님 화면으로 전달됐어요.';
      if (!api.review && !finishing) { finishing = true; setTimeout(api.finish, 1200); }
    };

    drawPts();
    drawLineAndAngles();
    drawCircles();
    showQuestions();
    if (!circles.length) say(lineDir ? '[원 그리기]를 누르고 파란 선 위에 원의 중심을 찍어 보세요.' : '3단계에서 놓은 원들이에요. [선 긋기]를 누르고 중심 두 개를 골라 보세요.');
  }
};
