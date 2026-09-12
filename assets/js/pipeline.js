/* Figure 1, Coding_agent_for_robotics.pdf (September 11, 2026).
 * Concurrent conceptual flows, not measured throughput or experimental results.
 */
(function () {
  'use strict';
  var host = document.getElementById('pipeline');
  if (!host) return;
  var stages = [
    {role:'Benchmark', title:'Benchmark Tasks', color:'var(--solve)',
      description:'An agent-native benchmark of 28 long-horizon dexterous tasks across six suites. Coding agents interact with the simulator; offline graders evaluate physical task progress.',
      result:'One task combines a scene, a robot, and a controller.', href:'#benchmark', link:'Explore the benchmark'},
    {role:'Solver', title:'Coding Agent Solves Tasks', color:'var(--learn)',
      description:'The coding agent writes solution code (solve.py), executes and evaluates it in the simulator, and uses simulation feedback to revise the solution. This inner feedback loop turns physical task outcomes into the next code revision.',
      result:'Agent → solution code → simulator → simulation feedback → agent.', href:'#results', link:'Explore agent results'},
    {role:'Teacher', title:'Data Generation + VLA', color:'var(--teach)',
      description:'EmbodiedSWE-Gen expands a verified solve across scene, strategy, phase, dynamics, and visual variation. Trajectories passing the grader and replay check become supervision for a generalist robot policy that acts without the coding agent in the loop.',
      result:'One solution → Scene × Strategy × Phase × Dynamics × Visual → large dataset → VLA.', href:'#teacher', link:'Explore EmbodiedSWE-Gen'},
    {role:'Student', title:'Agent Improvement', color:'var(--solve)',
      description:'Task generation expands a seed task into new simulation tasks. Verified outcomes provide the reinforcement-learning signal for the coding agent. The improved agent becomes the solver in stage 02, closing the proposed feedback loop. The full pipeline has not yet been run end to end.',
      result:'Seed task → task generation → new tasks → verified outcomes → RL → improved coding agent.', href:'#student', link:'Explore coding-agent training'}
  ];
  var cards = Array.prototype.slice.call(host.querySelectorAll('.pipeline-card'));
  var map = host.querySelector('.pipeline-map');
  var svg = host.querySelector('.pipeline-connections');
  var pathsGroup = host.querySelector('.pipeline-paths');
  var particlesGroup = host.querySelector('.pipeline-particles');
  var toggle = host.querySelector('.pipeline-toggle');
  var next = host.querySelector('.pipeline-next');
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var paused = motion.matches, visible = false, current = 0, elapsed = 0, previous = 0, raf = 0;
  var paths = [], tracks = [], localTracks = [];
  var ns = 'http://www.w3.org/2000/svg';

  function makeTrack(path, group, color, local) {
    var length = path.getTotalLength();
    var count = Math.max(1, Math.ceil(length / (local ? 150 : 180)));
    var dots = [];
    path.setAttribute('marker-end', 'url(#pipeline-arrow)');
    for (var i = 0; i < count; i++) {
      var dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('r', local ? '2.5' : '3');
      dot.setAttribute('class', 'pipeline-particle');
      dot.style.setProperty('--flow-color', color);
      group.appendChild(dot);
      dots.push(dot);
    }
    return {path:path, length:length, dots:dots, speed:local ? 0.045 : 0.065};
  }

  function placeParticles() {
    tracks.concat(localTracks).forEach(function (track, index) {
      track.dots.forEach(function (dot, i) {
        var progress = (elapsed * track.speed / Math.max(1, track.length) + i / track.dots.length + index * 0.17) % 1;
        var point = track.path.getPointAtLength(progress * track.length);
        dot.setAttribute('cx', point.x);
        dot.setAttribute('cy', point.y);
        dot.style.opacity = String(Math.min(1, progress * 8, (1 - progress) * 8));
      });
    });
  }

  function layout() {
    var bounds = map.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    svg.setAttribute('viewBox', '0 0 ' + bounds.width + ' ' + bounds.height);
    var boxes = cards.map(function (card) {
      var rect = card.getBoundingClientRect();
      return {left:rect.left - bounds.left, right:rect.right - bounds.left,
        top:rect.top - bounds.top, bottom:rect.bottom - bounds.top,
        cx:rect.left - bounds.left + rect.width / 2, cy:rect.top - bounds.top + rect.height / 2};
    });
    var vertical = window.matchMedia('(max-width: 900px)').matches;
    pathsGroup.replaceChildren();
    particlesGroup.replaceChildren();
    paths = [];
    tracks = [];
    boxes.forEach(function (a, i) {
      // The revised figure returns the improved agent to the SOLVER, not the benchmark.
      var b = boxes[i === 3 ? 1 : i + 1];
      var d;
      if (i < 3) {
        d = vertical ? 'M' + a.cx + ' ' + a.bottom + 'V' + b.top : 'M' + a.right + ' ' + a.cy + 'H' + b.left;
      } else if (vertical) {
        d = 'M' + a.left + ' ' + a.cy + 'H16Q8 ' + a.cy + ' 8 ' + (a.cy - 8) +
          'V' + (b.cy + 8) + 'Q8 ' + b.cy + ' 16 ' + b.cy + 'H' + b.left;
      } else {
        var y = a.bottom + 36;
        d = 'M' + a.cx + ' ' + a.bottom + 'V' + (y - 12) + 'Q' + a.cx + ' ' + y + ' ' + (a.cx - 12) + ' ' + y +
          'H' + (b.cx + 12) + 'Q' + b.cx + ' ' + y + ' ' + b.cx + ' ' + (y - 12) + 'V' + b.bottom;
      }
      var path = document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      path.dataset.from = String(i);
      path.dataset.to = String(i === 3 ? 1 : i + 1);
      path.style.setProperty('--flow-color', stages[i].color);
      if (i === 3) path.classList.add('pipeline-return');
      path.classList.toggle('pipeline-path-active', i === current);
      pathsGroup.appendChild(path);
      paths.push(path);
      tracks.push(makeTrack(path, particlesGroup, stages[i].color, false));
    });
    placeParticles();
  }

  function show(index, manual) {
    current = index;
    var stage = stages[index];
    host.style.setProperty('--stage-color', stage.color);
    cards.forEach(function (card, i) {
      card.setAttribute('aria-pressed', String(i === index));
      card.classList.toggle('is-active', i === index);
    });
    paths.forEach(function (path, i) { path.classList.toggle('pipeline-path-active', i === index); });
    host.querySelector('.pipeline-detail-kicker').textContent = '0' + (index + 1) + ' / ' + stage.role;
    host.querySelector('.pipeline-detail h4').textContent = stage.title;
    host.querySelector('.pipeline-detail-description').textContent = stage.description;
    host.querySelector('.pipeline-detail-result').textContent = stage.result;
    var link = host.querySelector('.pipeline-detail-link');
    link.href = stage.href;
    link.textContent = stage.link + ' ↗';
    if (manual) host.querySelector('.pipeline-status').textContent = stage.title + '. ' + stage.description;
  }

  function tick(now) {
    raf = 0;
    if (paused || !visible || document.hidden) { previous = 0; return; }
    if (previous) elapsed += Math.min(now - previous, 100);
    previous = now;
    placeParticles();
    raf = requestAnimationFrame(tick);
  }

  function sync() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    previous = 0;
    var running = !paused && visible && !document.hidden;
    host.classList.toggle('pipeline-running', running);
    toggle.textContent = paused ? '▷ Play' : 'Ⅱ Pause';
    toggle.setAttribute('aria-label', paused ? 'Play pipeline animation' : 'Pause pipeline animation');
    toggle.setAttribute('aria-pressed', String(paused));
    if (running) raf = requestAnimationFrame(tick);
  }

  function inspect(index) {
    show(index, true);
  }
  cards.forEach(function (card, index) {
    card.disabled = false;
    card.setAttribute('aria-controls', 'pipeline-detail');
    card.addEventListener('click', function () { inspect(index); });
  });
  toggle.hidden = false;
  next.hidden = false;
  toggle.addEventListener('click', function () { paused = !paused; sync(); });
  next.addEventListener('click', function () { inspect((current + 1) % 4); });
  motion.addEventListener('change', function (event) { paused = event.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; sync(); }, {threshold:0.1}).observe(map);
  } else visible = true;
  if ('ResizeObserver' in window) new ResizeObserver(layout).observe(map);
  else window.addEventListener('resize', layout, {passive:true});
  host.querySelectorAll('.pipeline-visual svg').forEach(function (miniature) {
    var group = document.createElementNS(ns, 'g');
    miniature.appendChild(group);
    miniature.querySelectorAll('[data-flow]').forEach(function (path) {
      localTracks.push(makeTrack(path, group, 'var(--card-color)', true));
    });
  });
  show(0, false);
  layout();
  sync();
})();
