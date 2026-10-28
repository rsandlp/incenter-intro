// 9단계 · 정리
// 핵심 문장 고르기(칸마다 다른 오답 힌트) + 내 말로 한 줄 + 내가 쓴 답 다시 보기(3·4·5·8단계) + 필수문제 안내
// 끝냄: [제출하기] 성공 (두 칸 정답 + 한 줄 작성) → "오늘 활동을 모두 마쳤어요"

Stages[9] = {
  mount: function (area, api) {
    var saved = api.answers;
    var all = api.all || {};
    var first = saved.first || {};
    var finishing = false;
    var B = [
      { id: 'a1', ok: '내각의 이등분선', opts: ['변의 수직이등분선', '내각의 이등분선', '중선'], hint: '8단계 그림에서 점 I를 지나는 세 선을 떠올려 보세요.' },
      { id: 'a2', ok: '변', opts: ['꼭짓점', '변'], hint: '7단계에서 내심으로부터 같은 거리였던 것은 무엇이었나요?' }
    ];

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
    }
    function sel(b) {
      return '<select id="s9-' + b.id + '"><option value="">선택</option>' + b.opts.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select>';
    }
    function mine(label, text) {
      return '<div class="mine"><div class="muted">' + label + '</div><div>' + (text ? esc(text) : '<span class="muted">(아직 쓴 답이 없어요)</span>') + '</div></div>';
    }

    area.innerHTML =
      '<h2 style="margin:4px 0 10px;">9단계 · 정리' + (api.review ? ' <span class="muted">(다시 보기)</span>' : '') + '</h2>' +
      '<section class="card"><h3>🔖 오늘 알게 된 내심의 성질</h3>' +
      '  <p class="para">삼각형의 내심은 세 ' + sel(B[0]) + '의 교점이고, 내심에서 세 ' + sel(B[1]) + '까지의 거리는 모두 같다.</p>' +
      '  <div class="hintline" id="s9-h"></div></section>' +
      '<section class="card"><h3>내 말로 한 줄 정리</h3>' +
      '  <p class="muted" style="margin-top:0;">오늘 활동에서 가장 기억에 남는 것, 또는 아직 궁금한 것을 적어 보세요.</p>' +
      '  <textarea id="s9-me" placeholder="삼각형 안에 가장 큰 원을 그리려면..."></textarea></section>' +
      '<details class="card"><summary style="cursor:pointer;font-weight:700;">내가 쓴 답 다시 보기</summary>' +
      mine('3단계 · 중심들의 공통점', all[3] && all[3].text) +
      mine('4단계 · 또 다른 원을 그리려면', all[4] && all[4].q2) +
      mine('5단계 · 그 원의 중심과 반지름', all[5] && all[5].text) +
      mine('8단계 · CI가 ∠C의 이등분선인 이유', all[8] && all[8].c3) +
      '</details>' +
      '<section class="card" style="background:var(--accent-bg);border-color:var(--accent);color:#1e40af;"><b>📘 필수문제</b> 교과서 162쪽 1번 · 163쪽 2번 – 수업 시간에 바로 풀어요.</section>' +
      '<div class="row"><button class="btn primary" id="s9-go">제출하기</button><span class="msg" id="s9-msg"></span></div>';

    var me = document.getElementById('s9-me');
    me.value = saved.me || '';
    B.forEach(function (b) {
      var s = document.getElementById('s9-' + b.id);
      s.value = saved[b.id] || '';
      s.addEventListener('change', function () { s.classList.remove('bad'); document.getElementById('s9-h').innerHTML = ''; document.getElementById('s9-msg').textContent = ''; });
    });
    me.addEventListener('input', function () { me.classList.remove('bad'); document.getElementById('s9-msg').textContent = ''; });

    document.getElementById('s9-go').onclick = function () {
      var msg = document.getElementById('s9-msg');
      var sels = B.map(function (b) { return document.getElementById('s9-' + b.id); });
      var empty = false;
      sels.forEach(function (s) { if (!s.value) { s.classList.add('bad'); empty = true; } });
      if (!me.value.trim()) { me.classList.add('bad'); empty = true; }
      if (empty) { msg.className = 'msg bad'; msg.textContent = '빈칸을 모두 채워 주세요.'; return; }

      var hints = [];
      B.forEach(function (b, i) {
        var ok = sels[i].value === b.ok;
        if (first[b.id] === undefined) { first[b.id] = sels[i].value; api.save('first', first); }
        api.save(b.id, sels[i].value);
        sels[i].classList.toggle('ok', ok);
        sels[i].classList.toggle('bad', !ok);
        if (!ok) hints.push(b.hint);
      });
      api.save('me', me.value.trim());
      if (hints.length) {
        document.getElementById('s9-h').innerHTML = hints.map(function (h) { return '<div>' + h + '</div>'; }).join('');
        msg.textContent = '';
        return;
      }
      msg.className = 'msg ok';
      msg.textContent = '제출했어요.';
      if (!api.review && !finishing) { finishing = true; setTimeout(api.finish, 1000); }
    };
  }
};
