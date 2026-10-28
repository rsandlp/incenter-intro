// 학생 화면: 입장, 단계 이동, 지난 단계 다시 보기, 대기 화면, 잠금 화면, 화면 이탈 기록

(function () {
  var app = document.getElementById('app');
  var me = sessionStorage.getItem('incenter-me'); // 탭마다 따로 기억 → 탭 여러 개 = 학생 여러 명
  var viewing = null;   // 지난 단계를 다시 보는 중이면 그 단계 번호
  var lastStep = null;
  var shownKey = '';    // 같은 화면이면 활동 영역을 다시 그리지 않는다

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function myRecord(state) {
    return me && state.students[me];
  }

  // ---------- 화면 고르기 ----------

  function render(state) {
    var s = state.session;
    var st = myRecord(state);

    if (!s || !st) {
      if (shownKey !== 'join') showJoin();
      document.getElementById('join-notice').textContent = s ? '' : '아직 수업이 열리지 않았어요. 선생님이 수업을 열면 들어올 수 있어요.';
      return;
    }

    if (s.closed) {
      // 교사가 [수업 마치기]를 누른 뒤: 다음 차시까지 기다림
      if (shownKey !== 'closed') {
        shownKey = 'closed';
        app.innerHTML =
          '<div class="wrap" style="max-width:520px;padding-top:60px;"><div class="card waiting">' +
          '<h1>오늘 수업이 끝났어요</h1>' +
          '<p class="muted">다음 시간에 같은 반·번호·이름으로 들어오면 이어서 할 수 있어요.</p></div></div>';
      }
      return;
    }

    if (lastStep !== s.step) {
      viewing = null; // 선생님이 다음 단계를 열면 모두 현재 단계로
      lastStep = s.step;
    }

    if (shownKey === 'join' || shownKey === 'closed' || !document.getElementById('stage')) showFrame();

    drawTop(s, st);
    document.getElementById('lock').classList.toggle('hidden', !s.locked);
    document.getElementById('lock-note').textContent = s.lockNote || '잠시 활동이 멈췄어요.';

    var n = viewing || s.step;
    var key = n + '|' + (viewing ? 'review' : '') + '|' + (st.done[n] ? 'done' : '');
    if (key !== shownKey) {
      shownKey = key;
      var area = document.getElementById('stage');
      area.innerHTML = '';
      if (viewing) drawStage(area, viewing, true);
      else if (st.done[n]) drawWaiting(area, n, st);
      else drawStage(area, n, false);
    }
  }

  // ---------- 입장 ----------

  function showJoin() {
    shownKey = 'join';
    app.innerHTML =
      '<div class="wrap" style="max-width:480px;padding-top:40px;">' +
      '  <div class="card">' +
      '    <h1>삼각형이 품은 가장 큰 원</h1>' +
      '    <p class="muted">선생님이 알려 준 수업 코드와 반·번호·이름을 입력하세요.</p>' +
      '    <div class="field"><label for="j-code">수업 코드</label><input type="text" id="j-code" autocomplete="off" style="text-transform:uppercase;letter-spacing:3px;"></div>' +
      '    <div class="row">' +
      '      <div class="field" style="flex:1"><label for="j-cls">반</label><input type="number" id="j-cls" min="1"></div>' +
      '      <div class="field" style="flex:1"><label for="j-num">번호</label><input type="number" id="j-num" min="1"></div>' +
      '    </div>' +
      '    <div class="field"><label for="j-name">이름</label><input type="text" id="j-name"></div>' +
      '    <p class="muted">활동 화면을 벗어나면 선생님 화면에 표시돼요.</p>' +
      '    <button class="btn primary" id="j-go" style="width:100%">들어가기</button>' +
      '    <div class="msg bad" id="j-msg"></div>' +
      '    <div class="msg" id="join-notice"></div>' +
      '  </div>' +
      '</div>';

    document.getElementById('j-go').onclick = join;
    app.querySelectorAll('input').forEach(function (el) {
      el.addEventListener('input', function () { document.getElementById('j-msg').textContent = ''; });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter') join(); });
    });
  }

  function join() {
    var code = document.getElementById('j-code').value.trim().toUpperCase();
    var cls = document.getElementById('j-cls').value.trim();
    var num = document.getElementById('j-num').value.trim();
    var name = document.getElementById('j-name').value.trim();
    var msg = document.getElementById('j-msg');
    var s = Sync.get().session;

    if (!code || !cls || !num || !name) { msg.textContent = '빈칸을 모두 채워 주세요.'; return; }
    if (!s) { msg.textContent = '아직 수업이 열리지 않았어요.'; return; }
    if (code !== s.code) { msg.textContent = '수업 코드를 다시 확인해 주세요.'; return; }

    var id = cls + '-' + num;
    var taken = Sync.get().students[id];
    if (taken && taken.name !== name) {
      // 같은 반·번호에 다른 이름: 다른 친구 기록을 덮어쓰지 않도록 막는다 (같은 이름이면 재입장)
      msg.textContent = cls + '반 ' + num + '번에는 이미 \'' + taken.name + '\' 학생이 들어와 있어요. 반과 번호를 다시 확인해 주세요.';
      return;
    }
    Sync.update(function (state) {
      var old = state.students[id];
      state.students[id] = old || { cls: +cls, num: +num, done: {}, answers: {}, away: false, awayCount: 0, awayMs: 0 };
      state.students[id].name = name;
    });
    me = id;
    sessionStorage.setItem('incenter-me', id);
    render(Sync.get());
  }

  // ---------- 활동 화면 틀 ----------

  function showFrame() {
    shownKey = '';
    app.innerHTML =
      '<header class="topbar"><div class="wrap"><div class="who" id="who"></div><nav class="chips" id="chips"></nav></div></header>' +
      '<main class="wrap" id="stage"></main>' +
      '<div class="lock hidden" id="lock"><div class="big">선생님 화면을 보세요</div><div id="lock-note"></div></div>';
  }

  function drawTop(s, st) {
    document.getElementById('who').textContent = '2학년 ' + st.cls + '반 ' + st.num + '번 ' + st.name;
    var html = '';
    for (var i = 1; i <= LAST_STAGE; i++) {
      var cls = i < s.step ? 'past' : (i === s.step ? 'now' : 'locked');
      if (viewing === i) cls += ' viewing';
      var label = (i > s.step ? '🔒' : '') + i;
      html += '<button class="chip ' + cls + '" data-n="' + i + '" title="' + esc(STAGES[i].name) + '"' + (i > s.step ? ' disabled' : '') + '>' + label + '</button>';
    }
    var chips = document.getElementById('chips');
    chips.innerHTML = html;
    chips.querySelectorAll('button:not([disabled])').forEach(function (b) {
      b.onclick = function () {
        var n = +b.dataset.n;
        viewing = n === s.step ? null : n;
        render(Sync.get());
      };
    });
  }

  // ---------- 단계 활동 ----------

  // 단계 파일에 넘겨주는 도구: 답 저장, 끝내기
  function stageApi(n, review) {
    var st = myRecord(Sync.get());
    return {
      stage: n,
      review: review,
      answers: (st.answers[n] || {}),
      all: st.answers,          // 다른 단계의 답 (9단계 '내가 쓴 답 다시 보기'용)
      save: function (key, value) {
        Sync.update(function (state) {
          var rec = state.students[me];
          rec.answers[n] = rec.answers[n] || {};
          rec.answers[n][key] = value;
        });
      },
      finish: function () {
        Sync.update(function (state) { state.students[me].done[n] = true; });
      }
    };
  }

  function drawStage(area, n, review) {
    if (Stages[n]) {
      Stages[n].mount(area, stageApi(n, review));
      if (review) addBackButton(area);
      return;
    }
    // 아직 만들지 않은 단계: 빈 자리
    area.innerHTML =
      '<section class="card">' +
      '  <h2>' + n + '단계 · ' + esc(STAGES[n].name) + (review ? ' <span class="muted">(다시 보기)</span>' : '') + '</h2>' +
      '  <p class="muted">이 자리에 ' + n + '단계 활동이 들어가요. (묶음 ②~④에서 만듦)</p>' +
      (review ? '' : '  <button class="btn primary" id="demo-finish">이 단계 끝내기 (시연용)</button>') +
      '</section>';
    if (review) addBackButton(area);
    else document.getElementById('demo-finish').onclick = function () { stageApi(n, false).finish(); };
  }

  function addBackButton(area) {
    var b = document.createElement('button');
    b.className = 'btn';
    b.textContent = '지금 단계로 돌아가기';
    b.onclick = function () { viewing = null; render(Sync.get()); };
    area.appendChild(b);
  }

  // ---------- 대기 화면 ----------

  function drawWaiting(area, n, st) {
    if (n === LAST_STAGE) {
      area.innerHTML =
        '<section class="card waiting">' +
        '  <h1>오늘 활동을 모두 마쳤어요</h1>' +
        '  <div class="bridge" style="text-align:center;">이제 교과서 필수문제를 풀어 보세요. (162쪽 1번 · 163쪽 2번)</div>' +
        '</section>';
      return;
    }

    var html =
      '<section class="card waiting">' +
      '  <h2>잘했어요. 친구들을 잠시 기다려요.</h2>' +
      '  <p class="muted">선생님이 다음 단계를 열면 자동으로 넘어가요.</p>';

    if (n === 7) {
      html += '<div class="bridge">' + BRIDGE_TO_8.join('<br>') + '</div>';
    } else if (STAGES[n].think) {
      var saved = (st.answers[n] && st.answers[n].think) || '';
      html +=
        '<div class="think">' +
        '  <h3>더 생각해 보기</h3>' +
        '  <p>' + esc(STAGES[n].think) + '</p>' +
        '  <textarea id="think" placeholder="생각을 적어 보세요 (제출은 하고 싶을 때만)">' + esc(saved) + '</textarea>' +
        '  <div class="row" style="margin-top:6px;"><button class="btn" id="think-go">제출하기</button><span class="msg" id="think-msg"></span></div>' +
        '</div>';
    }
    html += '</section>';
    area.innerHTML = html;

    var go = document.getElementById('think-go');
    if (go) {
      go.onclick = function () {
        var v = document.getElementById('think').value.trim();
        var m = document.getElementById('think-msg');
        if (!v) { m.className = 'msg bad'; m.textContent = '생각을 먼저 적어 주세요.'; return; }
        stageApi(n, false).save('think', v);
        m.className = 'msg ok';
        m.textContent = '제출했어요.';
      };
    }
  }

  // ---------- 화면 이탈 기록 ----------

  document.addEventListener('visibilitychange', function () {
    if (!myRecord(Sync.get())) return;
    Sync.update(function (state) {
      var rec = state.students[me];
      if (!rec) return;
      if (document.hidden) {
        rec.away = true;
        rec.awayCount += 1;
        rec.awaySince = Date.now();   // 교사 화면이 '지금 벗어난 시간'까지 계산할 수 있게 저장
      } else {
        rec.away = false;
        if (rec.awaySince) rec.awayMs += Date.now() - rec.awaySince;
        rec.awaySince = 0;
      }
    });
  });

  Sync.subscribe(render);
  render(Sync.get());
})();
