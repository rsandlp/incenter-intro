// 3단계 · 두 반직선에 접하는 원
// 크기가 다른 원 5개의 중심을 끌어 두 반직선 l, m에 동시에 접하게 놓기 → 중심들의 공통점 서술(엄격 판정)
// 오답이면 [힌트] 버튼 등장. 교사 화면에는 정답만 전달
// 끝냄: 원 5개 모두 접하게 놓기 + 정답 제출

var STAGE3_RAYS = {
  V: { x: 30, y: 200 },
  dirs: [{ x: 0.951, y: -0.309 }, { x: 0.9945, y: 0.1045 }],   // l, m 방향 (사이각 24°)
  bis: { x: 0.9945, y: -0.1045 },                              // 각의 이등분선 방향
  half: 12 * Math.PI / 180,
  radii: [16, 24, 32, 42, 52]
};

Stages[3] = {
  mount: function (area, api) {
    var G = STAGE3_RAYS, V = G.V, D = G.dirs, S = Math.sin(G.half);
    var HOME = [60, 130, 220, 330, 460];
    var KEYS = ['두직선이이루는각의이등분선', '두직선이이루는각을반으로'];
    var saved = api.answers;
    var correct = !!saved.correct;
    var finishing = false;

    area.innerHTML =
      '<section class="card">' +
      '  <div class="row" style="justify-content:space-between;">' +
      '    <h2 style="margin:0;">3단계 · 두 반직선에 접하는 원' + (api.review ? ' <span class="muted">(다시 보기)</span>' : '') + '</h2>' +
      '    <span class="counter" id="s3-cnt"></span>' +
      '  </div>' +
      '  <p class="muted">원의 중심(점)을 끌어 두 반직선 l, m에 동시에 닿게 놓아 보세요.</p>' +
      '  <svg class="board" id="s3-svg" viewBox="0 0 600 430"></svg>' +
      '  <div class="status" id="s3-st"></div>' +
      '</section>' +
      '<section class="card">' +
      '  <p style="margin-top:0;">다섯 원의 중심들은 어떤 공통점이 있나요?</p>' +
      '  <textarea id="s3-ans" placeholder="다섯 원의 중심이 어떻게 놓여 있는지 살펴보고 적어 보세요"></textarea>' +
      '  <div class="row" style="margin-top:6px;">' +
      '    <button class="btn primary" id="s3-go">제출하기</button>' +
      '    <button class="btn hidden" id="s3-hint">💡 힌트</button>' +
      '    <span class="msg" id="s3-msg"></span>' +
      '  </div>' +
      '  <div id="s3-hintbox"></div>' +
      '</section>';

    var svg = document.getElementById('s3-svg');
    Svg.el('line', { x1: V.x, y1: V.y, x2: 562, y2: 27, stroke: '#1f2328', 'stroke-width': 2.5 }, svg);
    Svg.el('line', { x1: V.x, y1: V.y, x2: 587, y2: 258, stroke: '#1f2328', 'stroke-width': 2.5 }, svg);
    Svg.text(svg, 568, 32, 'l', 'font-size:20px;font-style:italic;');
    Svg.text(svg, 574, 282, 'm', 'font-size:20px;font-style:italic;');
    Svg.el('line', { x1: 0, y1: 298, x2: 600, y2: 298, stroke: '#c4c9d1', 'stroke-dasharray': '4 4' }, svg);
    Svg.text(svg, 14, 318, '스티커 보관함', 'font-size:13px;fill:#6b7280;');
    var cg = Svg.el('g', {}, svg), mg = Svg.el('g', {}, svg), hg = Svg.el('g', {}, svg);

    function info(c) {
      return D.map(function (d) {
        var px = c.x - V.x, py = c.y - V.y, t = px * d.x + py * d.y;
        return { dist: Math.abs(px * d.y - py * d.x), t: t, foot: { x: V.x + t * d.x, y: V.y + t * d.y } };
      });
    }

    function touching(c) {
      var f = info(c);
      return f.map(function (o) { return o.t > 0 && Math.abs(o.dist - c.r) < 4; });
    }

    var pos = saved.positions || [];
    var cs = G.radii.map(function (r, i) {
      var c = { r: r, x: pos[i] ? pos[i].x : HOME[i], y: pos[i] ? pos[i].y : 364 };
      c.el = Svg.el('circle', { r: r, 'stroke-width': 2, 'fill-opacity': 0.8, style: 'pointer-events:none' }, cg);
      c.dot = Svg.el('circle', { r: 6, style: 'pointer-events:none' }, hg);
      c.hit = Svg.el('circle', { r: 22, fill: 'transparent', style: 'cursor:grab' }, hg);
      var off = { x: 0, y: 0 };   // 누른 점과 원의 중심 사이 거리 (끄는 동안 유지)
      Svg.drag(svg, c.hit, function (p) {
        c.x = p.x + off.x;
        c.y = p.y + off.y;
        snap(c);
        draw();
      }, function () {
        api.save('positions', cs.map(function (q) { return { x: Math.round(q.x * 10) / 10, y: Math.round(q.y * 10) / 10 }; }));
        tryFinish();
      }, function (p) {
        off = { x: c.x - p.x, y: c.y - p.y };
      });
      return c;
    });

    // 거의 맞으면 정확한 위치(이등분선 위)로 끌어당김
    function snap(c) {
      var f = info(c);
      if (f.every(function (o) { return o.t > 0 && Math.abs(o.dist - c.r) < 7; })) {
        var k = c.r / S;
        c.x = V.x + k * G.bis.x;
        c.y = V.y + k * G.bis.y;
      }
    }

    function placedCount() {
      return cs.filter(function (c) { var h = touching(c); return h[0] && h[1]; }).length;
    }

    function draw() {
      mg.innerHTML = '';
      cs.forEach(function (c) {
        var h = touching(c), both = h[0] && h[1];
        Svg.set(c.el, { cx: c.x, cy: c.y, fill: both ? '#E1F5EE' : '#EEEDFE', stroke: both ? '#0F6E56' : (h[0] || h[1] ? '#BA7517' : '#534AB7') });
        Svg.set(c.dot, { cx: c.x, cy: c.y, fill: both ? '#0F6E56' : '#534AB7' });
        Svg.set(c.hit, { cx: c.x, cy: c.y });
        if (both) info(c).forEach(function (o) { Svg.el('circle', { cx: o.foot.x, cy: o.foot.y, r: 4, fill: '#D85A30' }, mg); });
      });
      var n = placedCount();
      document.getElementById('s3-cnt').textContent = '두 반직선에 접한 원 ' + n + ' / 5';
      document.getElementById('s3-st').textContent = n === 5 ? '다섯 원 모두 두 반직선에 접했어요. 다섯 원의 중심을 보세요.' : '';
    }

    // ---------- 발문 ----------
    var ans = document.getElementById('s3-ans');
    var msg = document.getElementById('s3-msg');
    var hintBtn = document.getElementById('s3-hint');
    ans.value = saved.text || saved.draft || '';
    if (saved.wrongOnce) hintBtn.classList.remove('hidden');

    function tryFinish() {
      if (!correct) return;
      if (placedCount() < 5) {
        msg.className = 'msg';
        msg.textContent = '답은 맞았어요. 원 5개를 모두 두 반직선에 접하게 놓아 보세요.';
        return;
      }
      msg.className = 'msg ok';
      msg.textContent = '맞았어요. 선생님 화면으로 전달됐어요.';
      if (!api.review && !finishing) {
        finishing = true;
        setTimeout(api.finish, 1200);
      }
    }

    document.getElementById('s3-go').onclick = function () {
      var v = ans.value.trim();
      if (!v) {
        ans.classList.add('bad');
        msg.className = 'msg bad';
        msg.textContent = '답을 먼저 적어 주세요.';
        return;
      }
      var ok = KEYS.some(function (k) { return v.replace(/\s/g, '').indexOf(k) >= 0; });
      if (saved.firstOk === undefined) { saved.firstOk = ok; api.save('firstOk', ok); }
      ans.classList.toggle('ok', ok);
      ans.classList.toggle('bad', !ok);
      if (ok) {
        correct = true;
        api.save('text', v);        // 교사 화면에는 정답으로 판정된 답만
        api.save('correct', true);
        tryFinish();
      } else {
        api.save('draft', v);
        api.save('wrongOnce', true);
        msg.className = 'msg bad';
        msg.textContent = '다시 생각해 보세요.';
        hintBtn.classList.remove('hidden');
      }
    };

    ans.addEventListener('input', function () {
      ans.classList.remove('bad');
      if (!correct) msg.textContent = '';
    });

    hintBtn.onclick = function () {
      document.getElementById('s3-hintbox').innerHTML =
        '<div class="hintbox warn">💡 원들의 중심을 이으면 두 직선이 이루는 각의 (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)이다.</div>';
    };

    if (correct) ans.classList.add('ok');
    draw();
    tryFinish();
  }
};
