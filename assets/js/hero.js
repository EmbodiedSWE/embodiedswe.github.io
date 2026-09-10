/* A continuous particle loop: code becomes action, action becomes learning.
 * Canvas is decorative; the title and scroll links work without JavaScript.
 * No libraries, media downloads, scroll interception, or GPU dependencies.
 */
(function () {
  'use strict';

  var hero = document.querySelector('header.hero');
  if (!hero) return;
  var canvas = hero.querySelector('canvas');
  var ctx = canvas && canvas.getContext('2d');
  if (!ctx || !window.requestAnimationFrame) return;

  var button = hero.querySelector('.hero-pause');
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = motion.matches, paused = reduced, visible = true;
  var width = 0, height = 0, scale = 0, particles = [];
  var raf = 0, previous = 0, elapsed = 0, scrollQueued = false;
  var TAU = Math.PI * 2;
  var colors = ['126,201,207', '209,183,144', '164,190,213'];

  // Fixed seed keeps the composition stable through resizing and theme changes.
  function makeParticles() {
    var seed = 37;
    function random() {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    }
    particles = [];
    var count = width < 700 ? 2600 : 6200;
    for (var i = 0; i < count; i++) {
      particles.push({u:random() * TAU, v:random() * TAU,
        radius:0.18 + random() * 0.42, size:0.45 + random() * 1.15,
        alpha:0.25 + random() * 0.65, band:i % 3});
    }
  }

  function resize() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = Math.min(width * 0.215, height * 0.36);
    if (width < 700) scale = Math.min(width * 0.3, height * 0.28);
    makeParticles();
    draw();
    updateScroll();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    var t = elapsed * 0.00013;
    var tilt = -0.37 + Math.sin(t * 0.3) * 0.1;
    var ct = Math.cos(tilt), st = Math.sin(tilt);
    var projected = [];
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var u = p.u + t * (p.band === 1 ? -0.37 : 0.28);
      var v = p.v + u * 3 + t * 0.4 + p.band * 2.094;
      var radius = 1.8 + Math.cos(v) * p.radius;
      var x = Math.cos(u) * radius;
      var y = Math.sin(u) * radius * 0.77;
      var z = Math.sin(v) * p.radius + Math.sin(u * 2 + t * 0.4) * 0.24;
      // A gently tilted torus with braided streams and a quiet center for text.
      var yy = y * 0.82 - z * 0.57;
      var zz = y * 0.57 + z * 0.82;
      var perspective = 4.8 / (4.8 - zz);
      var px = (x * ct - yy * st) * scale * perspective + width / 2;
      var py = (x * st + yy * ct) * scale * perspective + height * 0.49;
      projected.push({x:px, y:py, z:zz, size:p.size * perspective,
        alpha:p.alpha * (0.48 + (zz + 1.9) / 5), band:p.band});
    }
    projected.sort(function (a, b) { return a.z - b.z; });
    for (var j = 0; j < projected.length; j++) {
      var q = projected[j];
      ctx.fillStyle = 'rgba(' + colors[q.band] + ',' + q.alpha.toFixed(3) + ')';
      ctx.fillRect(q.x, q.y, q.size, q.size);
    }
  }

  function frame(now) {
    raf = 0;
    if (paused || !visible || document.hidden) { previous = 0; return; }
    if (previous) elapsed += Math.min(now - previous, 50);
    previous = now;
    draw();
    raf = requestAnimationFrame(frame);
  }

  function sync() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    previous = 0;
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
    button.querySelector('.hero-pause-icon').textContent = paused ? '▷' : 'Ⅱ';
    button.querySelector('.hero-pause-label').textContent = paused ? 'Play' : 'Pause';
    if (!paused && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }

  function updateScroll() {
    scrollQueued = false;
    var top = hero.getBoundingClientRect().top;
    var progress = Math.max(0, Math.min(1, -top / height));
    hero.style.setProperty('--hero-shift', (reduced ? 0 : progress * height * 0.18) + 'px');
    hero.style.setProperty('--hero-opacity', reduced ? '1' : String(1 - progress * 0.95));
    // Also suspends offscreen animation if IntersectionObserver is unavailable.
    var nextVisible = top < window.innerHeight && top + height > 0;
    if (nextVisible !== visible) { visible = nextVisible; sync(); }
  }

  button.hidden = false;
  button.addEventListener('click', function () { paused = !paused; sync(); });
  motion.addEventListener('change', function (event) {
    reduced = event.matches;
    paused = reduced;
    updateScroll();
    sync();
  });
  window.addEventListener('scroll', function () {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); }
  }, {passive:true});
  window.addEventListener('resize', resize, {passive:true});
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      sync();
    }).observe(hero);
  }
  resize();
  sync();
})();
