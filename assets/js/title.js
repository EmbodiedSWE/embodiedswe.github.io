/* Title stage choreography. header.hero is a tall scroll track with one pinned viewport inside; as it scrolls,
 * every [data-pop] element gets --t (0..1): the paper title pops in word by word, then the authors, then the
 * organizations, then the footer, and the finished page holds for the rest of the track.
 *
 * Groups (data-group) take consecutive windows of the track's progress; inside a group the items overlap so
 * they read as one cascade rather than a slideshow. A group with an `out` window also dissolves away again
 * (--x, 0..1), which lets two author tiers share one slot. The shown progress eases toward the scroll position every
 * frame, so a flick still lets each word land. Knobs below; ?title=0.6 freezes the stage for screenshots. */
(function () {
  var hero = document.querySelector('header.hero.title-stage');
  if (!hero || !('requestAnimationFrame' in window)) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;                              // CSS shows everything, the track collapses

  var WINDOWS = {                                           // [start, end] in track progress, 0..1
    mark:     { in: [0.00, 0.22] },                         // the wordmark blooms as the bulb's last wisps go
    title:    { in: [0.08, 0.30] },                         // the subtitle right behind it
    leads:    { in: [0.28, 0.42] },                         // project leads
    contrib:  { in: [0.38, 0.56] },                         // contributors
    advisors: { in: [0.52, 0.66] },                         // advisors
    orgs:     { in: [0.62, 0.76] },                         // institutions and the ordering note
    foot:     { in: [0.72, 0.80] }                          // 0.80..1 = a short hold, then the research arrives
    // a group may also carry out: [start, end] to dissolve away again (--x), e.g. to let two tiers share a slot
  };
  var OVERLAP = 0.78;                                       // 0 = one after another, 1 = all together
  var EASE = 0.16;                                          // per-frame approach toward the scroll target

  var items = [];
  Object.keys(WINDOWS).forEach(function (group) {
    var els = hero.querySelectorAll('[data-pop][data-group="' + group + '"]');
    var w = WINDOWS[group].in, out = WINDOWS[group].out, span = w[1] - w[0], n = els.length;
    var len = n > 1 ? span / (1 + (n - 1) * (1 - OVERLAP)) : span;        // each item's own window
    var step = n > 1 ? (span - len) / (n - 1) : 0;
    for (var i = 0; i < n; i++) items.push({ el: els[i], start: w[0] + step * i, len: len, out: out, t: -1, x: -1 });
  });
  if (!items.length) return;

  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function clamp01(x) { return Math.min(1, Math.max(0, x)); }
  function apply(p) {
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var t = easeOut(clamp01((p - it.start) / it.len));
      var x = it.out ? easeOut(clamp01((p - it.out[0]) / (it.out[1] - it.out[0]))) : 0;
      var settled = (t === 0 || t === 1) && (x === 0 || x === 1);
      if ((t === it.t && x === it.x) || (!settled && Math.abs(t - it.t) < 0.002 && Math.abs(x - it.x) < 0.002)) continue;
      it.t = t; it.x = x;
      it.el.style.setProperty('--t', t.toFixed(3));
      if (it.out) it.el.style.setProperty('--x', x.toFixed(3));
      it.el.classList.toggle('is-set', t === 1 && x === 0);
    }
  }

  var target = 0, current = 0, running = false;
  function progress() {
    var r = hero.getBoundingClientRect();
    var nav = document.querySelector('nav.top'), pinTop = nav ? nav.offsetHeight : 0;   // pins beneath the fixed bar
    var track = r.height - (window.innerHeight - pinTop);
    return track > 0 ? Math.min(1, Math.max(0, (pinTop - r.top) / track)) : 1;
  }
  function tick() {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.0005) current = target;
    apply(current);
    if (current === target) { running = false; return; }
    requestAnimationFrame(tick);
  }
  function update() {
    target = progress();
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  hero.classList.add('is-live');
  var q = new URLSearchParams(location.search).get('title');
  if (q) {                                                  // preview: hide the bulb, freeze the stage
    var bulb = document.querySelector('.bulb-stage'); if (bulb) bulb.style.display = 'none';
    hero.style.setProperty('--title-track', '100vh'); current = target = +q; apply(current); return;
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  current = target = progress(); apply(current);
})();

/* The brand link in the top bar (href="#top") lands on the finished title page rather than the dark start of its
 * track: the last scroll position with the whole page on screen, and never before the bulb stage has left. That
 * also covers reduced motion, where the choreography above is off, the track is collapsed and the bulb still
 * scrubs. Then a little further, so the EmbodiedSWE heading sits just under the bar rather than mid-screen: the
 * pinned page scrolls up as one piece, and the research begins to show beneath it. Same for a page opened at
 * #top. Without JS the plain anchor stands. */
(function () {
  var hero = document.querySelector('header.hero.title-stage');
  if (!hero || !('scrollTo' in window)) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function landingY() {
    var nav = document.querySelector('nav.top'), pinTop = nav ? nav.offsetHeight : 0, y = window.pageYOffset;
    var h = hero.getBoundingClientRect();
    var top = h.top + y - pinTop;                            // the page's top meets the bar (its start, no track)
    var end = h.bottom + y - window.innerHeight;             // its bottom meets the viewport bottom (end of the hold)
    var bulb = document.querySelector('.bulb-stage'), gone = 0;
    if (bulb) gone = bulb.getBoundingClientRect().bottom + y - (window.innerHeight - pinTop);   // bulb scrolled off
    var mark = hero.querySelector('.title-mark'), sticky = hero.querySelector('.title-sticky'), lift = 0;
    if (mark && sticky) lift = Math.max(0, mark.getBoundingClientRect().top - sticky.getBoundingClientRect().top - 28);
    return Math.max(0, Math.round(Math.max(top, end, gone) + lift));   // heading 28px under the bar
  }
  function land(smooth) {
    window.scrollTo({ top: landingY(), left: 0, behavior: smooth && !reduced.matches ? 'smooth' : 'auto' });
  }
  var brand = document.querySelectorAll('a[href="#top"]');
  for (var b = 0; b < brand.length; b++) {
    brand[b].addEventListener('click', function (e) {
      e.preventDefault();
      land(true);
      try { history.replaceState(null, '', '#top'); } catch (err) { /* sandboxed frame: the scroll still happened */ }
    });
  }
  if (location.hash === '#top') {                          // after the browser's own fragment jump
    var onload = function () { requestAnimationFrame(function () { land(false); }); };
    if (document.readyState === 'complete') onload(); else window.addEventListener('load', onload);
  }
})();
