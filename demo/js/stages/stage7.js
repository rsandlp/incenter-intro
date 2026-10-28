// 7단계 · 내접원과 내심
// ① 정의 시뮬레이션 4장([다음]) ② 꼭짓점을 끌어 예각·직각·둔각삼각형에서 내심·내접원이 항상 있는지 확인
// 끝냄: 4장 넘기기 + 세 종류 삼각형 모두 확인 (끝낸 뒤 대기 화면에는 8단계 연결 멘트)

Stages[7] = {
  mount: function (area, api) {
    var F = STAGE5_FIG;
    var T = { A: { x: F.A.x, y: F.A.y }, B: { x: F.B.x, y: F.B.y }, C: { x: F.C.x, y: F.C.y } };
    var saved = api.answers;
    var frame = saved.frame || 0;
    var phase = saved.phase || 'def';
    var seen = (saved.seen || [false, false, false]).slice();
    var finishing = false;
    var FRAMES = [
      '이 원은 삼각형 ABC의 세 변에 모두 접해요. 세 접점을 보세요.',
      '삼각형의 세 변에 모두 접하는 원을 그 삼각형의 <b>내접원</b>이라고 해요.',
      '내접원의 중심 I를 그 삼각형의 <b>내심</b>이라고 해요. 반지름은 각 변과 수직이에요.',
      '내심에서 세 변까지의 거리는 모두 내접원의 반지름으로 같아요.'
    ];
    var KINDS = ['예각삼각형', '직각삼각형', '둔각삼각형'];
    var SIDES = [['B', 'C'], ['C', 'A'], ['A', 'B']];

    area.innerHTML =
      '<section class="card">' +
      '  <h2>7단계 · 내접원과 내심' + (api.review ? ' <span class="muted">(다시 보기)</span>' : '') + '</h2>' +
      '  <div class="notice-blue" id="s7-box" style="font-size:17px;"></div>' +
      '  <div class="row" style="margin:8px 0;">' +
      '    <button class="btn primary" id="s7-next">다음 →</button>' +
      '    <span class="muted" id="s7-pg"></span>' +
      '  </div>' +
      '  <div class="row hidden" id="s7-checks" style="margin:8px 0;"></div>' +
      '  <svg class="board" id="s7-svg" viewBox="0 0 600 420"></svg>' +
      '  <div class="status" id="s7-ang"></div>' +
      '</section>';

    var svg = document.getElementById('s7-svg');
    var g = Svg.el('g', { style: 'pointer-events:none' }, svg);
    var vh = Svg.el('g', {}, svg);
    var H = {};

    function angAt(V, P, Q) {
      var u = { x: P.x - V.x, y: P.y - V.y }, w = { x: Q.x - V.x, y: Q.y - V.y };
      return Math.acos((u.x * w.x + u.y * w.y) / (Math.hypot(u.x, u.y) * Math.hypot(w.x, w.y))) * 180 / Math.PI;
    }

    ['A', 'B', 'C'].forEach(function (k) {
      var dot = Svg.el('circle', { style: 'pointer-events:none' }, vh);
      var h = Svg.el('circle', { r: 24, fill: 'transparent' }, vh);
      Svg.drag(svg, h, function (p) {
        if (phase !== 'check') return;
        T[k] = { x: Math.max(25, Math.min(575, p.x)), y: Math.max(25, Math.min(395, p.y)) };
        render();
      });
      H[k] = { dot: dot, h: h };
    });

    function render() {
      g.innerHTML = '';
      var A = T.A, B = T.B, C = T.C, I = Geo.incenter(A, B, C), all = phase === 'check';
      var fs = SIDES.map(function (s) {
        var f = Geo.foot(I, T[s[0]], T[s[1]]);
        f.along = Geo.unit({ x: T[s[1]].x - T[s[0]].x, y: T[s[1]].y - T[s[0]].y });
        return f;
      });
      var r = Geo.dist(I, fs[0]);
      Svg.el('polygon', { points: [A, B, C].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: 'none', stroke: '#1f2328', 'stroke-width': 3 }, g);
      Svg.el('circle', { cx: I.x, cy: I.y, r: r, fill: '#FAC775', 'fill-opacity': 0.45, stroke: '#854F0B', 'stroke-width': (all || frame === 1) ? 3.5 : 2.5 }, g);
      fs.forEach(function (f) { Svg.el('circle', { cx: f.x, cy: f.y, r: (frame === 0 && !all) ? 8 : 4.5, fill: '#D85A30' }, g); });
      if (all || frame >= 1) Svg.text(g, I.x - 30, I.y - r - 12, '내접원', 'font-size:17px;font-weight:700;fill:#854F0B;');
      if (all || frame >= 2) {
        fs.forEach(function (f) {
          Svg.el('line', { x1: I.x, y1: I.y, x2: f.x, y2: f.y, stroke: '#854F0B', 'stroke-width': 2.5 }, g);
          Svg.rightAngle(g, f, f.along, I, 13, '#A32D2D', 2.2);
        });
        Svg.el('circle', { cx: I.x, cy: I.y, r: 6, fill: '#854F0B' }, g);
        Svg.text(g, I.x + 9, I.y + 22, 'I (내심)', 'font-size:16px;font-weight:700;fill:#854F0B;');
      }
      if (all || frame >= 3) {
        fs.forEach(function (f) {
          var m = { x: (I.x + f.x) / 2, y: (I.y + f.y) / 2 };
          Svg.el('line', { x1: m.x - 7 * f.along.x, y1: m.y - 7 * f.along.y, x2: m.x + 7 * f.along.x, y2: m.y + 7 * f.along.y, stroke: '#534AB7', 'stroke-width': 3 }, g);
        });
      }
      Object.keys(T).forEach(function (k) {
        var p = T[k];
        Svg.text(g, p.x + (p.x - I.x) * 0.08 - 7, p.y + (p.y - I.y) * 0.08 + 7, k, 'font-size:19px;font-weight:700;');
        Svg.set(H[k].dot, { cx: p.x, cy: p.y, r: all ? 11 : 5, fill: all ? '#e8f0fe' : '#1f2328', stroke: all ? '#2563eb' : 'none', 'stroke-width': 2 });
        Svg.set(H[k].h, { cx: p.x, cy: p.y, style: 'cursor:' + (all ? 'grab' : 'default') });
      });

      if (all) {
        var mx = Math.max(angAt(A, B, C), angAt(B, C, A), angAt(C, A, B));
        var kind = Math.abs(mx - 90) <= 2 ? 1 : (mx > 90 ? 2 : 0);
        document.getElementById('s7-ang').textContent = '가장 큰 각: ' + Math.round(mx) + '° · ' + KINDS[kind];
        if (!seen[kind]) { seen[kind] = true; api.save('seen', seen); }
        drawChecks();
      }
    }

    function drawChecks() {
      var box = document.getElementById('s7-checks');
      box.innerHTML = KINDS.map(function (k, i) {
        return '<span class="pill' + (seen[i] ? ' on' : '') + '">' + (seen[i] ? '☑' : '☐') + ' ' + k + '</span>';
      }).join('');
      if (seen.every(Boolean)) {
        document.getElementById('s7-box').textContent = '세 종류의 삼각형 모두에서 내심과 내접원이 있었어요.';
        if (!api.review && !finishing) { finishing = true; setTimeout(api.finish, 2000); }
      }
    }

    function setFrame() {
      var box = document.getElementById('s7-box');
      if (phase === 'def') {
        box.innerHTML = FRAMES[frame];
        document.getElementById('s7-pg').textContent = (frame + 1) + ' / 4';
        document.getElementById('s7-next').classList.remove('hidden');
        document.getElementById('s7-checks').classList.add('hidden');
      } else {
        box.textContent = '꼭짓점을 끌어 예각·직각·둔각삼각형을 만들어 보세요. 내심과 내접원이 항상 있을까요?';
        document.getElementById('s7-pg').textContent = '';
        document.getElementById('s7-next').classList.add('hidden');
        document.getElementById('s7-checks').classList.remove('hidden');
      }
      render();
    }

    document.getElementById('s7-next').onclick = function () {
      if (frame < 3) { frame += 1; api.save('frame', frame); }
      else { phase = 'check'; api.save('phase', 'check'); }
      setFrame();
    };

    setFrame();
  }
};
