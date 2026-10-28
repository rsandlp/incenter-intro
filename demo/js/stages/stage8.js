// 8단계 · 왜 그럴까?
// 왼쪽 그림, 오른쪽 증명. 칸을 맞혀야 다음 칸과 도형이 나타남 (∠A 쪽 설여의 초록, ∠B 쪽 서중의 주황)
// 끝냄: 칸 3 서술 제출

Stages[8] = {
  mount: function (area, api) {
    var saved = api.answers;
    var step = saved.step || 0;
    var first = saved.first || {};
    var finishing = false;
    var GA = '#639922', OB = '#BA7517', PU = '#534AB7', NM = '#8a919b', RD = '#A32D2D';

    var Q = [
      { id: 's1', ok: 'IE = IF', opts: ['IE = IF', 'ID = IE', 'IA = IB'], hint: '∠A의 두 변은 AB와 AC예요. 초록색 선분을 보세요.' },
      { id: 's2', ok: 'ID = IF', opts: ['IA = IB', 'ID = IF', 'IE = IF'], hint: '∠B의 두 변은 BA와 BC예요. 주황색 선분을 보세요.' },
      { id: 's3', ok: '각의 이등분선 위의 한 점에서 그 각의 두 변까지의 거리는 같다',
        opts: ['각의 이등분선 위의 한 점에서 그 각의 두 변까지의 거리는 같다', '삼각형의 세 내각의 크기의 합은 180°이다', '이등변삼각형의 두 밑각의 크기는 같다'],
        hint: '두 식 모두 각의 이등분선 위의 점에 관한 성질이에요.' },
      { id: 's4', ok: 'ID = IE = IF', opts: ['IA = IB = IC', 'ID = IE = IF', '∠A = ∠B = ∠C'], hint: '칸 1의 두 식을 함께 보세요. 공통으로 들어 있는 선분은?' }
    ];
    var CAPS = [
      '설여가 그은 ∠A의 이등분선 위의 점 I에서 두 변 AB, AC에 수선을 그었어요.',
      '이번엔 서중이 그은 ∠B의 이등분선이에요. 두 변 BA, BC에 수선을 그었어요.',
      '두 식에 공통으로 쓴 성질을 골라 보세요.',
      '세 선분 ID, IE, IF를 함께 보세요.',
      '△ICD와 △ICE를 비교해 보세요.',
      '모두 끝났어요.'
    ];

    function sel(i) {
      return '<select id="' + Q[i].id + '"><option value="">선택</option>' + Q[i].opts.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select>';
    }

    area.innerHTML =
      '<h2 style="margin:4px 0 10px;">8단계 · 왜 그럴까?' + (api.review ? ' <span class="muted">(다시 보기)</span>' : '') + '</h2>' +
      '<div class="claim">∠A와 ∠B의 이등분선의 교점을 점 I라고 하면, 직선 CI 역시 ∠C의 이등분선이 된다.</div>' +
      '<div class="split">' +
      '  <div class="card" style="margin:0;"><svg class="board" id="s8-svg" viewBox="0 0 330 225" style="margin:0;"></svg><div class="muted" id="s8-cap" style="margin-top:6px;"></div></div>' +
      '  <div>' +
      '    <div class="card proof"><span class="num">1</span>점 I는 ∠A의 이등분선 위에 있으므로<br>' + sel(0) + ' 이다.<div class="hintline" id="h1"></div>' +
      '      <div id="p1b" class="hidden">점 I는 ∠B의 이등분선 위에 있으므로<br>' + sel(1) + ' 이다.<div class="hintline" id="h2"></div></div>' +
      '      <div id="p1c" class="hidden">근거: ' + sel(2) + '<div class="hintline" id="h3"></div></div></div>' +
      '    <div class="card proof hidden" id="k2"><span class="num">2</span>따라서 ' + sel(3) + ' 이다.<div class="hintline" id="h4"></div></div>' +
      '    <div class="card proof hidden" id="k3" style="line-height:1.6;"><span class="num">3</span>△ICD와 △ICE를 이용하여, CI가 ∠C의 이등분선인 이유를 설명해 보세요.' +
      '      <textarea id="s8-tx" style="margin-top:6px;" placeholder="두 삼각형에서 같은 것을 찾아 적어 보세요"></textarea>' +
      '      <div class="row" style="margin-top:6px;"><button class="btn" id="s8-hn">💡 힌트 보기</button><button class="btn primary" id="s8-go">제출하기</button></div>' +
      '      <div class="muted" id="s8-ht"></div><div class="msg" id="s8-fb"></div></div>' +
      '  </div>' +
      '</div>';

    // ---------- 그림 (6·7단계와 같은 삼각형을 줄여서) ----------
    var svg = document.getElementById('s8-svg');
    function sc(p) { return { x: (p.x - 50) * 0.6 + 15, y: (p.y - 70) * 0.6 + 12 }; }
    var A = sc(STAGE5_FIG.A), B = sc(STAGE5_FIG.B), C = sc(STAGE5_FIG.C);
    var I = Geo.incenter(A, B, C);
    function foot(X, Y) { var f = Geo.foot(I, X, Y); f.s = Geo.unit({ x: Y.x - X.x, y: Y.y - X.y }); return f; }
    var FT = { D: foot(B, C), E: foot(C, A), F: foot(A, B) };
    function arc(V, P1, P2, r) {
      var a1 = Math.atan2(P1.y - V.y, P1.x - V.x), a2 = Math.atan2(P2.y - V.y, P2.x - V.x), df = a2 - a1;
      while (df > Math.PI) df -= 2 * Math.PI;
      while (df < -Math.PI) df += 2 * Math.PI;
      return 'M' + (V.x + r * Math.cos(a1)) + ' ' + (V.y + r * Math.sin(a1)) + ' A' + r + ' ' + r + ' 0 0 ' + (df > 0 ? 1 : 0) + ' ' + (V.x + r * Math.cos(a2)) + ' ' + (V.y + r * Math.sin(a2));
    }
    var g = {};
    g.tri1 = Svg.el('polygon', { points: [I, C, FT.D].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: '#9FE1CB', 'fill-opacity': 0.6 }, svg);
    g.tri2 = Svg.el('polygon', { points: [I, C, FT.E].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: '#F4C0D1', 'fill-opacity': 0.6 }, svg);
    Svg.el('polygon', { points: [A, B, C].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: 'none', stroke: '#1f2328', 'stroke-width': 2 }, svg);
    [[A, B, 'l'], [B, C, 'm'], [C, A, 'n']].forEach(function (s) {
      var m = { x: (s[0].x + s[1].x) / 2, y: (s[0].y + s[1].y) / 2 }, o = Geo.unit({ x: m.x - I.x, y: m.y - I.y });
      Svg.text(svg, m.x + o.x * 13 - 3, m.y + o.y * 13 + 4, s[2], 'font-size:12px;font-style:italic;fill:#9aa1ab;');
    });
    g.AI = Svg.el('line', { x1: A.x, y1: A.y, x2: I.x, y2: I.y }, svg);
    g.BI = Svg.el('line', { x1: B.x, y1: B.y, x2: I.x, y2: I.y }, svg);
    g.aA = [Svg.el('path', { d: arc(A, B, I, 20), fill: 'none' }, svg), Svg.el('path', { d: arc(A, I, C, 20), fill: 'none' }, svg)];
    g.aB = [arc(B, C, I, 24), arc(B, I, A, 24), arc(B, C, I, 29), arc(B, I, A, 29)].map(function (d) { return Svg.el('path', { d: d, fill: 'none' }, svg); });
    g.aC = [Svg.el('path', { d: arc(C, A, I, 22), fill: 'none' }, svg), Svg.el('path', { d: arc(C, I, B, 22), fill: 'none' }, svg)];
    g.CI = Svg.el('line', { x1: C.x, y1: C.y, x2: I.x, y2: I.y }, svg);
    g.seg = {}; g.sq = {}; g.tk = {}; g.lb = {};
    Object.keys(FT).forEach(function (k) {
      var f = FT[k], n = Geo.unit({ x: I.x - f.x, y: I.y - f.y });
      g.sq[k] = Svg.rightAngle(svg, f, f.s, I, 7, NM, 1.3);
      g.seg[k] = Svg.el('line', { x1: I.x, y1: I.y, x2: f.x, y2: f.y }, svg);
      var m = { x: (I.x + f.x) / 2, y: (I.y + f.y) / 2 };
      g.tk[k] = Svg.el('line', { x1: m.x - 5 * f.s.x, y1: m.y - 5 * f.s.y, x2: m.x + 5 * f.s.x, y2: m.y + 5 * f.s.y, stroke: PU, 'stroke-width': 2 }, svg);
      g.lb[k] = Svg.text(svg, f.x - n.x * 13 - 4, f.y - n.y * 13 + 5, k, 'font-size:13px;');
    });
    [[A, 'A', -4, -6], [B, 'B', -14, 6], [C, 'C', 5, 10], [I, 'I', 5, -7]].forEach(function (v) {
      Svg.text(svg, v[0].x + v[2], v[0].y + v[3], v[1], 'font-size:14px;font-weight:700;');
    });
    Svg.el('circle', { cx: I.x, cy: I.y, r: 3, fill: '#1f2328' }, svg);

    function show(e, on) { e.style.display = on ? '' : 'none'; }
    function sty(e, col, w, dash) { Svg.set(e, { stroke: col, 'stroke-width': w, 'stroke-dasharray': dash || '' }); }

    function draw() {
      var vis = { D: step >= 1, E: true, F: true };
      var hl = step === 0 ? { E: GA, F: GA } : (step <= 2 ? { D: OB, F: OB } : { D: PU, E: PU, F: PU });
      Object.keys(FT).forEach(function (k) {
        show(g.seg[k], vis[k]); show(g.sq[k], vis[k]); show(g.lb[k], vis[k]); show(g.tk[k], step >= 3);
        sty(g.seg[k], hl[k] || NM, hl[k] ? 3 : 1.3, hl[k] ? '' : '3 3');
        sty(g.sq[k], hl[k] || NM, 1.3);
      });
      var onA = step === 0 || step === 2, onB = step === 1 || step === 2;
      g.aA.forEach(function (e) { sty(e, onA ? GA : NM, onA ? 2 : 1.2); });
      g.aB.forEach(function (e) { sty(e, onB ? OB : NM, onB ? 2 : 1.2); });
      sty(g.AI, onA ? GA : NM, onA ? 2.2 : 1.3);
      sty(g.BI, onB ? OB : NM, onB ? 2.2 : 1.3);
      show(g.CI, step >= 4); sty(g.CI, RD, 2.5);
      g.aC.forEach(function (e) { show(e, step >= 5); sty(e, RD, 2); });
      show(g.tri1, step >= 4); show(g.tri2, step >= 4);
      if (step >= 4) { sty(g.sq.D, RD, 2); sty(g.sq.E, RD, 2); }
      document.getElementById('s8-cap').textContent = CAPS[step];
      document.getElementById('p1b').classList.toggle('hidden', step < 1);
      document.getElementById('p1c').classList.toggle('hidden', step < 2);
      document.getElementById('k2').classList.toggle('hidden', step < 3);
      document.getElementById('k3').classList.toggle('hidden', step < 4);
    }

    Q.forEach(function (q, i) {
      var s = document.getElementById(q.id);
      if (step > i) { s.value = q.ok; s.disabled = true; s.classList.add('ok'); }
      s.addEventListener('change', function () {
        var h = document.getElementById('h' + (i + 1));
        if (!s.value) return;
        if (first[q.id] === undefined) { first[q.id] = s.value; api.save('first', first); }
        if (s.value === q.ok) {
          s.classList.remove('bad'); s.classList.add('ok'); s.disabled = true; h.textContent = '';
          if (step === i) { step = i + 1; api.save('step', step); draw(); }
        } else {
          s.classList.add('bad');
          h.textContent = q.hint;
        }
      });
    });

    var tx = document.getElementById('s8-tx');
    tx.value = saved.c3 || '';
    document.getElementById('s8-hn').onclick = function () {
      document.getElementById('s8-ht').textContent = '💡 힌트: △ICD와 △ICE는 모두 직각삼각형이에요. 빗변과 다른 한 변을 살펴보세요.';
    };
    tx.addEventListener('input', function () { tx.classList.remove('bad'); document.getElementById('s8-fb').textContent = ''; });
    document.getElementById('s8-go').onclick = function () {
      var fb = document.getElementById('s8-fb');
      if (!tx.value.trim()) { tx.classList.add('bad'); fb.className = 'msg bad'; fb.textContent = '설명을 먼저 적어 주세요.'; return; }
      api.save('c3', tx.value.trim());
      step = 5;
      api.save('step', 5);
      draw();
      fb.className = 'msg ok';
      fb.textContent = '제출했어요. 선생님 화면으로 전달됐어요.';
      if (!api.review && !finishing) { finishing = true; setTimeout(api.finish, 2000); }
    };

    draw();
  }
};
