/* Bulb intro — scroll-scrubbed frame sequence shown before the hero.
 * Frames baked at 30 fps (1920x1080 WebP q85) from reference/bulb_src/camera_motions/renders/web_hero_glow_1080p/G_E_alive.mp4
 * (path traced, opal shell; spec camera_motions/web_hero_glow_alive.json: the glow follows the threading - a stuttering
 * ember on stroke 12, a dim glow on stroke 13, a slight sag while the jaws regrip, full at the SEAT; copy in assets/bulb/)
 *  (low angle, moonless_golf night sky): the last winding strokes, the SEAT at 5.67 s, a hold.
 * Frames are drawn on a canvas; the shown frame eases toward the scroll target every animation
 * frame, so fast scrolling never flashes or skips. Over the hold the stage fades into the fixed starfield.
 * Frames are kept compressed (~22 KB each) and decoded on demand: the canvas decodes a frame the first time it is
 * drawn, and a small window (AHEAD frames) between the shown frame and the scroll target is decoded in advance so a
 * fast scroll never waits on a decode. Decoding all 261 frames up front (~7.9 MiB of pixels each, ~2 GiB in total)
 * blew past the per-tab memory limit on iPhones and WebKit killed the page on first visit.
 * Knobs: N (frame count), FADE_FROM (first frame of the fade-out), EASE (0..1, higher = snappier scrub),
 * AHEAD (frames decoded ahead of the shown one).
 * ?bulb=0.85 freezes the stage at a scroll fraction for screenshots / quick previews.
 *
 * Loader: on a fresh visit at the top of the page a full-screen "Loading Experience..." screen (text plus three
 * spinning rings, after doorman-humanoid.github.io) covers the whole viewport and the page cannot scroll until every
 * frame has arrived (~6.6 MB), so the first screw-down never lands on a frame that is still in flight. It lifts after
 * LOAD_CAP ms regardless (the nearest-loaded-frame fallback below takes over), and is skipped when the page opens
 * mid-way (a hash, a restored scroll position). ?loader=1 holds the screen up for screenshots. */
(function () {
  var N = 261, FADE_FROM = 222, EASE = 0.14, LOAD_CAP = 15000, AHEAD = 8;
  var stage = document.querySelector('.bulb-stage');
  var canvas = stage && stage.querySelector('canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var src = function (i) { return 'assets/bulb/frames/frame_' + String(i).padStart(4, '0') + '.webp'; };
  var params = new URLSearchParams(location.search);

  /* ---- loading screen ---- */
  var loader = null, done = false, root = document.documentElement;
  function settled() { return ready + failed; }
  function showLoader() {
    loader = document.createElement('div'); loader.className = 'loading-screen'; loader.setAttribute('role', 'status');
    loader.innerHTML = '<div class="loading-text">Loading Experience...</div>' +
      '<div class="loading-spinner" aria-hidden="true"><i></i><i></i><i></i></div>';
    document.body.appendChild(loader);
    root.classList.add('bulb-loading');                    // html{overflow:hidden}: no scrolling ahead of the frames
    window.scrollTo(0, 0);
  }
  function finish() {
    if (done) return; done = true;
    root.classList.remove('bulb-loading');
    if (!loader) return;
    var screen = loader;
    setTimeout(function () {                                // a beat so the first frame is on the canvas before the fade
      screen.classList.add('hidden');
      setTimeout(function () { if (screen.parentNode) screen.parentNode.removeChild(screen); }, 800);
    }, 300);
  }
  var hold = params.get('loader');
  var fresh = !location.hash && window.pageYOffset < 2 && !params.get('bulb');
  if (hold) showLoader();
  else if (fresh) { showLoader(); setTimeout(finish, LOAD_CAP); }
  else done = true;

  var frames = new Array(N + 1), ready = 0, failed = 0;
  function progressed() {
    if (done || hold) return;
    if (settled() >= N) finish();
  }
  function load(i) {
    var im = new Image();
    im.onload = function () { ready++; if (i === shown) draw(); progressed(); };
    im.onerror = function () { failed++; progressed(); };
    im.src = src(i); frames[i] = im;
  }
  for (var i = 1; i <= N; i++) load(i);                   // ~6.6 MB total; first frames arrive first

  /* Decode the frames just ahead of the shown one, in the direction of travel, so the scrub never draws a frame
     that still has to be decoded. The browser is free to drop these bitmaps again under memory pressure. */
  var decoded = {};
  function loaded(im) { return im && im.complete && im.naturalWidth; }
  function warm(i) {
    var im = frames[i];
    if (decoded[i] || !loaded(im) || !im.decode) return;
    decoded[i] = true;
    im.decode().catch(function () { decoded[i] = false; });
  }
  function warmAhead() {
    var from = Math.round(current), to = Math.round(target), step = to >= from ? 1 : -1;
    for (var k = 0, i = from; k <= AHEAD && i >= 1 && i <= N; k++, i += step) warm(i);
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    shown = -1; draw();
  }
  var target = 1, current = 1, shown = -1;
  function draw() {
    var i = Math.round(current), im = frames[i];
    while (i > 1 && !loaded(im)) im = frames[--i];                                 // nearest loaded frame
    if (!loaded(im) || i === shown) return;
    shown = i;
    var cw = canvas.width, ch = canvas.height, s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
    var w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);                          // cover
    stage.style.setProperty('--fade', Math.max(0, (i - FADE_FROM) / (N - FADE_FROM)));
  }
  function tick() {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.5) current = target;
    warmAhead(); draw();
    requestAnimationFrame(tick);
  }
  function setProgress(p) {                                  // p = 0..1 through the stage
    target = 1 + p * (N - 1);
    stage.classList.toggle('is-scrolled', p > 0.03);
  }
  function navHeight() { var n = document.querySelector('nav.top'); return n ? n.offsetHeight : 0; }
  function update() {
    var r = stage.getBoundingClientRect();
    var pinTop = navHeight();   // the stage pins beneath the fixed top bar
    setProgress(Math.min(1, Math.max(0, (pinTop - r.top) / (r.height - (window.innerHeight - pinTop)))));
  }
  var q = params.get('bulb');
  if (q) { stage.style.height = '100vh'; resize(); setProgress(+q); current = target; draw(); window.addEventListener('resize', resize); return; }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', function () { resize(); update(); });
  resize(); update(); current = target; requestAnimationFrame(tick);
})();
