// 교사 화면: 수업 열기, [다음 단계], [화면 잠그기], 학생별 진행표(화면 이탈 포함),
// 서술 답 모아 보기, 정답률(첫 답 기준), 발표용 띄우기, [수업 마치기]와 2차시 여는 방법

(function () {
  var app = document.getElementById('app');
  var answerStage = null;   // 서술 답 모아 보기에서 고른 단계 (null이면 현재 단계를 따라감)
  var projecting = null;    // 발표용으로 띄운 답 { stage, text }
  var shown = [];           // 지금 목록에 보이는 답들 ([띄우기] 버튼이 가리킴)
  var viewStage = null;     // '단계 화면 보기'로 교사 창에 띄운 단계 (학생 진행·기록에는 영향 없음)
  var previewShown = false;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function newCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var code = '';
    for (var i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  function studentList(state) {
    return Object.keys(state.students).map(function (id) { return state.students[id]; })
      .sort(function (a, b) { return a.cls - b.cls || a.num - b.num; });
  }

  function render(state) {
    if (!state.session) drawStart();
    else if (state.session.closed) drawResume(state);
    else if (viewStage) { if (!previewShown) drawPreview(); }   // 보는 동안은 다시 그리지 않음
    else drawDash(state);
  }

  // ---------- 단계 화면 보기 (교사 창에서만, 학생 기록에 영향 없음) ----------

  function stageChips(current, marked) {
    var html = '';
    for (var i = 1; i <= LAST_STAGE; i++) {
      html += '<button class="chip' + (i === marked ? ' now' : ' past') + '" data-view="' + i + '" title="' + esc(STAGES[i].name) + '">' + i + '</button>';
    }
    return html;
  }

  function bindChips() {
    app.querySelectorAll('button[data-view]').forEach(function (b) {
      b.onclick = function () {
        viewStage = +b.dataset.view;
        previewShown = false;
        render(Sync.get());
      };
    });
  }

  function drawPreview() {
    previewShown = true;
    var n = viewStage;
    var store = {};   // 미리보기 안에서만 쓰는 임시 답 (저장되지 않음)
    app.innerHTML =
      '<div class="pv-bar"><div class="wrap row">' +
      '  <b style="margin-right:auto;">단계 화면 보기 · 교사 창에서만 보여요 (학생 진행·기록에는 영향 없음)</b>' +
      '  <nav class="chips">' + stageChips(null, n) + '</nav>' +
      '  <button class="btn primary" id="pv-back">← 대시보드로 돌아가기</button>' +
      '</div></div>' +
      '<div class="wrap"><div class="msg ok" id="pv-note"></div><div id="pv"></div></div>';
    bindChips();
    document.getElementById('pv-back').onclick = function () {
      viewStage = null;
      previewShown = false;
      render(Sync.get());
    };
    Stages[n].mount(document.getElementById('pv'), {
      stage: n,
      review: false,
      answers: {},
      all: store,
      save: function (k, v) { store[n] = store[n] || {}; store[n][k] = v; },
      finish: function () {
        var note = document.getElementById('pv-note');
        if (note && viewStage === n) note.textContent = '학생이라면 여기서 ' + n + '단계가 끝나요. (미리보기라 기록되지 않아요)';
      }
    });
  }

  // ---------- 2차시 여는 방법: 같은 수업 코드로 이어서 시작 ----------

  function drawResume(state) {
    var s = state.session;
    var list = studentList(state);
    var last = s.step;
    var doneCount = list.filter(function (st) { return st.done[last]; }).length;
    var next = Math.min(last + 1, LAST_STAGE);
    var day = new Date(s.closedAt || Date.now());
    var opts = '';
    for (var i = 1; i <= LAST_STAGE; i++) opts += '<option value="' + i + '"' + (i === next ? ' selected' : '') + '>' + i + '단계 · ' + esc(STAGES[i].name) + '</option>';

    app.innerHTML =
      '<div class="wrap" style="max-width:560px;padding-top:40px;">' +
      '  <div class="card">' +
      '    <h2>수업 코드 ' + s.code + '</h2>' +
      '    <p class="muted">지난 수업(' + (day.getMonth() + 1) + '월 ' + day.getDate() + '일): ' + list.length + '명 중 ' + doneCount + '명이 ' + last + '단계까지 끝냈어요.</p>' +
      '    <label class="opt on" id="o-cont"><b>▶ 이어서 시작 · ' + next + '단계 ' + esc(STAGES[next].name) + '부터</b>' +
      '      <div class="muted">지난 시간 답은 그대로 남고, 지난 단계는 학생이 다시 볼 수 있어요.</div>' +
      '      <div class="row" style="margin-top:6px;font-size:14px;"><input type="checkbox" id="r-lock" checked> 화면을 잠근 채로 열기 (지난 시간 돌아보기용)</div></label>' +
      '    <label class="opt" id="o-new"><b>↺ 처음부터 시작</b><div class="muted">새 반에서 쓸 때. 새 수업 코드로 1단계부터 열려요.</div></label>' +
      '    <details style="margin:6px 0 12px;"><summary class="muted" style="cursor:pointer;">다른 단계부터 열기</summary>' +
      '      <div class="row" style="margin-top:6px;"><select id="r-pick">' + opts + '</select><span class="muted">계획이 바뀌었을 때만</span></div></details>' +
      '    <button class="btn primary" id="r-go">수업 열기 →</button>' +
      '  </div>' +
      '</div>';

    var mode = 'cont';
    var oc = document.getElementById('o-cont'), on = document.getElementById('o-new');
    oc.onclick = function () { mode = 'cont'; oc.classList.add('on'); on.classList.remove('on'); };
    on.onclick = function () { mode = 'new'; on.classList.add('on'); oc.classList.remove('on'); };

    document.getElementById('r-go').onclick = function () {
      if (mode === 'new') {
        if (!confirm('새 수업 코드로 처음부터 시작할까요? 지난 수업의 학생 기록은 지워져요.')) return;
        Sync.update(function (st) {
          st.session = { code: newCode(), step: 1, locked: false, openedAt: Date.now() };
          st.students = {};
        });
        return;
      }
      var step = +document.getElementById('r-pick').value;
      var lock = document.getElementById('r-lock').checked;
      Sync.update(function (st) {
        var ss = st.session;
        ss.closed = false;
        ss.step = step;
        ss.locked = lock;
        ss.resumed = lock;
        ss.lockNote = lock ? '곧 ' + step + '단계가 시작돼요.' : '';
      });
    };
  }

  // ---------- 수업 열기 ----------

  function drawStart() {
    app.innerHTML =
      '<div class="wrap" style="max-width:520px;padding-top:40px;">' +
      '  <div class="card">' +
      '    <h1>삼각형이 품은 가장 큰 원 · 교사 화면</h1>' +
      '    <p class="muted">수업을 열면 수업 코드가 만들어져요. 학생은 그 코드로 들어와요.</p>' +
      '    <button class="btn primary" id="open">새 수업 열기</button>' +
      '  </div>' +
      '</div>';
    document.getElementById('open').onclick = function () {
      Sync.update(function (state) {
        state.session = { code: newCode(), step: 1, locked: false, openedAt: Date.now() };
        state.students = {};
      });
    };
  }

  // ---------- 서술 답 모아 보기 ----------

  // 단계 n에서 교사 화면에 보여 줄 학생 답 (3·5단계는 정답으로 판정된 답만)
  function collectAnswers(list, n) {
    var out = [];
    list.forEach(function (st) {
      var a = st.answers[n] || {};
      var who = st.cls + '-' + st.num + ' ' + st.name;
      var text = null;
      if (n === 2 && a.submitted) text = a.choice + ' – ' + a.why;
      if ((n === 3 || n === 5) && a.correct) text = a.text;
      if (n === 4) text = a.q2;
      if (n === 8) text = a.c3;
      if (n === 9) text = a.me;
      if (text) out.push({ who: who, text: text, think: false });
      if (a.think) out.push({ who: who, text: a.think, think: true });
    });
    return out;
  }

  function answersCard(list, s) {
    var n = answerStage || s.step;
    shown = collectAnswers(list, n);
    var opts = '';
    for (var i = 1; i <= LAST_STAGE; i++) opts += '<option value="' + i + '"' + (i === n ? ' selected' : '') + '>' + i + '단계 · ' + esc(STAGES[i].name) + '</option>';
    var items = shown.map(function (x, i) {
      return '<div class="ans-row"><div class="ans-who">' + esc(x.who) + (x.think ? ' <span class="tag">더 생각해 보기</span>' : '') + '</div>' +
        '<div class="ans-text">' + esc(x.text) + '</div><button class="btn small" data-p="' + i + '">띄우기</button></div>';
    }).join('');
    return '<div class="card">' +
      '  <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">서술 답 모아 보기</h3><select id="ans-stage">' + opts + '</select></div>' +
      '  <p class="muted" style="margin:4px 0 0;">' + (n === 3 || n === 5 ? '정답으로 판정된 답만 보여요.' : '') + (answerStage ? '' : ' 현재 단계를 따라가요.') + '</p>' +
      (items || '<p class="muted">아직 들어온 답이 없어요.</p>') +
      '</div>';
  }

  // ---------- 정답률 (첫 답 기준) ----------

  function bar(label, okCount, total) {
    var p = total ? Math.round(okCount / total * 100) : 0;
    return '<div class="rate"><div class="row" style="justify-content:space-between;"><span>' + label + '</span>' +
      '<b>' + (total ? okCount + ' / ' + total + '명 (' + p + '%)' : '<span class="muted">아직 답 없음</span>') + '</b></div>' +
      '<div class="rate-track"><div class="rate-fill' + (p < 50 ? ' low' : '') + '" style="width:' + p + '%"></div></div></div>';
  }

  function rateOf(list, get, ok) {
    var vals = list.map(get).filter(function (v) { return v !== undefined && v !== null; });
    return { ok: vals.filter(ok).length, n: vals.length, vals: vals };
  }

  function ratesCard(list) {
    function first(st, n) { return (st.answers[n] && st.answers[n].first) || {}; }
    var html = '';

    html += '<h4>1단계 용어 빈칸</h4>';
    ['① 접한다', '② 접선', '③ 접점', '④ 수직'].forEach(function (label, i) {
      var r = rateOf(list, function (st) { return first(st, 1)[i]; }, function (v) { return v === true; });
      html += bar(label, r.ok, r.n);
    });

    var r2 = rateOf(list, function (st) { return st.answers[2] && st.answers[2].first; }, function (v) { return v === '무수히 많다'; });
    var cnt = { '1개': 0, '5개': 0, '무수히 많다': 0 };
    r2.vals.forEach(function (v) { cnt[v] = (cnt[v] || 0) + 1; });
    html += '<h4>2단계 몇 개?</h4>' + bar('무수히 많다', r2.ok, r2.n) +
      '<div class="muted" style="font-size:13px;">고른 답: 1개 ' + cnt['1개'] + '명 · 5개 ' + cnt['5개'] + '명 · 무수히 많다 ' + cnt['무수히 많다'] + '명</div>';

    html += '<h4>8단계 증명 칸</h4>';
    [['s1', 'IE = IF', '칸 1-1 (∠A)'], ['s2', 'ID = IF', '칸 1-2 (∠B)'],
     ['s3', '각의 이등분선 위의 한 점에서 그 각의 두 변까지의 거리는 같다', '칸 1 근거'], ['s4', 'ID = IE = IF', '칸 2']].forEach(function (q) {
      var r = rateOf(list, function (st) { return first(st, 8)[q[0]]; }, function (v) { return v === q[1]; });
      html += bar(q[2], r.ok, r.n);
    });

    html += '<h4>9단계 정리 문장</h4>';
    [['a1', '내각의 이등분선', '첫 칸 (내각의 이등분선)'], ['a2', '변', '둘째 칸 (변)']].forEach(function (q) {
      var r = rateOf(list, function (st) { return first(st, 9)[q[0]]; }, function (v) { return v === q[1]; });
      html += bar(q[2], r.ok, r.n);
    });

    return '<div class="card"><h3>정답률 <span class="muted">(첫 답 기준)</span></h3>' + html + '</div>';
  }

  // ---------- 화면 이탈 ----------

  function awayCell(st) {
    if (!st.awayCount) return '<td class="st-miss">–</td>';
    var ms = (st.awayMs || 0) + (st.away && st.awaySince ? Date.now() - st.awaySince : 0);
    var sec = Math.round(ms / 1000);
    var time = Math.floor(sec / 60) + '분 ' + (sec % 60) + '초';
    return '<td class="away-cell">' + (st.away ? '<span class="away-now">지금 벗어남</span> ' : '') + st.awayCount + '회 · ' + time + '</td>';
  }

  // ---------- 대시보드 ----------

  function drawDash(state) {
    var s = state.session;
    var list = studentList(state);
    var doneCount = list.filter(function (st) { return st.done[s.step]; }).length;

    var rows = list.map(function (st) {
      var cells = '';
      for (var i = 1; i <= LAST_STAGE; i++) {
        if (st.done[i]) cells += '<td class="st-done">✓</td>';
        else if (i === s.step) cells += '<td class="st-now">●</td>';
        else if (i < s.step) cells += '<td class="st-miss">–</td>';
        else cells += '<td class="st-lock">🔒</td>';
      }
      return '<tr' + (st.away ? ' class="row-away"' : '') + '><td>' + st.cls + '-' + st.num + '</td><td class="name">' + esc(st.name) + '</td>' + cells + awayCell(st) + '</tr>';
    }).join('');

    var heads = '';
    for (var i = 1; i <= LAST_STAGE; i++) heads += '<th title="' + esc(STAGES[i].name) + '">' + i + '</th>';
    heads += '<th>화면 이탈</th>';

    app.innerHTML =
      '<div class="wrap">' +
      '  <div class="card tbar">' +
      '    <div><div class="label">수업 코드</div><div class="code">' + s.code + '</div></div>' +
      '    <div><div class="label">접속</div><div style="font-size:20px;font-weight:700;">' + list.length + '명</div></div>' +
      '    <div class="grow"><div class="label">현재 단계</div><div style="font-size:17px;font-weight:700;">' + s.step + '단계 · ' + esc(STAGES[s.step].name) + '</div>' +
      '      <div class="label">끝낸 학생 ' + doneCount + ' / ' + list.length + '</div></div>' +
      '    <button class="btn primary" id="next"' + (s.step >= LAST_STAGE ? ' disabled' : '') + '>다음 단계 →</button>' +
      '    <button class="btn ' + (s.locked ? 'warn' : '') + '" id="lock">' + (s.locked ? '잠금 풀기' : '화면 잠그기') + '</button>' +
      '  </div>' +
      (s.locked
        ? '  <div class="notice">' + (s.resumed
          ? '학생 화면이 잠겨 있어요. [발표용 띄우기]로 3·5단계 답을 함께 보며 지난 시간을 돌아본 뒤 잠금을 풀어 주세요.'
          : '학생 화면이 잠겨 있어요. 설명을 마치면 [잠금 풀기]를 눌러 주세요.') + '</div>'
        : '') +
      '  <div class="card row">' +
      '    <span class="muted">단계 화면 보기 (교사 창에서만)</span>' +
      '    <nav class="chips">' + stageChips(null, s.step) + '</nav>' +
      '  </div>' +
      '  <div class="card">' +
      '    <h3>학생별 진행</h3>' +
      '    <div class="legend"><span class="st-done">✓ 끝냄</span><span class="st-now">● 하는 중</span><span class="st-miss">– 못 끝내고 지나감</span><span class="st-lock">🔒 잠김</span></div>' +
      (list.length
        ? '    <table class="prog"><tr><th>반-번호</th><th class="name">이름</th>' + heads + '</tr>' + rows + '</table>'
        : '    <p class="muted">아직 들어온 학생이 없어요.</p>') +
      '  </div>' +
      '  <div class="tgrid">' + answersCard(list, s) + ratesCard(list) + '</div>' +
      (projecting
        ? '<div class="proj"><div class="proj-label">' + projecting.stage + '단계 · ' + esc(STAGES[projecting.stage].name) + ' · 학생 답 (이름 가림)</div>' +
          '<div class="proj-text">' + esc(projecting.text) + '</div><button class="btn" id="proj-close">닫기</button></div>'
        : '') +
      '  <div class="card row">' +
      '    <button class="btn small" id="close">수업 마치기</button>' +
      '    <span class="muted" style="margin-right:auto;">시연용 도구 →</span>' +
      '    <button class="btn small" id="open-student">학생 창 새로 열기</button>' +
      '    <button class="btn small" id="reset">시연 기록 모두 지우기</button>' +
      '  </div>' +
      '</div>';

    document.getElementById('next').onclick = function () {
      Sync.update(function (st) { if (st.session.step < LAST_STAGE) st.session.step += 1; });
    };
    document.getElementById('lock').onclick = function () {
      Sync.update(function (st) {
        st.session.locked = !st.session.locked;
        if (!st.session.locked) { st.session.resumed = false; st.session.lockNote = ''; }
      });
    };
    document.getElementById('close').onclick = function () {
      if (!confirm('오늘 수업을 마칠까요? 학생 화면에 "오늘 수업이 끝났어요"가 나오고, 다음 시간에 이어서 열 수 있어요.')) return;
      Sync.update(function (st) { st.session.closed = true; st.session.closedAt = Date.now(); st.session.locked = false; });
    };
    bindChips();
    document.getElementById('ans-stage').onchange = function () {
      var v = +this.value;
      answerStage = v === s.step ? null : v;
      render(Sync.get());
    };
    app.querySelectorAll('button[data-p]').forEach(function (b) {
      b.onclick = function () {
        projecting = { stage: answerStage || s.step, text: shown[+b.dataset.p].text };
        render(Sync.get());
      };
    });
    if (projecting) {
      document.getElementById('proj-close').onclick = function () { projecting = null; render(Sync.get()); };
    }
    document.getElementById('open-student').onclick = function () {
      window.open('student.html', '_blank', 'width=900,height=800');
    };
    document.getElementById('reset').onclick = function () {
      if (confirm('시연 기록(수업 코드, 학생, 답)을 모두 지울까요?')) Sync.reset();
    };
  }

  Sync.subscribe(render);
  render(Sync.get());
})();
