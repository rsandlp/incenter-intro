// 단계 파일들이 함께 쓰는 계산(Geo)과 그림 그리기 도구(Svg)

var Geo = {
  dist: function (p, q) {
    return Math.hypot(p.x - q.x, p.y - q.y);
  },

  unit: function (v) {
    var l = Math.hypot(v.x, v.y);
    return { x: v.x / l, y: v.y / l };
  },

  // 점 p에서 직선 AB에 내린 수선의 발 (t: A에서 B 방향으로 얼마나 갔는지, 0~1이면 선분 위)
  foot: function (p, a, b) {
    var vx = b.x - a.x, vy = b.y - a.y;
    var t = ((p.x - a.x) * vx + (p.y - a.y) * vy) / (vx * vx + vy * vy);
    return { x: a.x + t * vx, y: a.y + t * vy, t: t };
  },

  // 점 p와 직선 AB 사이의 거리
  distToLine: function (p, a, b) {
    return Geo.dist(p, Geo.foot(p, a, b));
  },

  // 삼각형 ABC의 내심
  incenter: function (A, B, C) {
    var a = Geo.dist(B, C), b = Geo.dist(C, A), c = Geo.dist(A, B);
    return { x: (a * A.x + b * B.x + c * C.x) / (a + b + c), y: (a * A.y + b * B.y + c * C.y) / (a + b + c) };
  }
};

var Svg = {
  NS: 'http://www.w3.org/2000/svg',

  // 도형 하나 만들기: Svg.el('circle', { cx: 10, cy: 10, r: 5 }, 부모)
  el: function (tag, attrs, parent) {
    var e = document.createElementNS(Svg.NS, tag);
    Svg.set(e, attrs);
    if (parent) parent.appendChild(e);
    return e;
  },

  set: function (e, attrs) {
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  },

  text: function (parent, x, y, str, style) {
    var t = Svg.el('text', { x: x, y: y }, parent);
    t.textContent = str;
    if (style) t.setAttribute('style', style);
    return t;
  },

  // 화면에서 누른 위치를 그림 좌표로 바꾸기
  point: function (svg, evt) {
    var p = svg.createSVGPoint();
    p.x = evt.clientX;
    p.y = evt.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  },

  // 직각 기호: foot(직각인 점), along(그 직선 방향 단위벡터), toward(직각인 다른 선이 향하는 점)
  rightAngle: function (parent, foot, along, toward, size, color, width) {
    var n = Geo.unit({ x: toward.x - foot.x, y: toward.y - foot.y });
    var q = size || 10;
    return Svg.el('polyline', {
      points: [foot.x + q * along.x, foot.y + q * along.y,
               foot.x + q * along.x + q * n.x, foot.y + q * along.y + q * n.y,
               foot.x + q * n.x, foot.y + q * n.y].join(' '),
      fill: 'none', stroke: color || '#D85A30', 'stroke-width': width || 1.5
    }, parent);
  },

  // 끌기 손잡이 연결: 누르면 onStart(그림 좌표), 움직이는 동안 onMove(그림 좌표), 놓으면 onEnd
  drag: function (svg, handle, onMove, onEnd, onStart) {
    var dragging = false;
    handle.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      try { handle.setPointerCapture(e.pointerId); } catch (err) { /* 잡기 실패해도 끌기는 계속 */ }
      dragging = true;
      if (onStart) onStart(Svg.point(svg, e));
    });
    handle.addEventListener('pointermove', function (e) {
      if (dragging) onMove(Svg.point(svg, e));
    });
    function stop() {
      if (!dragging) return;
      dragging = false;
      if (onEnd) onEnd();
    }
    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);
  }
};
