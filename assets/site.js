(function () {
  var d = document, root = d.documentElement, q = function (s, x) { return (x || d).querySelector(s); },
    qa = function (s, x) { return [].slice.call((x || d).querySelectorAll(s)); },
    still = matchMedia('(prefers-reduced-motion:reduce)').matches,
    fine = matchMedia('(hover:hover) and (pointer:fine)').matches,
    S = window.SITE || {}, mouse = { x: -999, y: -999 };
  root.classList.add('js');
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* menu */
  var btn = q('#menu-btn'), nav = q('#nav');
  function shut() { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); d.body.style.overflow = ''; }
  btn.addEventListener('click', function () { var o = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', o); d.body.style.overflow = o ? 'hidden' : ''; });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) shut(); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') shut(); });

  /* people lists */
  qa('[data-list]').forEach(function (box) {
    var key = box.dataset.list, list = S[key] || [];
    if (!list.length) { box.innerHTML = '<p class="empty">' + esc((S.empty || {})[key] || 'Coming soon.') + '</p>'; return; }
    box.innerHTML = list.map(function (p) {
      var ini = esc((p.name || '?').split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase());
      var ph = p.photo ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async">' : '<span aria-hidden="true">' + ini + '</span>';
      var inner = '<div class="ph">' + ph + '</div><div class="pi"><b>' + esc(p.name) + '</b><span>' + esc(p.role) + '</span>' + (p.topic ? '<i>' + esc(p.topic) + '</i>' : '') + '</div>';
      return p.link ? '<a class="person tilt rv" href="' + esc(p.link) + '" target="_blank" rel="noopener noreferrer">' + inner + '</a>' : '<div class="person tilt rv">' + inner + '</div>';
    }).join('');
  });

  /* photo marquee: two rows, opposite directions */
  var g = S.gallery || [], rows = [q('#mq1'), q('#mq2')];
  function fill(row, list) {
    if (!list.length) { row.remove(); return; }
    var one = list.map(function (src) { return '<figure><img src="' + esc(src) + '" alt="Photo from a past event" loading="lazy" decoding="async"></figure>'; }).join('');
    var reps = Math.max(2, Math.ceil(8 / list.length)); if (reps % 2) reps++;
    row.innerHTML = new Array(reps + 1).join(one);
  }
  var ev = g.filter(function (_, i) { return i % 2 === 0; }), od = g.filter(function (_, i) { return i % 2 === 1; });
  fill(rows[0], ev.length ? ev : g); if (rows[1]) fill(rows[1], od.length ? od : g.slice().reverse());

  /* hero headline: letters rise in, second line scrambles in */
  var l1 = q('.l1'), l2 = q('.l2'), l2text = l2.dataset.text;
  if (!still) {
    var t1 = l1.textContent; l1.setAttribute('aria-label', t1); l1.textContent = '';
    t1.split(' ').forEach(function (w, wi, a) {
      var wd = d.createElement('span'); wd.style.cssText = 'display:inline-block;white-space:nowrap'; wd.setAttribute('aria-hidden', 'true');
      w.split('').forEach(function (c, ci) { var s = d.createElement('span'); s.className = 'ch'; s.textContent = c; s.style.transitionDelay = ((wi * 5 + ci) * 0.045) + 's'; wd.appendChild(s); });
      l1.appendChild(wd); if (wi < a.length - 1) l1.appendChild(d.createTextNode(' '));
    });
    l2.textContent = '';
  }
  function scramble() {
    if (still) return; var chars = '!<>-_/[]{}=+*^?#', n = 0, tot = 34;
    var t = setInterval(function () {
      n++; var out = ''; for (var i = 0; i < l2text.length; i++) out += (l2text[i] === ' ' || i < l2text.length * n / tot) ? l2text[i] : chars[Math.floor(Math.random() * chars.length)];
      l2.textContent = out; if (n >= tot) { clearInterval(t); l2.textContent = l2text; }
    }, 40);
  }
  function finish() { qa('.hero .rv').forEach(function (e, i) { setTimeout(function () { e.classList.add('in'); if (i === 0) scramble(); }, 150 + i * 160); }); if (still) l2.textContent = l2text; }

  /* loader */
  var bar0 = q('.loader em');
  if (root.classList.contains('pl')) {
    var n = 0, tm = setInterval(function () {
      n = Math.min(100, n + Math.ceil(Math.random() * 10)); bar0.style.width = n + '%';
      if (n >= 100) { clearInterval(tm); setTimeout(function () { root.classList.add('go'); try { sessionStorage.setItem('seen', '1'); } catch (e) {} setTimeout(function () { root.classList.remove('pl', 'go'); }, 800); finish(); }, 300); }
    }, 50);
  } else finish();

  /* reveal on scroll, with stagger inside grids */
  qa('.grid4,.people,.stats,.sched').forEach(function (p) { qa('.rv', p).forEach(function (e, i) { e.style.transitionDelay = (i % 4) * 90 + 'ms'; }); });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; var el = e.target; io.unobserve(el); el.classList.add('in');
      var b = q('b[data-n]', el); if (b) count(b);
    });
  }, { threshold: .12 });
  qa('.rv').forEach(function (e) { if (!e.closest('.hero')) io.observe(e); });
  function count(b) {
    var to = +b.dataset.n, pre = b.dataset.p || '', suf = b.dataset.s || '', s = performance.now();
    (function step(now) { var k = Math.min(1, (now - s) / 1500); b.textContent = pre + Math.round(to * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(step); })(s);
  }

  /* scroll: progress bar, header, scrollspy, back to top, hero parallax */
  var bar = q('#bar'), hd = q('#top'), up = q('.totop'), hero = q('.hero .wrap'), tick = false,
    links = qa('.nav a[href^="#"]').filter(function (a) { return !a.classList.contains('cta'); }),
    secs = links.map(function (a) { return q(a.getAttribute('href')); });
  window.__sy = 0;
  function onScroll() {
    tick = false; var y = scrollY, max = root.scrollHeight - innerHeight; window.__sy = y;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    hd.classList.toggle('stick', y > 20); up.classList.toggle('show', y > 700);
    var cur = -1; secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * .4) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('active', i === cur); });
    if (!still && y < innerHeight) hero.style.transform = 'translateY(' + y * 0.18 + 'px)';
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true }); onScroll();

  /* pointer effects: ring cursor, magnetic buttons, card tilt */
  if (fine && !still) {
    var ring = q('.cur'), rx = 0, ry = 0;
    addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; ring.classList.add('on'); }, { passive: true });
    d.addEventListener('mouseleave', function () { ring.classList.remove('on'); mouse.x = mouse.y = -999; });
    (function loop() { rx += (mouse.x - rx) * .18; ry += (mouse.y - ry) * .18; ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)'; requestAnimationFrame(loop); })();
    d.addEventListener('pointerover', function (e) { ring.classList.toggle('big', !!e.target.closest('a,button')); });
    qa('.btn,.cta,.totop').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .25 + 'px,' + (e.clientY - r.top - r.height / 2) * .35 + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
    d.addEventListener('pointermove', function (e) {
      var c = e.target.closest('.tilt'); qa('.tilt.hot').forEach(function (t) { if (t !== c) { t.classList.remove('hot'); t.style.transform = ''; } });
      if (!c) return; c.classList.add('hot'); var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = 'perspective(800px) rotateY(' + x * 10 + 'deg) rotateX(' + -y * 10 + 'deg) translateY(-6px)';
    });
  }

  /* background: particles that link up and react to the pointer, plus turning wireframe cubes */
  (function () {
    var cv = q('#bg'), cx = cv.getContext('2d'), W, H, dpr = Math.min(devicePixelRatio || 1, 2), P = [], C = [], run = true;
    function size() {
      W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = W < 700 ? 36 : 85; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + .5, vx: (Math.random() - .5) * .3, vy: -(Math.random() * .35 + .08), c: Math.random() < .55 ? '168,85,247' : '255,255,255', a: Math.random() * .6 + .25 });
      var s = W < 700 ? 1 : 1.7;
      C = [{ x: .8, y: .28, s: 62 * s, ax: .3, ay: .5, vx: .004, vy: .006 }, { x: .1, y: .72, s: 46 * s, ax: 1, ay: 2, vx: -.005, vy: .004 }, { x: .55, y: .9, s: 30 * s, ax: 2, ay: 1, vx: .006, vy: -.004 }];
    }
    var V = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]], E = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    function cube(o, sy) {
      var a = o.ax + sy * .002, sx = Math.sin(a), cxn = Math.cos(a), s2 = Math.sin(o.ay), c2 = Math.cos(o.ay);
      var pts = V.map(function (v) { var y = v[1] * cxn - v[2] * sx, z = v[1] * sx + v[2] * cxn, X = v[0] * c2 + z * s2, Z = -v[0] * s2 + z * c2, k = 3 / (3 + Z * .5); return [o.x * W + X * o.s * k, o.y * H + y * o.s * k]; });
      cx.strokeStyle = 'rgba(168,85,247,.28)'; cx.lineWidth = 1.2; cx.beginPath();
      E.forEach(function (e) { cx.moveTo(pts[e[0]][0], pts[e[0]][1]); cx.lineTo(pts[e[1]][0], pts[e[1]][1]); }); cx.stroke();
    }
    function draw() {
      cx.clearRect(0, 0, W, H); var sy = window.__sy || 0, link = W < 700 ? 80 : 120;
      C.forEach(function (o) { if (!still) { o.ax += o.vx; o.ay += o.vy; } cube(o, sy); });
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (!still) {
          var dx = p.x - mouse.x, dy = p.y - mouse.y, dd = dx * dx + dy * dy;
          if (dd < 22500) { var f = (1 - Math.sqrt(dd) / 150) * 1.6; p.x += dx / (Math.sqrt(dd) + 1) * f; p.y += dy / (Math.sqrt(dd) + 1) * f; }
          p.x += p.vx; p.y += p.vy; if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; } if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5;
        }
        cx.fillStyle = 'rgba(' + p.c + ',' + p.a + ')'; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.2832); cx.fill();
        for (var j = i + 1; j < P.length; j++) {
          var q2 = P[j], ax = p.x - q2.x, ay = p.y - q2.y, dist = ax * ax + ay * ay;
          if (dist < link * link) { cx.strokeStyle = 'rgba(168,85,247,' + (0.22 * (1 - Math.sqrt(dist) / link)) + ')'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(q2.x, q2.y); cx.stroke(); }
        }
      }
      if (run && !still) requestAnimationFrame(draw);
    }
    size(); draw(); addEventListener('resize', function () { size(); if (still) draw(); });
    d.addEventListener('visibilitychange', function () { run = !d.hidden; if (run && !still) requestAnimationFrame(draw); });
  })();

  /* countdown */
  var end = new Date('2026-11-22T10:00:00+05:30').getTime();
  function cd() {
    var ms = Math.max(0, end - Date.now()), v = { d: Math.floor(ms / 864e5), h: Math.floor(ms % 864e5 / 36e5), m: Math.floor(ms % 36e5 / 6e4), s: Math.floor(ms % 6e4 / 1e3) };
    for (var k in v) q('#cd-' + k).textContent = String(v[k]).padStart(2, '0');
  }
  cd(); setInterval(cd, 1000);
})();
