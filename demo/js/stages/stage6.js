// 6단계 · 세 변에 접하는 원 찾기
// 5단계 그림 → [삼각형 만들기]로 n을 m까지 늘여 삼각형 ABC (위 A, 왼쪽 B, 오른쪽 C)
// 삼각형 안에 점을 찍으면 세 변까지의 거리 표시 → 세 거리가 같아지는 점 찾기 (판정 범위 좁게: 4 이내)
// 3번 찍은 뒤 [각의 이등분선] 버튼 등장. 찾으면 금색 원·접점·반지름·직각 기호
// 끝냄: 세 변까지 거리가 같은 점을 찾아 원이 나타남

var STAGE6_TOL = 4;   // 판정 범위 (그림 좌표). 실제 수업 기기에서 시험해 보고 조정

Stages[6] = {
  mount: function (area, api) {
    var F = STAGE5_FIG, T = { A: F.A, B: F.B, C: F.C };
    var I = Geo.incenter(T.A, T.B, T.C);
    var saved = api.answers;
    var made = !!saved.made, found = !!saved.found;
    var tries = saved.tries || 0;
    var bis = (saved.bis || []).slice();
    var P = found ? I : null;
    var bmode = false, finishing = false;
    var SIDES = [['B', 'C'], ['C', 'A'], ['A', 'B']], OPP = { A: ['B', 'C'], B: ['C', 'A'], C: ['A', 'B'] }, SN = { BC: 'm', CA: 'n', AB: 'l' };

    area.innerHTML =
      '<section class="card">' +
      '  <h2>6단계 · 세 변에 접하는 원 찾기' + (api.review ? ' <span class="muted">(다시 보기)</span>' : '') + '</h2>' +
      '  <div class="notice-blue" id="s6-msg"></div>' +
      '  <div class="row" style="margin:8px 0;">' +
      '    <button class="btn primary" id="s6-make">🔺 삼각형 만들기</button>' +
      '    <button class="btn hidden" id="s6-bis">📐 각의 이등분선</button>' +
      '  </div>' +
      '  <svg class="board" id="s6-svg" viewBox="0 0 600 420"></svg>' +
      '  <div class="status" id="s6-st"></div>' +
      '</section>';

    var svg = document.getElementById('s6-svg');
    var st = document.getElementById('s6-st');
    var msg = document.getElementById('s6-msg');
    var bb = document.getElementById('s6-bis');
    var mk = document.getElementById('s6-make');
    var bg = Svg.el('rect', { x: 0, y: 0, width: 600, height: 420, fill: 'transparent' }, svg);
    var pre = Svg.el('g', { style: 'pointer-events:none' }, svg);
    var g = Svg.el('g', { style: 'pointer-events:none' }, svg);
    var vh = Svg.el('g', {}, svg);

    function lerp(p, q, t) { return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t }; }
    function inr() { return Geo.distToLine(I, T.B, T.C); }

    // 5단계 그림 (n이 m까지 닿지 않은 상태 → 늘어나는 장면)
    function drawPre(kn, km, gold) {
      pre.innerHTML = '';
      var nE = lerp(T.A, T.C, kn), mE = lerp(T.B, T.C, km);
      Svg.el('line', { x1: T.B.x, y1: T.B.y, x2: T.A.x, y2: T.A.y, stroke: '#1f2328', 'stroke-width': 3 }, pre);
      Svg.el('line', { x1: T.B.x, y1: T.B.y, x2: mE.x, y2: mE.y, stroke: '#1f2328', 'stroke-width': 3 }, pre);
      Svg.el('line', { x1: T.A.x, y1: T.A.y, x2: nE.x, y2: nE.y, stroke: kn > 0.82 ? '#2563eb' : '#1f2328', 'stroke-width': kn > 0.82 ? 4 : 3 }, pre);
      if (gold > 0) Svg.el('circle', { cx: I.x, cy: I.y, r: inr(), fill: '#FAC775', 'fill-opacity': 0.35 * gold, stroke: '#854F0B', 'stroke-opacity': gold, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, pre);
      Svg.text(pre, 190, 185, 'l', 'font-size:22px;font-style:italic;');
      Svg.text(pre, 330, 392, 'm', 'font-size:22px;font-style:italic;');
      Svg.text(pre, 478, 250, 'n', 'font-size:22px;font-style:italic;');
    }

    function inside(p) {
      function cr(o, a, b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
      var s1 = cr(T.A, T.B, p), s2 = cr(T.B, T.C, p), s3 = cr(T.C, T.A, p);
      return (s1 > 0 && s2 > 0 && s3 > 0) || (s1 < 0 && s2 < 0 && s3 < 0);
    }

    function render() {
      g.innerHTML = '';
      vh.innerHTML = '';
      if (!made) return;
      var A = T.A, B = T.B, C = T.C;
      Svg.el('polygon', { points: [A, B, C].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: 'none', stroke: '#1f2328', 'stroke-width': 3 }, g);
      Object.keys(T).forEach(function (k) {
        var p = T[k];
        Svg.text(g, p.x + (p.x - I.x) * 0.08 - 7, p.y + (p.y - I.y) * 0.08 + 7, k, 'font-size:19px;font-weight:700;');
        Svg.el('circle', { cx: p.x, cy: p.y, r: 5, fill: '#1f2328' }, g);
        var h = Svg.el('circle', { cx: p.x, cy: p.y, r: 22, fill: 'transparent', style: 'cursor:' + (bmode ? 'pointer' : 'default') + ';pointer-events:' + (bmode ? 'auto' : 'none') }, vh);
        h.addEventListener('click', function () { if (bmode) { addBis(k); } });
      });
      SIDES.forEach(function (s) {
        var X = T[s[0]], Y = T[s[1]], m = { x: (X.x + Y.x) / 2, y: (X.y + Y.y) / 2 }, o = Geo.unit({ x: m.x - I.x, y: m.y - I.y });
        Svg.text(g, m.x + o.x * 20 - 5, m.y + o.y * 20 + 6, SN[s[0] + s[1]], 'font-size:16px;font-style:italic;fill:#9aa1ab;');
      });
      bis.forEach(function (k) {
        var X = T[k], Y = T[OPP[k][0]], Z = T[OPP[k][1]], r = Geo.dist(X, Y) / (Geo.dist(X, Y) + Geo.dist(X, Z));
        var E = lerp(Y, Z, r);
        Svg.el('line', { x1: X.x, y1: X.y, x2: E.x, y2: E.y, stroke: '#2563eb', 'stroke-width': 1.8, 'stroke-dasharray': '7 5' }, g);
      });
      if (!P) return;

      var fs = SIDES.map(function (s) { var f = Geo.foot(P, T[s[0]], T[s[1]]); f.along = Geo.unit({ x: T[s[1]].x - T[s[0]].x, y: T[s[1]].y - T[s[0]].y }); return f; });
      var ds = fs.map(function (f) { return Geo.dist(P, f); });
      if (found) Svg.el('circle', { cx: I.x, cy: I.y, r: ds[0], fill: '#FAC775', 'fill-opacity': 0.45, stroke: '#854F0B', 'stroke-width': 2.5 }, g);
      fs.forEach(function (f, i) {
        Svg.el('line', { x1: P.x, y1: P.y, x2: f.x, y2: f.y, stroke: found ? '#854F0B' : '#D85A30', 'stroke-width': found ? 2.5 : 1.8, 'stroke-dasharray': found ? '' : '5 4' }, g);
        if (found) Svg.rightAngle(g, f, f.along, P, 13, '#A32D2D', 2.2);
        Svg.el('circle', { cx: f.x, cy: f.y, r: 4.5, fill: '#D85A30' }, g);
        if (!found) Svg.text(g, (P.x + f.x) / 2 + 7, (P.y + f.y) / 2 - 5, (ds[i] / 40).toFixed(1), 'font-size:14px;font-weight:700;fill:#993C1D;');
      });
      Svg.el('circle', { cx: P.x, cy: P.y, r: found ? 6 : 4, fill: found ? '#854F0B' : '#534AB7' }, g);
      if (found) {
        Svg.text(g, P.x + 9, P.y - 9, 'I', 'font-size:18px;font-weight:700;fill:#854F0B;');
        st.textContent = '세 변까지의 거리가 모두 같은 점을 찾았어요.';
      } else {
        st.textContent = '세 변까지의 거리: ' + ds.map(function (x) { return (x / 40).toFixed(1); }).join(', ') + ' — 모두 같아지는 점을 찾아보세요.' + (tries >= 3 ? ' 5단계에서 썼던 [각의 이등분선]을 써 볼까요?' : '');
      }
    }

    function addBis(k) {
      if (bis.indexOf(k) < 0) bis.push(k);
      api.save('bis', bis);
      bmode = false;
      bb.classList.remove('active');
      render();
    }

    function afterMade() {
      mk.classList.add('hidden');
      msg.textContent = "세 직선 l, m, n으로 둘러싸인 도형이 삼각형 ABC예요. 이제부터 세 직선을 삼각형의 '세 변'이라고 불러요.";
      if (tries >= 3) bb.classList.remove('hidden');
      render();
      if (!P) st.textContent = '세 변까지의 거리가 모두 같을 것 같은 점을 삼각형 안에 찍어 보세요.';
    }

    mk.onclick = function () {
      if (made) return;
      mk.disabled = true;
      var t0 = performance.now();
      function step(t) {
        var k = Math.min(1, (t - t0) / 1100);
        drawPre(0.82 + 0.18 * k, 1.08 - 0.08 * k, 1 - k);
        if (k < 1) { requestAnimationFrame(step); return; }
        pre.innerHTML = '';
        made = true;
        api.save('made', true);
        afterMade();
      }
      requestAnimationFrame(step);
    };

    bg.addEventListener('click', function (e) {
      if (!made || found || bmode) return;
      var p = Svg.point(svg, e);
      if (!inside(p)) { st.textContent = '삼각형 안에 점을 찍어 보세요.'; return; }
      tries += 1;
      api.save('tries', tries);
      if (tries >= 3) bb.classList.remove('hidden');
      if (Geo.dist(p, I) < STAGE6_TOL) {
        P = I;
        found = true;
        api.save('found', true);
        render();
        if (!api.review && !finishing) { finishing = true; setTimeout(api.finish, 1800); }
      } else {
        P = p;
        render();
      }
    });

    bb.onclick = function () {
      bmode = true;
      bb.classList.add('active');
      render();
      st.textContent = '이등분선을 그을 각의 꼭짓점을 골라 보세요.';
    };

    if (made) afterMade();
    else {
      drawPre(0.82, 1.08, 1);
      msg.textContent = '5단계에서 만든 그림이에요. 직선 n을 m까지 늘이면 어떤 도형이 될까요?';
      st.textContent = '[삼각형 만들기]를 눌러 보세요.';
    }
  }
};
