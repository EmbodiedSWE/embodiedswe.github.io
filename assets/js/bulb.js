/* Bulb intro — scroll-scrubbed frame sequence shown before the hero.
 * Frames baked at 30 fps from reference/bulb_src/camera_motions/renders/web_hero_golf/c4_low_hero.mp4
 * (low angle, moonless_golf night sky): the last winding strokes, the SEAT at ~5.6 s (the bulb lights up), a hold.
 * Frames are pre-decoded and drawn on a canvas; the shown frame eases toward the scroll target every animation
 * frame, so fast scrolling never flashes or skips. Over the hold the stage fades into the fixed starfield.
 * Knobs: N (frame count), FADE_FROM (first frame of the fade-out), EASE (0..1, higher = snappier scrub).
 * ?bulb=0.85 freezes the stage at a scroll fraction for screenshots / quick previews. */
(function () {
  var N = 261, FADE_FROM = 222, EASE = 0.14;
  var stage = document.querySelector('.bulb-stage');
  var canvas = stage && stage.querySelector('canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var src = function (i) { return 'assets/bulb/frames/frame_' + String(i).padStart(4, '0') + '.jpg'; };

  var frames = new Array(N + 1), ready = 0;
  function load(i) {
    var im = new Image();
    im.onload = function () { ready++; if (im.decode) im.decode().catch(function () {}); if (i === shown) draw(); };
    im.src = src(i); frames[i] = im;
  }
  for (var i = 1; i <= N; i++) load(i);                   // ~7 MB total; first frames arrive first

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    shown = -1; draw();
  }
  var target = 1, current = 1, shown = -1;
  function draw() {
    var i = Math.round(current), im = frames[i];
    while (i > 1 && !(im && im.complete && im.naturalWidth)) im = frames[--i];   // nearest loaded frame
    if (!(im && im.complete && im.naturalWidth) || i === shown) return;
    shown = i;
    var cw = canvas.width, ch = canvas.height, s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
    var w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);                          // cover
    stage.style.setProperty('--fade', Math.max(0, (i - FADE_FROM) / (N - FADE_FROM)));
  }
  function tick() {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.5) current = target;
    draw();
    requestAnimationFrame(tick);
  }
  function setProgress(p) {                                  // p = 0..1 through the stage
    target = 1 + p * (N - 1);
    stage.classList.toggle('is-scrolled', p > 0.03);
  }
  function update() {
    var r = stage.getBoundingClientRect();
    setProgress(Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight))));
  }
  var q = new URLSearchParams(location.search).get('bulb');
  if (q) { stage.style.height = '100vh'; resize(); setProgress(+q); current = target; draw(); window.addEventListener('resize', resize); return; }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', function () { resize(); update(); });
  resize(); update(); current = target; requestAnimationFrame(tick);
})();
