/* EmbodiedSWE project page — video task explorer, catalog, nav scroll-spy, theme. */
(function () {
  'use strict';

  /* ---------- rendered rollouts (26 clips available) ---------- */
  var CLIPS = [
    { f:'ikea_table',      name:'Table assembly',    scene:'ikea_table',     suite:'assembly',  diff:'Hard',   emb:'Bimanual Franka',       sp:4, desc:'Thread four legs onto the corner studs of a tabletop.' },
    { f:'so101',           name:'Robot-arm assembly',scene:'so101',          suite:'assembly',  diff:'Hard',   emb:'Bimanual Franka',       sp:1, desc:'Seat the servo, screw it down, clip on the forearm.' },
    { f:'pc_motherboard',  name:'Motherboard mount', scene:'pc_motherboard', suite:'assembly',  diff:'Medium', emb:'Franka · xArm7 · Gen3', sp:2, desc:'Drive seven mounting bolts with an Allen key to secure a motherboard in a case.' },
    { f:'allen_bolt',      name:'Allen bolt',        scene:'allen_bolt',     suite:'assembly',  diff:'Medium', emb:'Franka · xArm7 · Gen3', sp:1, desc:'Drive an Allen bolt into a threaded plate using an L-shaped key.' },
    { f:'bulb',            name:'Bulb screwing',     scene:'bulb',           suite:'assembly',  diff:'Medium', emb:'Franka · xArm7 · Gen3', sp:5, desc:'Pick up a light bulb and screw it into its socket until fully seated.' },
    { f:'nut_thread',      name:'Nut threading',     scene:'nut_thread',     suite:'assembly',  diff:'Easy',   emb:'Franka · xArm7 · Gen3', sp:1, desc:'Pick up an M16 nut and thread it onto a fixed bolt.' },
    { f:'pc_gpu',          name:'GPU insertion',     scene:'pc_gpu',         suite:'assembly',  diff:'Easy',   emb:'Franka · xArm7 · Gen3', sp:1, desc:'Align a graphics card with a PCIe slot and press it into place.' },
    { f:'pc_gpu_ram',      name:'GPU + RAM install', scene:'pc_gpu_ram',     suite:'assembly',  diff:'Medium', emb:'Franka · xArm7 · Gen3', sp:2, desc:'Install a graphics card and then seat two memory modules in their slots.' },
    { f:'pc_ram',          name:'RAM seating',       scene:'pc_ram',         suite:'assembly',  diff:'Easy',   emb:'Franka · xArm7 · Gen3', sp:1, desc:'Align and seat two memory modules in separate DIMM slots.' },
    { f:'tool_packing',    name:'Tool packing',      scene:'tool_packing',   suite:'packing',   diff:'Medium', emb:'Franka · xArm7 · Gen3', sp:5, desc:'Stow three tools in their assigned drawers, then close the cabinet.' },
    { f:'pen_holder',      name:'Pen holder',        scene:'pen_holder',     suite:'packing',   diff:'Easy',   emb:'Franka · xArm7 · Gen3', sp:1, desc:'Insert every present pen tip-up, then stand the filled holder upright.' },
    { f:'egg_carton',      name:'Egg carton',        scene:'egg_carton',     suite:'packing',   diff:'Hard',   emb:'Unitree G1',            sp:1, desc:'Seat three eggs upright in the cells of an egg carton, then push the hinged lid closed.' },
    { f:'clear_organic',   name:'Clear organics',    scene:'clear_organic_objects', suite:'packing', diff:'Medium', emb:'Franka · Unitree G1', sp:2, desc:'Clear the organic objects on a cluttered table into a bin while leaving the other items in place.' },
    { f:'syringe',         name:'Syringe dosing',    scene:'syringe',        suite:'puzzle',    diff:'Hard',   emb:'Bimanual Franka',       sp:1, desc:'Draw liquid from a reservoir, meter three target doses, and repark the syringe.' },
    { f:'coffee',          name:'Coffee brewing',    scene:'coffee',         suite:'puzzle',    diff:'Medium', emb:'Franka · xArm7 · Gen3', sp:1, desc:'Load a capsule, brew, and return the filled mug to the serving tray.' },
    { f:'spatula',         name:'Spatula flip',      scene:'spatula',        suite:'puzzle',    diff:'Easy',   emb:'Franka · xArm7 · Gen3', sp:1, desc:'Wedge a spatula under bread, flip it, reload the blade, and serve to a plate.' },
    { f:'push_shapes',     name:'Push shapes',       scene:'push_shapes',    suite:'puzzle',    diff:'Easy',   emb:'Unitree G1',            sp:1, desc:'Push three blocks onto their matching pads, correcting each block’s orientation along the way.' },
    { f:'classify_objects', name:'Classify objects', scene:'classify_objects', suite:'puzzle',  diff:'Easy',   emb:'Unitree G1',            sp:1, desc:'Sort scattered coloured blocks into the zones matching their colours.' },
    { f:'stack_blocks',    name:'Stack blocks',      scene:'stack_blocks',   suite:'puzzle',    diff:'Medium', emb:'Unitree G1',            sp:1, desc:'Stack scattered blocks into a single aligned tower on a marked pad.' },
    { f:'tshirt',          name:'T-shirt folding',   scene:'tshirt',         suite:'deformable', diff:'Medium', emb:'Franka · xArm7 · Gen3', sp:2, desc:'Fold a T-shirt into a compact, flat bundle.' },
    { f:'latte',           name:'Latte pouring',     scene:'latte',          suite:'deformable', diff:'Hard',   emb:'Bimanual Franka',       sp:3, desc:'Coordinate two arms to pour milk into a carried coffee mug without excessive spilling.' },
    { f:'dumpling',        name:'Dough rolling',     scene:'dumpling',       suite:'deformable', diff:'Hard',   emb:'Franka',                sp:1, desc:'Roll a ball of dough flat into a round dumpling wrapper with a rolling pin.' },
    { f:'slice_banana',    name:'Banana slicing',           scene:'slice',          suite:'cutting',   diff:'Easy',   emb:'Franka · xArm7 · Gen3', sp:1, desc:'Pick up a chef knife and slice a banana into a target number of pieces.' },
    { f:'fruit_delivery',  name:'Fruit delivery',    scene:'fruit_delivery', suite:'locomanip', diff:'Medium', emb:'Unitree G1',            sp:1, desc:'Pick up every fruit on a long table and carry it around the table to a plate beyond arm reach.' },
    { f:'box_to_bin',      name:'Box to bin',        scene:'box_to_bin',     suite:'locomanip', diff:'Medium', emb:'Unitree G1',            sp:1, desc:'Pick a box off a shelf and carry it to a sorting bin across the room.' },
    { f:'wheel_carry',     name:'Wheel carry',       scene:'wheel_carry',    suite:'locomanip', diff:'Medium', emb:'Unitree G1',            sp:1, desc:'Pick a steering wheel off one packing table and carry it to a basket on another, three metres away.' }
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
    ['Packing','clear_organic_objects','Clear the organic objects on a cluttered table into a bin while leaving the other items in place.','Franka · Unitree G1','Medium'],
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

  /* ---------- video task explorer ---------- */
  var explorer = document.getElementById('task-explorer');
  var clipsByScene = {};
  CLIPS.forEach(function (t) { clipsByScene[t.scene.toLowerCase()] = t; });
  clipsByScene.so_101 = clipsByScene.so101;
  var suiteNames = {assembly:'Assembly', packing:'Packing', puzzle:'Puzzle',
    deformable:'Deformable', cutting:'Cutting', locomanip:'Locomotion + manipulation'};
  var challenges = {
    assembly:'Align parts precisely and maintain stable contact through insertion or fastening.',
    packing:'Sequence grasps and placements in confined spaces without disturbing objects already placed.',
    puzzle:'Complete a sequence of tool and object interactions, with each step setting up the next.',
    deformable:'Control objects whose shape or flow changes throughout the interaction.',
    cutting:'Orient the knife and control contact as cutting changes the object’s geometry.',
    locomanip:'Coordinate grasping, carrying, and placement while moving beyond the initial workspace.'
  };
  var taskChallenges = {
    ikea_table:'Coordinate two arms to align and engage threads, then repeat the sequence across four legs.',
    tshirt:'Control flexible cloth through successive folds while keeping the final bundle flat and compact.',
    latte:'Coordinate the pitcher and mug with two arms while controlling liquid flow and spillage.',
    slice_banana:'Grasp and orient a knife, then make repeated cuts as the banana separates into pieces.',
    syringe:'Coordinate two arms to draw liquid, dispense three target doses, and return the syringe.',
    wheel_carry:'Keep a stable grasp on the wheel while moving between tables three metres apart.',
    so101:'Sequence servo placement, tool use, fastening, and forearm attachment in a constrained assembly.',
    bulb:'Maintain alignment and controlled rotation as the bulb engages its threaded socket.',
    egg_carton:'Place fragile objects upright in small cells, then close the lid without dislodging them.'
  };
  var missingNames = {shoe_knot:'Shoelace tying', dice:'Dicing'};

  if (explorer) {
    var player = document.getElementById('task-player');
    var home = document.getElementById('task-player-home');
    var video = document.getElementById('task-video');
    var grid = document.getElementById('task-grid');
    var featured = document.getElementById('task-featured');
    var error = document.getElementById('task-video-error');
    var announcement = document.getElementById('task-announcement');
    var mobile = window.matchMedia('(max-width:700px)');
    var selected = null;
    var activeCard = null;
    var byFile = {};
    CLIPS.forEach(function (t) { byFile[t.f] = t; });
    var featuredIds = ['ikea_table','tshirt','latte','slice_banana','syringe','wheel_carry'];

    function card(t) {
      return '<button class="task-tile" type="button" data-task="' + t.f +
        '" data-suite="' + t.suite + '" aria-pressed="false" aria-controls="task-player">' +
        '<span class="task-tile-image"><img src="assets/img/poster/' + t.f +
        '.jpg" width="1280" height="720" loading="lazy" decoding="async" alt="">' +
        '<span class="task-tile-play" aria-hidden="true">▶</span></span>' +
        '<span class="task-tile-copy"><strong>' + esc(t.name) + '</strong><small>' +
        esc(suiteNames[t.suite]) + '</small></span></button>';
    }
    featured.innerHTML = featuredIds.map(function (id) { return card(byFile[id]); }).join('');
    // Lead with a diverse selection even when every suite is visible.
    var ordered = featuredIds.map(function (id) { return byFile[id]; }).concat(
      CLIPS.filter(function (t) { return featuredIds.indexOf(t.f) < 0; }));
    grid.innerHTML = ordered.map(card).join('') + CATALOG.filter(function (r) {
      return !clipsByScene[r[1].toLowerCase()];
    }).map(function (r) {
      return '<article class="task-tile task-unavailable" data-suite="' + r[0].toLowerCase() +
        '"><div class="task-tile-image"><span>Video forthcoming</span></div>' +
        '<div class="task-tile-copy"><strong>' + esc(missingNames[r[1]] || r[1]) +
        '</strong><small>' + esc(suiteNames[r[0].toLowerCase()]) + '</small></div></article>';
    }).join('');
    var tiles = explorer.querySelectorAll('button[data-task]');

    function positionPlayer() {
      if (mobile.matches && activeCard && grid.contains(activeCard) && !activeCard.hidden) {
        // Insert after the selected two-column row, keeping both thumbnails together.
        var visible = Array.prototype.filter.call(grid.children, function (el) {
          return el.classList.contains('task-tile') && !el.hidden;
        });
        var index = visible.indexOf(activeCard);
        var endOfRow = visible[Math.min(index - index % 2 + 1, visible.length - 1)];
        endOfRow.after(player);
      } else {
        home.appendChild(player);
      }
    }

    function selectTask(t, trigger) {
      activeCard = trigger || null;
      video.pause();
      positionPlayer();
      if (selected !== t.f) {
        selected = t.f;
        error.hidden = true;
        video.poster = 'assets/img/poster/' + t.f + '.jpg';
        video.src = 'assets/video/' + t.f + '.mp4';
        video.setAttribute('aria-label', t.name + ' rollout');
        document.getElementById('task-title').textContent = t.name;
        document.getElementById('task-suite').textContent = suiteNames[t.suite];
        document.getElementById('task-objective').textContent = t.desc;
        document.getElementById('task-robot').textContent = t.emb.split(' · ')[0];
        document.getElementById('task-difficulty').textContent = t.diff;
        document.getElementById('task-challenge').textContent = taskChallenges[t.f] || challenges[t.suite];
        document.getElementById('task-scene').textContent = t.scene;
        document.getElementById('task-embodiments').textContent = t.emb;
        document.getElementById('task-clip-note').textContent = 'Edited excerpt' + (t.sp > 1 ? ' · ' + t.sp + '× speed' : '');
        document.getElementById('task-video-link').href = video.src;
        player.querySelector('.task-specs').open = false;
      }
      tiles.forEach(function (tile) { tile.setAttribute('aria-pressed', String(tile.dataset.task === t.f)); });
      if (trigger) {
        announcement.textContent = t.name + ' selected. ' + t.desc;
        // Keep the player in view and keyboard controls immediately reachable.
        video.focus({preventScroll:true});
        var bounds = player.getBoundingClientRect();
        if (bounds.top < 60 || bounds.bottom > window.innerHeight) {
          player.scrollIntoView({behavior:'instant', block:'start'});
        }
        video.play().catch(function () { /* Native controls remain available if autoplay is denied. */ });
      }
    }
    tiles.forEach(function (tile) {
      tile.addEventListener('click', function () { selectTask(byFile[tile.dataset.task], tile); });
    });
    video.addEventListener('error', function () { error.hidden = false; });
    video.addEventListener('loadeddata', function () { error.hidden = true; });

    var filters = explorer.querySelectorAll('.filters button');
    filters.forEach(function (button) {
      var suite = button.dataset.suite;
      var count = CATALOG.filter(function (r) { return suite === 'all' || r[0].toLowerCase() === suite; }).length;
      button.innerHTML += ' <span class="task-filter-count">' + count + '</span>';
      button.addEventListener('click', function () {
        video.pause();
        activeCard = null;
        positionPlayer();
        filters.forEach(function (other) { other.setAttribute('aria-pressed', String(other === button)); });
        var taskCount = 0, videoCount = 0;
        grid.querySelectorAll('.task-tile').forEach(function (tile) {
          tile.hidden = suite !== 'all' && tile.dataset.suite !== suite;
          if (!tile.hidden) { taskCount++; if (tile.dataset.task) videoCount++; }
        });
        document.getElementById('task-results').textContent = videoCount + (videoCount === 1 ? ' video' : ' videos') +
          ' · ' + taskCount + (taskCount === 1 ? ' task' : ' tasks');
      });
    });
    mobile.addEventListener('change', function () { video.pause(); positionPlayer(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) video.pause(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { if (!entry.isIntersecting) video.pause(); });
      }, {threshold:0}).observe(video);
    }
    selectTask(byFile.ikea_table);
    document.getElementById('task-browser').hidden = false;
  }

  /* ---------- catalog table ---------- */
  var body = document.getElementById('catalog-body');
  if (body) {
    body.closest('details').hidden = false;
    body.innerHTML = CATALOG.map(function (r) {
      var clip = clipsByScene[r[1].toLowerCase()];
      var name = clip ? clip.name : missingNames[r[1]] || r[1];
      return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(name) + '<br><code>' + esc(r[1]) + '</code></td>' +
        '<td class="wrap-ok">' + esc(r[2]) + '</td><td>' + esc(r[3]) + '</td>' +
        '<td><span class="tag d-' + r[4].toLowerCase() + '">' + r[4] + '</span></td>' +
        '<td>' + (clip ? '<a href="assets/video/' + clip.f + '.mp4" target="_blank" rel="noopener" aria-label="Watch ' +
          esc(name) + '">Watch ↗</a>' : 'Forthcoming') + '</td></tr>';
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

    /* 1 - progress line along the bottom of the sticky nav */
    var nav = document.querySelector('nav.top'), fill = null;
    if (nav) {
      var wrap = document.createElement('div');
      wrap.className = 'progress';
      fill = document.createElement('span');
      wrap.appendChild(fill);
      nav.appendChild(wrap);
    }

    /* 2 - tag what reveals. Group children stagger against each other; solo
           elements just fade up on their own. */
    var GROUPS = ['.lanes', '.grid2', '.grid3', '.stats', '.ladder', '.fm-row'];
    var SOLO = ['.sec-head', 'h3.sub', 'hr.rule', '.note', '.cap', '.bib', '.tbl-scroll',
                'details.catalog', '.filters', '.wrap > p', '.wrap > figure.fig',
                '[data-chart]'];   /* [data-chart] also catches chart cards that
                                      sit outside a grid, e.g. the results line */
    var STEP = 70;   /* ms between siblings */

    /* The stagger is applied by scheduling when .rv-in lands, NOT by an inline
       transition-delay: that would stay on the element afterwards and delay
       every later transition on it too, including hover effects. */
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
        /* .hero-fig has its own entrance; closest() covers self and ancestors */
        if (n.classList.contains('hero-fig')) return;
        if (!n.hasAttribute('data-rv') && !n.closest('[data-rv]')) n.setAttribute('data-rv', '');
      });
    });

    /* Project details enter when scrolled into view below the full-screen hero. */
    document.querySelectorAll(
      '.project-intro .eyebrow, .project-intro h2, .project-intro .tagline,' +
      ' .project-intro .authors, .project-intro .badges').forEach(function (n, i) {
      n.setAttribute('data-rv', '');
      n.dataset.rvi = i;
    });

    root.classList.add('reveal');          /* activates the hidden state */

    /* 3 - reveal on intersect, once each */
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

    document.querySelectorAll('[data-rv], .hero-fig').forEach(function (n) { obs.observe(n); });

    /* 4 - progress line + a small parallax on the opening figure.
           The figure carries the reveal transform, so parallax rides the img
           inside it and the two never fight over one property. */
    var img = document.querySelector('.hero-fig img');
    var wide = window.matchMedia('(min-width: 900px)').matches;
    var queued = false;

    function frame() {
      queued = false;
      var y = window.pageYOffset || root.scrollTop;
      if (fill) {
        var span = (root.scrollHeight - root.clientHeight) || 1;
        fill.style.transform = 'scaleX(' + Math.min(y / span, 1).toFixed(4) + ')';
      }
      if (img && !reduce && wide) {
        img.style.transform = 'translateY(' + Math.min(y * 0.05, 18).toFixed(1) + 'px)';
      }
    }
    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(frame);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      wide = window.matchMedia('(min-width: 900px)').matches;
      onScroll();
    }, { passive: true });
    frame();
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
