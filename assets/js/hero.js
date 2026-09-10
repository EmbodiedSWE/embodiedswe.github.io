/* A continuous particle loop: code becomes action, action becomes learning.
 * Canvas is decorative; the title and scroll links work without JavaScript.
 * No libraries, media downloads, scroll interception, or GPU dependencies.
 */
(function () {
  'use strict';

  var hero = document.querySelector('header.hero');
  if (!hero) return;
  var universe = document.querySelector('.site-universe');
  var canvas = universe && universe.querySelector('canvas');
  var ctx = canvas && canvas.getContext('2d');
  if (!ctx || !window.requestAnimationFrame) return;

  var buttons = document.querySelectorAll('[data-animation-toggle]');
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = motion.matches, paused = reduced, visible = true;
  var width = 0, height = 0, scale = 0, particles = [];
  var raf = 0, previous = 0, elapsed = 0, scrollQueued = false;
  var titleElapsed = 0;
  var TAU = Math.PI * 2;
  var colors = ['126,201,207', '209,183,144', '164,190,213'];
  var title = hero.querySelector('h1');
  var copy = hero.querySelector('.hero-copy');
  var titleCanvas = document.createElement('canvas');
  var titleCtx = titleCanvas.getContext('2d');
  var titlePoints = [], titleFinished = reduced, titleActive = false;
  var TITLE_END = 4300;
  titleCanvas.className = 'hero-title-canvas';
  titleCanvas.setAttribute('aria-hidden', 'true');

  function finishTitle() {
    titleFinished = true;
    titleActive = false;
    title.style.removeProperty('opacity');
    titleCanvas.remove();
    titlePoints = [];
  }

  // Sample each character at its actual DOM position, preserving the two font
  // weights, kerning, and responsive letter spacing of the accessible heading.
  function prepareTitle(dpr) {
    if (titleFinished || !titleCtx) return;
    try {
      titleCanvas.width = canvas.width;
      titleCanvas.height = canvas.height;
      titleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var bounds = copy.getBoundingClientRect();
      var walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
      var node, range = document.createRange();
      titleCtx.fillStyle = '#fff';
      titleCtx.textBaseline = 'alphabetic';
      while ((node = walker.nextNode())) {
        var style = getComputedStyle(node.parentElement);
        titleCtx.font = style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
        for (var i = 0; i < node.length; i++) {
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          var rect = range.getBoundingClientRect();
          var metrics = titleCtx.measureText(node.data[i]);
          var ascent = metrics.fontBoundingBoxAscent;
          var descent = metrics.fontBoundingBoxDescent;
          // Unsupported font metrics leave the ordinary heading visible.
          if (ascent === undefined || descent === undefined) return finishTitle();
          var baseline = rect.top - bounds.top + (rect.height - ascent - descent) / 2 + ascent;
          titleCtx.fillText(node.data[i], rect.left - bounds.left, baseline);
        }
      }
      var pixels = titleCtx.getImageData(0, 0, titleCanvas.width, titleCanvas.height).data;
      var heading = title.getBoundingClientRect();
      var step = Math.max(2, Math.round((width < 700 ? 1.6 : 2.5) * dpr));
      titlePoints = [];
      var left = Math.max(0, Math.floor((heading.left - bounds.left) * dpr));
      var right = Math.min(titleCanvas.width, Math.ceil((heading.right - bounds.left) * dpr));
      // Font glyphs can extend slightly beyond the heading's line box.
      var top = Math.max(0, Math.floor((heading.top - bounds.top - 12) * dpr));
      var bottom = Math.min(titleCanvas.height, Math.ceil((heading.bottom - bounds.top + 12) * dpr));
      for (var y = top; y < bottom; y += step) {
        for (var x = left; x < right; x += step) {
          if (pixels[(y * titleCanvas.width + x) * 4 + 3] < 130) continue;
          var index = titlePoints.length;
          var angle = index * 2.399963;
          var radius = scale * (1.6 + (index % 17) / 28);
          titlePoints.push({x:x / dpr, y:y / dpr,
            sx:width / 2 + Math.cos(angle) * radius,
            sy:height * 0.49 + Math.sin(angle) * radius * 0.72,
            delay:((x / dpr - heading.left + bounds.left) / heading.width) * 500,
            size:step / dpr * 0.78});
        }
      }
      if (!titlePoints.length) return finishTitle();
      titleActive = true;
      copy.appendChild(titleCanvas);
      drawTitle();
    } catch (error) {
      finishTitle();
    }
  }

  function drawTitle() {
    if (!titleActive) return;
    if (titleElapsed >= TITLE_END) return finishTitle();
    titleCtx.clearRect(0, 0, width, height);
    var fade = Math.max(0, Math.min(1, (titleElapsed - 3500) / 800));
    title.style.opacity = String(fade);
    for (var i = 0; i < titlePoints.length; i++) {
      var p = titlePoints[i];
      var progress = Math.max(0, Math.min(1, (titleElapsed - 300 - p.delay) / 2100));
      var ease = 1 - Math.pow(1 - progress, 3);
      var curl = Math.sin(progress * Math.PI) * (1 - progress) * scale * 0.3;
      var x = p.sx + (p.x - p.sx) * ease + Math.sin(i) * curl;
      var y = p.sy + (p.y - p.sy) * ease + Math.cos(i) * curl;
      titleCtx.globalAlpha = (0.25 + ease * 0.75) * (1 - fade);
      titleCtx.fillStyle = ease > 0.9 ? '#e4eee7' : 'rgb(' + colors[i % 3] + ')';
      titleCtx.fillRect(x, y, p.size, p.size);
    }
    titleCtx.globalAlpha = 1;
  }

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
    width = universe.clientWidth;
    height = universe.clientHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = Math.min(width * 0.215, height * 0.36);
    if (width < 700) scale = Math.min(width * 0.3, height * 0.28);
    makeParticles();
    prepareTitle(dpr);
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
    drawTitle();
  }

  function frame(now) {
    raf = 0;
    if (paused || document.hidden) { previous = 0; return; }
    // The subdued field keeps moving below the hero at a lower frame rate.
    if (!visible && previous && now - previous < 32) {
      raf = requestAnimationFrame(frame);
      return;
    }
    if (previous) {
      var delta = Math.min(now - previous, 50);
      elapsed += delta;
      if (visible) titleElapsed += delta;
    }
    previous = now;
    draw();
    raf = requestAnimationFrame(frame);
  }

  function sync() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    previous = 0;
    buttons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(paused));
      button.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
      button.title = paused ? 'Play animation' : 'Pause animation';
      button.querySelector('.hero-pause-icon').textContent = paused ? '▷' : 'Ⅱ';
      var label = button.querySelector('.hero-pause-label');
      if (label) label.textContent = paused ? 'Play' : 'Pause';
    });
    if (!paused && !document.hidden) raf = requestAnimationFrame(frame);
  }

  function updateScroll() {
    scrollQueued = false;
    var top = hero.getBoundingClientRect().top;
    var heroHeight = hero.clientHeight;
    var progress = Math.max(0, Math.min(1, -top / heroHeight));
    hero.style.setProperty('--hero-shift', (reduced ? 0 : progress * height * 0.18) + 'px');
    hero.style.setProperty('--hero-opacity', reduced ? '1' : String(1 - progress * 0.95));
    universe.style.setProperty('--universe-opacity', String(1 - progress * 0.68));
    var nextVisible = top < window.innerHeight && top + heroHeight > 0;
    if (nextVisible !== visible) { visible = nextVisible; sync(); }
  }

  buttons.forEach(function (button) {
    button.hidden = false;
    button.addEventListener('click', function () { paused = !paused; sync(); });
  });
  motion.addEventListener('change', function (event) {
    reduced = event.matches;
    paused = reduced;
    if (reduced) finishTitle();
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
  // Re-sample if fonts finish loading during the entrance, without restarting it.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (!titleFinished) resize(); }).catch(finishTitle);
  }
})();
