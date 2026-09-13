/* Title stage choreography. header.hero is a tall scroll track with one pinned viewport inside; as it scrolls,
 * every [data-pop] element gets --t (0..1): the paper title pops in word by word, then the authors, then the
 * organizations, then the footer, and the finished page holds for the rest of the track.
 *
 * Groups (data-group) take consecutive windows of the track's progress; inside a group the items overlap so
 * they read as one cascade rather than a slideshow. The shown progress eases toward the scroll position every
 * frame, so a flick still lets each word land. Knobs below; ?title=0.6 freezes the stage for screenshots. */
(function () {
  var hero = document.querySelector('header.hero.title-stage');
  if (!hero || !('requestAnimationFrame' in window)) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;                              // CSS shows everything, the track collapses

  var WINDOWS = {                                           // [start, end] in track progress, 0..1
    mark:    [0.00, 0.26],                                  // beat 1: the wordmark blooms as the bulb's last wisps go
    title:   [0.08, 0.34],                                  //         ...and the subtitle comes up right behind it
    authors: [0.34, 0.58],                                  // beat 2: the author list cascades in
    orgs:    [0.54, 0.66],                                  //         ...with the institutions and footnotes
    foot:    [0.64, 0.70],                                  // 0.70..1 = the finished page holds
  };
  var OVERLAP = 0.72;                                       // 0 = one after another, 1 = all together
  var EASE = 0.16;                                          // per-frame approach toward the scroll target

  var items = [];
  Object.keys(WINDOWS).forEach(function (group) {
    var els = hero.querySelectorAll('[data-pop][data-group="' + group + '"]');
    var w = WINDOWS[group], span = w[1] - w[0], n = els.length;
    var len = n > 1 ? span / (1 + (n - 1) * (1 - OVERLAP)) : span;        // each item's own window
    var step = n > 1 ? (span - len) / (n - 1) : 0;
    for (var i = 0; i < n; i++) items.push({ el: els[i], start: w[0] + step * i, len: len, t: -1 });
  });
  if (!items.length) return;

  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function apply(p) {
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var t = Math.min(1, Math.max(0, (p - it.start) / it.len));
      t = easeOut(t);
      if (t === it.t || (Math.abs(t - it.t) < 0.002 && t !== 1 && t !== 0)) continue;   // skip invisible changes
      it.t = t;
      it.el.style.setProperty('--t', t.toFixed(3));
      it.el.classList.toggle('is-set', t === 1);
    }
  }

  var target = 0, current = 0, running = false;
  function progress() {
    var r = hero.getBoundingClientRect();
    var track = r.height - window.innerHeight;
    return track > 0 ? Math.min(1, Math.max(0, -r.top / track)) : 1;
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
