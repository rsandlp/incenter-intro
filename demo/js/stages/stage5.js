// 5단계 · 세 직선에 접하는 원
// 왼쪽: 세 친구 말풍선 + 주장과 연결된 활동 1~3, 오른쪽: 활동 화면
// 활동 1: l·m의 이등분선 → 서중이의 원 / 활동 2: l·n의 이등분선 → 설여의 원 / 활동 3: 두 원을 같아지게 → 금색 원
// 금색 원이 되면 질문 1(고르기) → 정답이면 질문 2(서술, 엄격 판정, 오답이면 힌트 버튼)
// 끝냄: 질문 2 정답 제출

// 5~8단계가 함께 쓰는 그림: 세 직선 l, m, n과 세 교점 (6단계부터 위 A, 왼쪽 B, 오른쪽 C)
var STAGE5_FIG = {
  A: { x: 360, y: 70 },    // l과 n이 만나는 점
  B: { x: 50, y: 340 },    // l과 m이 만나는 점
  C: { x: 540, y: 380 }    // m과 n이 만나는 점
};

Stages[5] = {
  mount: function (area, api) {
    var F = STAGE5_FIG, A = F.A, B = F.B, C = F.C;
    var I = Geo.incenter(A, B, C);
    var saved = api.answers;
    var step = saved.step || 1;            // 지금 할 활동 (1, 2, 3), 4 = 금색 원 완성
    var q1ok = !!saved.q1ok, correct = !!saved.correct;
    var mode = false, sel = [];
    var finishing = false;

    function lerp(p, q, t) { return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t }; }
    var LN = { l: [B, A], m: [B, lerp(B, C, 1.08)], n: [A, lerp(A, C, 0.82)] };
    var LB = { l: { x: 190, y: 185 }, m: { x: 330, y: 392 }, n: { x: 478, y: 250 } };

    function bisOf(P, Q, R) {
      var u = Geo.unit({ x: Q.x - P.x, y: Q.y - P.y }), v = Geo.unit({ x: R.x - P.x, y: R.y - P.y });
      return { P: P, b: Geo.unit({ x: u.x + v.x, y: u.y + v.y }), s: Math.sin(Math.acos(u.x * v.x + u.y * v.y) / 2), tI: Geo.dist(I, P) };
    }
    var PAIRS = {
      'l,m': { key: 'sj', step: 1, name: '서중이의 원', bi: bisOf(B, A, C), fill: '#FAEEDA', stroke: '#BA7517' },
      'l,n': { key: 'sy', step: 2, name: '설여의 원', bi: bisOf(A, B, C), fill: '#EAF3DE', stroke: '#639922' }
    };

    area.innerHTML =
      '<h2 style="margin:4px 0 10px;">5단계 · 세 직선에 접하는 원' + (api.review ? ' <span class="muted">(다시 보기)</span>' : '') + '</h2>' +
      '<div class="split">' +
      '  <div>' +
      '    <div class="talk sj"><b>서중</b> 내가 두 직선 l과 m에 동시에 접하는 원을 그렸어!' +
      '      <div class="act" id="s5-a1">활동 1 · [각의 이등분선]으로 l과 m을 골라 서중이의 원 만들기</div></div>' +
      '    <div class="talk sy"><b>설여</b> 나도 두 직선 l과 n에 동시에 접하는 원을 그렸는걸!!' +
      '      <div class="act" id="s5-a2">활동 2 · [각의 이등분선]으로 l과 n을 골라 설여의 원 만들기</div></div>' +
      '    <div class="talk yw"><b>여울</b> 그럼, 너희들이 그린 두 원이 같아지는 순간이 있을까? 그렇다면, 그 원은 세 직선 l, m, n에 모두 접할 텐데...' +
      '      <div class="act" id="s5-a3">활동 3 · 두 원의 중심을 끌어 두 원이 같아지게 만들기</div></div>' +
      '  </div>' +
      '  <div class="card" style="margin:0;">' +
      '    <button class="btn" id="s5-bis">📐 각의 이등분선</button>' +
      '    <svg class="board" id="s5-svg" viewBox="0 0 600 420"></svg>' +
      '    <div class="status" id="s5-st"></div>' +
      '  </div>' +
      '</div>' +
      '<section class="card hidden" id="s5-q1" style="margin-top:12px;">' +
      '  <p style="margin-top:0;">여울의 질문에 답해 보세요.</p>' +
      '  <label class="choice" style="display:flex;margin-bottom:6px;"><input type="radio" name="s5" value="y"> 세 직선에 모두 접하는 원이 존재한다.</label>' +
      '  <label class="choice" style="display:flex;"><input type="radio" name="s5" value="n"> 세 직선에 모두 접하는 원이 존재하지 않는다.</label>' +
      '  <div class="row" style="margin-top:8px;"><button class="btn primary" id="s5-go1">제출하기</button><span class="msg" id="s5-m1"></span></div>' +
      '</section>' +
      '<section class="card hidden" id="s5-q2">' +
      '  <p style="margin-top:0;">그럼 그 원의 중심과 반지름의 길이는 어떻게 알 수 있는지 서술하세요.</p>' +
      '  <textarea id="s5-ans" placeholder="원의 중심은 …, 반지름의 길이는 …"></textarea>' +
      '  <div class="row" style="margin-top:6px;">' +
      '    <button class="btn primary" id="s5-go2">제출하기</button>' +
      '    <button class="btn hidden" id="s5-hint">💡 힌트</button>' +
      '    <span class="msg" id="s5-m2"></span>' +
      '  </div>' +
      '  <div id="s5-hintbox"></div>' +
      '</section>';

    var svg = document.getElementById('s5-svg');
    var st = document.getElementById('s5-st');
    var bb = document.getElementById('s5-bis');
    var BI = Svg.el('g', {}, svg), L = Svg.el('g', {}, svg), CI = Svg.el('g', {}, svg), H = Svg.el('g', {}, svg);
    var circles = {};

    function say(t) { st.textContent = t; }

    function drawLines() {
      L.innerHTML = '';
      Object.keys(LN).forEach(function (k) {
        var p = LN[k][0], q = LN[k][1], on = sel.indexOf(k) >= 0;
        Svg.el('line', { x1: p.x, y1: p.y, x2: q.x, y2: q.y, stroke: on ? '#2563eb' : '#1f2328', 'stroke-width': on ? 5 : 3 }, L);
        var h = Svg.el('line', { x1: p.x, y1: p.y, x2: q.x, y2: q.y, stroke: 'transparent', 'stroke-width': 30, style: 'cursor:' + (mode ? 'pointer' : 'default') }, L);
        h.addEventListener('click', function () { pick(k); });
        Svg.text(L, LB[k].x, LB[k].y, k, 'font-size:24px;font-style:italic;');
      });
    }

    function drawSteps() {
      [1, 2, 3].forEach(function (i) {
        var e = document.getElementById('s5-a' + i);
        e.className = 'act' + (i < step ? ' done' : i === step ? ' on' : '');
        e.dataset.icon = i < step ? '✔' : i === step ? '▶' : '🔒';
      });
    }

    function addCircle(pr, t) {
      var bi = pr.bi;
      var e = Svg.el('line', { x1: bi.P.x, y1: bi.P.y, x2: bi.P.x + bi.b.x * bi.tI * 2.1, y2: bi.P.y + bi.b.y * bi.tI * 2.1, stroke: pr.stroke, 'stroke-width': 2, 'stroke-dasharray': '8 6' }, BI);
      var o = { pr: pr, t: t };
      o.el = Svg.el('circle', { 'stroke-width': 2.5, style: 'pointer-events:none' }, CI);
      o.dot = Svg.el('circle', { r: 7, style: 'pointer-events:none' }, H);
      o.hit = Svg.el('circle', { r: 24, fill: 'transparent', style: 'cursor:grab' }, H);
      circles[pr.key] = o;
      Svg.drag(svg, o.hit, function (p) {
        if (step < 3) return;   // 원 움직이기는 활동 3부터
        var t2 = (p.x - bi.P.x) * bi.b.x + (p.y - bi.P.y) * bi.b.y;
        t2 = Math.max(18, Math.min(bi.tI * 2, t2));
        var other = circles[pr.key === 'sj' ? 'sy' : 'sj'];
        // 두 원이 모두 금색 자리 근처일 때만 함께 붙음
        if (other && Math.abs(t2 - bi.tI) < 12 && Math.abs(other.t - other.pr.bi.tI) < 12) { t2 = bi.tI; other.t = other.pr.bi.tI; }
        o.t = t2;
        draw();
      }, function () {
        api.save('t', { sj: circles.sj && circles.sj.t, sy: circles.sy && circles.sy.t });
      });
    }

    function isGold() {
      var ks = Object.keys(circles);
      return ks.length === 2 && ks.every(function (k) { return circles[k].t === circles[k].pr.bi.tI; });
    }

    function draw() {
      var g = isGold();
      Object.keys(circles).forEach(function (k) {
        var o = circles[k], bi = o.pr.bi, cx = bi.P.x + bi.b.x * o.t, cy = bi.P.y + bi.b.y * o.t;
        Svg.set(o.el, { cx: cx, cy: cy, r: o.t * bi.s, fill: g ? '#FAC775' : o.pr.fill, 'fill-opacity': g ? 0.85 : 0.75, stroke: g ? '#854F0B' : o.pr.stroke });
        Svg.set(o.dot, { cx: cx, cy: cy, fill: g ? '#854F0B' : o.pr.stroke });
        Svg.set(o.hit, { cx: cx, cy: cy });
      });
      if (g && step < 4) {
        step = 4;
        api.save('step', 4);
        drawSteps();
        showQuestions();
      }
      if (g) say('두 원이 같아졌어요. 이 원은 세 직선 l, m, n에 모두 접해요. 아래 질문에 답해 보세요.');
    }

    function pick(k) {
      if (!mode || sel.indexOf(k) >= 0) return;
      sel.push(k);
      drawLines();
      if (sel.length < 2) { say('직선 ' + k + '를 골랐어요. 한 직선을 더 골라 보세요.'); return; }
      var key = sel.slice().sort().join(',');
      mode = false;
      bb.classList.remove('active');
      sel = [];
      drawLines();
      if (!PAIRS[key]) { say('이번 활동에서는 l을 포함해 골라 보세요.'); return; }
      var pr = PAIRS[key];
      if (circles[pr.key]) { say('이미 그린 이등분선이에요.'); return; }
      if (pr.step !== step) { say('먼저 서중이의 원부터 만들어 보세요. (활동 1: l과 m)'); return; }
      addCircle(pr, pr.bi.tI * (pr.key === 'sj' ? 0.45 : 0.5));
      step += 1;
      api.save('step', step);
      api.save('t', { sj: circles.sj && circles.sj.t, sy: circles.sy && circles.sy.t });
      drawSteps();
      draw();
      say(step === 2 ? '서중이의 원이 생겼어요. 활동 2: [각의 이등분선]으로 직선 l과 n을 골라 보세요.' : '설여의 원도 생겼어요. 활동 3: 두 원의 중심을 끌어 두 원이 같아지게 만들어 보세요.');
    }

    bb.onclick = function () {
      if (step > 2) { say('두 이등분선을 모두 그렸어요. 두 원의 중심을 끌어 보세요.'); return; }
      mode = true;
      sel = [];
      bb.classList.add('active');
      drawLines();
      say('첫 번째 직선을 골라 보세요.');
    };

    // ---------- 질문 ----------
    var ans = document.getElementById('s5-ans');
    var hintBtn = document.getElementById('s5-hint');

    function showQuestions() {
      document.getElementById('s5-q1').classList.toggle('hidden', step < 4);
      document.getElementById('s5-q2').classList.toggle('hidden', !q1ok);
      if (q1ok) area.querySelectorAll('input[name=s5]').forEach(function (r) { r.checked = r.value === 'y'; r.disabled = true; });
    }

    document.getElementById('s5-go1').onclick = function () {
      var picked = area.querySelector('input[name=s5]:checked');
      var m = document.getElementById('s5-m1');
      if (q1ok) return;
      if (!picked) { m.className = 'msg bad'; m.textContent = '하나를 골라 주세요.'; return; }
      if (saved.q1first === undefined) { saved.q1first = picked.value; api.save('q1first', picked.value); }
      if (picked.value === 'y') {
        q1ok = true;
        api.save('q1ok', true);
        m.className = 'msg ok';
        m.textContent = '맞았어요.';
        showQuestions();
      } else {
        m.className = 'msg bad';
        m.textContent = '다시 생각해 보세요. 그림의 금색 원을 다시 보세요.';
      }
    };
    area.querySelectorAll('input[name=s5]').forEach(function (r) {
      r.addEventListener('change', function () { document.getElementById('s5-m1').textContent = ''; });
    });

    ans.value = saved.text || saved.draft || '';
    if (saved.wrongOnce) hintBtn.classList.remove('hidden');
    if (correct) ans.classList.add('ok');

    document.getElementById('s5-go2').onclick = function () {
      var m = document.getElementById('s5-m2');
      var v = ans.value.trim();
      if (!v) { ans.classList.add('bad'); m.className = 'msg bad'; m.textContent = '답을 먼저 적어 주세요.'; return; }
      var flat = v.replace(/\s/g, '');
      var ok = flat.indexOf('두각의이등분선의교점') >= 0 && flat.indexOf('수선의발') >= 0;
      if (saved.firstOk === undefined) { saved.firstOk = ok; api.save('firstOk', ok); }
      ans.classList.toggle('ok', ok);
      ans.classList.toggle('bad', !ok);
      if (ok) {
        correct = true;
        api.save('text', v);       // 교사 화면에는 정답만
        api.save('correct', true);
        m.className = 'msg ok';
        m.textContent = '맞았어요. 선생님 화면으로 전달됐어요.';
        if (!api.review && !finishing) { finishing = true; setTimeout(api.finish, 1200); }
      } else {
        api.save('draft', v);
        api.save('wrongOnce', true);
        m.className = 'msg bad';
        m.textContent = '다시 생각해 보세요.';
        hintBtn.classList.remove('hidden');
      }
    };
    ans.addEventListener('input', function () { ans.classList.remove('bad'); if (!correct) document.getElementById('s5-m2').textContent = ''; });

    hintBtn.onclick = function () {
      document.getElementById('s5-hintbox').innerHTML =
        '<div class="hintbox warn">💡 원의 중심: 두 각의 이등분선의 (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)<br>' +
        '원의 반지름: 원의 중심에서 세 직선에 내린 (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)까지의 거리</div>';
    };

    // 다시 보기·재입장: 만든 원과 진행 상태 되살리기
    var ts = saved.t || {};
    if (step >= 2) addCircle(PAIRS['l,m'], ts.sj || PAIRS['l,m'].bi.tI * 0.45);
    if (step >= 3) addCircle(PAIRS['l,n'], ts.sy || PAIRS['l,n'].bi.tI * 0.5);
    drawLines();
    drawSteps();
    draw();
    showQuestions();
    if (step === 1) say('활동 1: [각의 이등분선]을 누르고 직선 l과 m을 골라 보세요.');
    else if (step === 2) say('활동 2: [각의 이등분선]으로 직선 l과 n을 골라 보세요.');
    else if (step === 3) say('활동 3: 두 원의 중심을 끌어 두 원이 같아지게 만들어 보세요.');
  }
};
