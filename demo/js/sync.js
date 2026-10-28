// 학생 탭과 교사 탭을 잇는 부분
// 시연판: 이 컴퓨터 브라우저의 localStorage에 저장하고, 다른 탭의 변경은 storage 이벤트로 받는다.
// 나중에 이 파일만 구글 Apps Script용으로 바꾼다. (get / update / subscribe / reset 이름은 그대로 둔다)

var Sync = (function () {
  var KEY = 'incenter-demo-v1';
  var listeners = [];

  function empty() {
    return { session: null, students: {} };
  }

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || empty();
    } catch (e) {
      return empty();
    }
  }

  function notify(state) {
    listeners.forEach(function (fn) { fn(state); });
  }

  window.addEventListener('storage', function (e) {
    if (e.key === KEY) notify(read());
  });

  return {
    get: read,
    update: function (change) {
      var state = read();
      change(state);
      localStorage.setItem(KEY, JSON.stringify(state));
      notify(state);
    },
    subscribe: function (fn) {
      listeners.push(fn);
    },
    reset: function () {
      localStorage.removeItem(KEY);
      notify(empty());
    }
  };
})();
