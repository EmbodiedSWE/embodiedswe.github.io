/* EmbodiedSWE project page — gallery, catalog, nav scroll-spy, theme. */
(function () {
  'use strict';

  /* ---------- rendered rollouts (15 clips available) ---------- */
  var CLIPS = [
    { f:'ikea_table',      name:'Table assembly',    scene:'ikea_table',     suite:'assembly',  diff:'Hard',   emb:'Bimanual Franka',       sp:8, desc:'Thread four legs onto the corner studs of a tabletop.' },
    { f:'so101',           name:'Robot-arm assembly',scene:'so101',          suite:'assembly',  diff:'Hard',   emb:'Bimanual Franka',       sp:1, desc:'Seat the servo, screw it down, clip on the forearm.' },
    { f:'pc_motherboard',  name:'Motherboard mount', scene:'pc_motherboard', suite:'assembly',  diff:'Medium', emb:'Franka · xArm7 · Gen3', sp:2, desc:'Drive seven mounting bolts with an Allen key to secure a motherboard in a case.' },
    { f:'allen_bolt',      name:'Allen bolt',        scene:'allen_bolt',     suite:'assembly',  diff:'Medium', emb:'Franka · xArm7 · Gen3', sp:1, desc:'Drive an Allen bolt into a threaded plate using an L-shaped key.' },
    { f:'bulb',            name:'Bulb screwing',     scene:'bulb',           suite:'assembly',  diff:'Medium', emb:'Franka · xArm7 · Gen3', sp:5, desc:'Pick up a light bulb and screw it into its socket until fully seated.' },
    { f:'nut_thread',      name:'Nut threading',     scene:'nut_thread',     suite:'assembly',  diff:'Easy',   emb:'Franka · xArm7 · Gen3', sp:1, desc:'Pick up an M16 nut and thread it onto a fixed bolt.' },
    { f:'pc_gpu',          name:'GPU insertion',     scene:'pc_gpu',         suite:'assembly',  diff:'Easy',   emb:'Franka · xArm7 · Gen3', sp:1, desc:'Align a graphics card with a PCIe slot and press it into place.' },
    { f:'pc_ram',          name:'RAM seating',       scene:'pc_ram',         suite:'assembly',  diff:'Easy',   emb:'Franka · xArm7 · Gen3', sp:1, desc:'Align and seat two memory modules in separate DIMM slots.' },
    { f:'tool_packing',    name:'Tool packing',      scene:'tool_packing',   suite:'packing',   diff:'Medium', emb:'Franka · xArm7 · Gen3', sp:5, desc:'Stow three tools in their assigned drawers, then close the cabinet.' },
    { f:'pen_holder',      name:'Pen holder',        scene:'pen_holder',     suite:'packing',   diff:'Easy',   emb:'Franka · xArm7 · Gen3', sp:1, desc:'Insert every present pen tip-up, then stand the filled holder upright.' },
    { f:'syringe',         name:'Syringe dosing',    scene:'syringe',        suite:'puzzle',    diff:'Hard',   emb:'Bimanual Franka',       sp:1, desc:'Draw liquid from a reservoir, meter three target doses, and repark the syringe.' },
    { f:'coffee',          name:'Coffee brewing',    scene:'coffee',         suite:'puzzle',    diff:'Medium', emb:'Franka · xArm7 · Gen3', sp:1, desc:'Load a capsule, brew, and return the filled mug to the serving tray.' },
    { f:'spatula',         name:'Spatula flip',      scene:'spatula',        suite:'puzzle',    diff:'Easy',   emb:'Franka · xArm7 · Gen3', sp:1, desc:'Wedge a spatula under bread, flip it, reload the blade, and serve to a plate.' },
    { f:'slice_banana',    name:'Slicing',           scene:'slice',          suite:'cutting',   diff:'Easy',   emb:'Franka · xArm7 · Gen3', sp:1, desc:'Pick up a chef knife and slice a banana into a target number of pieces.' },
    { f:'box_to_bin',      name:'Box to bin',        scene:'box_to_bin',     suite:'locomanip', diff:'Medium', emb:'Unitree G1',            sp:1, desc:'Pick a box off a shelf and carry it to a sorting bin across the room.' }
  ];

  /* ---------- full catalog: all 28 registered scenes ---------- */
  var A = 'Franka · xArm7 · Gen3', B = 'Bimanual Franka', G = 'Unitree G1';
  var CATALOG = [
    ['Assembly','allen_bolt','Drive an Allen bolt into a threaded plate using an L-shaped key.',A,'Medium'],
    ['Assembly','bulb','Pick up a light bulb and screw it into its socket until fully seated.',A,'Medium'],
    ['Assembly','ikea_table','Attach four threaded legs to the corner studs of a tabletop.',B,'Hard'],
    ['Assembly','SO_101','Assemble a robot arm.',B,'Hard'],
    ['Assembly','nut_thread','Pick up an M16 nut and thread it onto a fixed bolt.',A,'Easy'],
    ['Assembly','pc_gpu','Align a graphics card with a PCIe slot and press it into place.',A,'Easy'],
    ['Assembly','pc_gpu_ram','Install a graphics card and then seat two memory modules in their slots.',A,'Medium'],
    ['Assembly','pc_motherboard','Use an Allen key to drive seven mounting bolts and secure a motherboard inside a case.',A,'Medium'],
    ['Assembly','pc_ram','Align and seat two memory modules in separate DIMM slots.',A,'Easy'],
    ['Packing','pen_holder','Insert every present pen tip-up and then place the filled holder upright.',A,'Easy'],
    ['Packing','tool_packing','Stow three tools in their assigned drawers and close the cabinet.',A,'Medium'],
    ['Packing','egg_carton','Seat three eggs upright in the cells of an egg carton, then push the hinged lid closed.',G,'Hard'],
    ['Packing','clear_organic_objects','Clear the organic objects on a cluttered table into a bin while leaving the other items in place.',G,'Medium'],
    ['Puzzle','coffee','Load a capsule, brew coffee, and return the filled mug to the serving tray.',A,'Medium'],
    ['Puzzle','spatula','Wedge a spatula under bread, flip it, reload it onto the blade, and serve it to a plate.',A,'Easy'],
    ['Puzzle','syringe','Draw liquid from a reservoir, meter three target doses, and repark the syringe.',B,'Hard'],
    ['Puzzle','push_shapes','Push three blocks onto their matching pads, correcting each block’s orientation along the way.',G,'Easy'],
    ['Puzzle','classify_objects','Sort scattered coloured blocks into the zones matching their colours.',G,'Easy'],
    ['Puzzle','stack_blocks','Stack scattered blocks into a single aligned tower on a marked pad.',G,'Medium'],
    ['Deformable','tshirt','Fold a T-shirt into a compact, flat bundle.',A,'Medium'],
    ['Deformable','latte','Coordinate two arms to pour milk into a carried coffee mug without excessive spilling.',B,'Hard'],
    ['Deformable','dumpling','Roll a ball of dough flat into a round dumpling wrapper with a rolling pin.',A,'Hard'],
    ['Deformable','shoe_knot','Tie a half knot from the two shoelaces of a sneaker.',A,'Hard'],
    ['Cutting','slice','Pick up a chef knife from its rest and slice a carrot (or a banana) into a target number of pieces on a chopping board.',A,'Easy'],
    ['Cutting','dice','Dice a tomato (or a potato) into a 3×3 grid of pieces, cutting along two plane families with the knife re-yawed between them.',A,'Medium'],
    ['Locomanip','fruit_delivery','Pick up every fruit on a long table and carry it around the table to a plate beyond arm reach.',G,'Medium'],
    ['Locomanip','box_to_bin','Pick a cardboard box off a shelf and carry it to a sorting bin on a table across the room.',G,'Medium'],
    ['Locomanip','wheel_carry','Pick a steering wheel off one packing table and carry it to a basket on another, three metres away.',G,'Medium']
  ];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------- in-view autoplay (task overview film) ----------
     Muted, so browsers allow it without a gesture. Nothing is fetched until the player is about to scroll into
     view (preload="none"); it pauses again offscreen and when the tab is hidden. The controls stay, so a visitor
     can unmute or scrub. If they pause it by hand we leave it alone. */
  document.querySelectorAll('video[data-autoplay-in-view]').forEach(function (v) {
    var inView = false, userPaused = false;
    v.addEventListener('pause', function () { if (inView && !document.hidden && !v.ended) userPaused = true; });
    v.addEventListener('play', function () { userPaused = false; });
    function sync() {
      if (inView && !document.hidden && !userPaused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else if (!inView || document.hidden) { if (!v.paused) { userPaused = false; v.pause(); } }
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { inView = entries[0].isIntersecting; sync(); },
        {threshold: 0.15, rootMargin: '120px 0px'}).observe(v);
    } else { inView = true; sync(); }
    document.addEventListener('visibilitychange', sync);
  });

  /* ---------- gallery ---------- */
  var gallery = document.getElementById('gallery');
  if (gallery) {
    gallery.innerHTML = CLIPS.map(function (t) {
      var speed = t.sp > 1 ? ' · ' + t.sp + '×' : '';
      return '' +
        '<article class="card" data-suite="' + t.suite + '">' +
          '<div class="shot" tabindex="0" role="button" aria-label="Play ' + esc(t.name) + ' rollout">' +
            '<video src="assets/video/' + t.f + '.mp4" poster="assets/img/poster/' + t.f + '.jpg"' +
              ' muted loop playsinline preload="none"></video>' +
            '<span class="play">▶ play' + speed + '</span>' +
          '</div>' +
          '<div class="meta">' +
            '<h4>' + esc(t.name) + '</h4>' +
            '<div class="tags">' +
              '<span class="tag">' + esc(t.scene) + '</span>' +
              '<span class="tag d-' + t.diff.toLowerCase() + '">' + t.diff + '</span>' +
              '<span class="tag">' + esc(t.emb) + '</span>' +
            '</div>' +
            '<p>' + esc(t.desc) + '</p>' +
          '</div>' +
        '</article>';
    }).join('');

    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function toggle(shot) {
      var v = shot.querySelector('video');
      if (v.paused) {
        gallery.querySelectorAll('video').forEach(function (o) {
          if (o !== v && !o.paused) { o.pause(); o.parentElement.classList.remove('playing'); }
        });
        v.play().then(function () { shot.classList.add('playing'); }).catch(function () {});
      } else {
        v.pause();
        shot.classList.remove('playing');
      }
    }

    gallery.querySelectorAll('.shot').forEach(function (shot) {
      var v = shot.querySelector('video');
      shot.addEventListener('click', function () { toggle(shot); });
      shot.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(shot); }
      });
      if (fine) {
        shot.addEventListener('mouseenter', function () {
          v.play().then(function () { shot.classList.add('playing'); }).catch(function () {});
        });
        shot.addEventListener('mouseleave', function () {
          v.pause(); v.currentTime = 0; shot.classList.remove('playing');
        });
      }
    });

    /* suite filter */
    var buttons = document.querySelectorAll('.filters button');
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var want = b.dataset.suite;
        buttons.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        gallery.querySelectorAll('.card').forEach(function (c) {
          var show = want === 'all' || c.dataset.suite === want;
          c.hidden = !show;
          if (!show) {
            var v = c.querySelector('video');
            v.pause(); c.querySelector('.shot').classList.remove('playing');
          }
        });
      });
    });
  }

  /* ---------- catalog table ---------- */
  var body = document.getElementById('catalog-body');
  if (body) {
    body.innerHTML = CATALOG.map(function (r) {
      return '<tr><td>' + esc(r[0]) + '</td><td><code>' + esc(r[1]) + '</code></td>' +
        '<td class="wrap-ok">' + esc(r[2]) + '</td><td>' + esc(r[3]) + '</td>' +
        '<td><span class="tag d-' + r[4].toLowerCase() + '">' + r[4] + '</span></td></tr>';
    }).join('');
  }

  /* ---------- nav scroll-spy ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('nav.top a.lnk'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    var seen = new Map();
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen.set(e.target, e.intersectionRatio); });
      var best = null, bestR = 0;
      seen.forEach(function (r, el) { if (r > bestR) { bestR = r; best = el; } });
      if (best) {
        links.forEach(function (a) {
          a.classList.toggle('on', a.getAttribute('href') === '#' + best.id);
        });
      }
    }, { rootMargin: '-56px 0px -55% 0px', threshold: [0, 0.15, 0.4, 0.75, 1] });
    sections.forEach(function (s) { obs.observe(s); });
  }

  /* ---------- side menu: visible from the Overview down; the section whose top has passed the nav is marked ---------- */
  (function () {
    var menu = document.getElementById('side-menu');
    if (!menu) return;
    var items = Array.prototype.slice.call(menu.querySelectorAll('a')).map(function (a) {
      return { a: a, el: document.querySelector(a.getAttribute('href')) };
    }).filter(function (i) { return i.el && i.a.getAttribute('href') !== '#top'; });   // "Top" is a link back to the title, never the current section
    var overview = document.getElementById('overview');
    if (!overview || !items.length) return;
    menu.hidden = false;
    var ticking = false;
    function update() {
      ticking = false;
      var navH = document.querySelector('nav.top').offsetHeight || 56;
      var show = overview.getBoundingClientRect().top <= navH + 80;
      menu.classList.toggle('show', show);
      if (!show) return;
      var line = navH + 140, current = null;
      items.forEach(function (i) { if (i.el.getBoundingClientRect().top <= line) current = i; });
      var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) current = items[items.length - 1];
      var idx = items.indexOf(current);
      items.forEach(function (i, k) { i.a.classList.toggle('on', i === current); i.a.classList.toggle('past', idx > -1 && k < idx); });
      /* lit timeline segment: from the first dot down to the current one (full length once we are at Cite) */
      var ul = menu.querySelector('ul');
      var fill = 0;
      if (current && ul.contains(current.a)) fill = current.a.offsetTop + current.a.offsetHeight / 2 - 14;
      else if (current) fill = ul.offsetHeight - 28;
      ul.style.setProperty('--fill', Math.max(0, fill) + 'px');
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  })();

  /* ---------- theme toggle ---------- */
  var btn = document.getElementById('theme');
  if (btn) {
    var root = document.documentElement;
    var saved = null;
    try { saved = localStorage.getItem('eswe-theme'); } catch (e) {}
    if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;

    var effective = function () {
      return root.dataset.theme || 'dark';
    };
    var label = function () {
      btn.textContent = effective() === 'dark' ? '☀' : '☾';
      btn.title = 'Switch to ' + (effective() === 'dark' ? 'light' : 'dark') + ' theme';
      btn.setAttribute('aria-label', btn.title);
    };
    label();

    btn.addEventListener('click', function () {
      root.dataset.theme = effective() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('eswe-theme', root.dataset.theme); } catch (e) {}
      label();
    });
  }

  /* ---------- scroll motion ----------
     Elements are tagged and html.reveal is set in the same synchronous pass, so
     the hidden state and the markup it targets always land together. JS off =>
     html.reveal is never set => nothing is hidden and the page stays readable. */
  (function () {
    if (!('IntersectionObserver' in window)) return;
    var root = document.documentElement;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* 1 - tag what reveals. Group children stagger against each other; solo
           elements just fade up on their own. */
    var GROUPS = ['.grid2', '.grid3', '.stats', '.ladder', '.gallery', '.fm-row'];
    var SOLO = ['.sec-head', 'h3.sub', 'hr.rule', '.note', '.cap', '.bib', '.tbl-scroll',
                'details.catalog', '.filters', '.wrap > p', '.wrap > figure.fig',
                '[data-chart]'];   /* [data-chart] also catches chart cards that
                                      sit outside a grid, e.g. the results line */
    var STEP = 70;   /* ms between siblings */

    /* The stagger is applied by scheduling when .rv-in lands, NOT by an inline
       transition-delay: that would stay on the element afterwards and delay
       every later transition on it too (the gallery cards' hover, for one). */
    GROUPS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (g) {
        Array.prototype.forEach.call(g.children, function (child, i) {
          child.setAttribute('data-rv', '');
          child.dataset.rvi = i;
        });
      });
    });
    SOLO.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (n) {
        if (!n.hasAttribute('data-rv') && !n.closest('[data-rv]')) n.setAttribute('data-rv', '');
      });
    });

    root.classList.add('reveal');          /* activates the hidden state */

    /* 2 - reveal on intersect, once each */
    function show(el, step) {
      var i = parseInt(el.dataset.rvi || 0, 10);
      if (reduce || !i) { el.classList.add('rv-in'); return; }
      setTimeout(function () { el.classList.add('rv-in'); }, i * step);
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        show(e.target, STEP);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('[data-rv]').forEach(function (n) { obs.observe(n); });
  })();

  /* ---------- copy bibtex ---------- */
  var copy = document.getElementById('copybib');
  if (copy) {
    copy.addEventListener('click', function () {
      var text = document.getElementById('bib').textContent;
      var done = function () {
        copy.textContent = 'Copied';
        setTimeout(function () { copy.textContent = 'Copy'; }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
      else done();
    });
  }
})();
