/* Animate the original figure's real renders without generating synthetic data.
 * Individual 1920 × 1080 sources keep the crops sharp on high-density screens.
 */
(function () {
  'use strict';
  var host = document.getElementById('diversification');
  if (!host) return;
  var levels = [
    {name:'Scene', color:'var(--solve)', title:'Change the task.', mult:'×5', clips:true,
      caption:'Example of swapping the object: the agent swaps the food being cut from a banana to a carrot or a tomato.',
      description:'This level edits the task itself. Typical edits <b>swap the object</b> being manipulated, change <b>the number of objects</b> the task involves, or add <b>task-irrelevant objects</b> to the workspace as distractors. Because the task has changed, the coding agent rewrites both the success condition and the solution code so that the new scene is solved and graded correctly.',
      frames:[['Banana · base','banana',900,620,850],['Carrot','carrot',900,620,850],['Tomato','tomato',900,620,850]]},
    {name:'Strategy', color:'var(--teach)', title:'Find another way to solve it.', mult:'×4', clips:true,
      caption:'Examples: a recovery phase that regrasps a dropped light bulb and finishes screwing it in, and a different grasp site for folding the T-shirt.',
      description:'This level modifies the verified solution strategy directly. The agent changes the <b>order of interchangeable steps</b>, for example which screw to fasten first; changes a <b>preference</b> such as the grasp site; changes <b>execution parameters</b> such as force or speed; and adds a <b>recovery phase</b> for when a solve fails because of noise or GPU nondeterminism.',
      frames:[['Drop, regrasp, screw in','recovery'],['Grasp the shirt from another side','grasp-side']]},
    {name:'Phase', color:'var(--learn)', title:'Start further into the task.', mult:'×2.5',
      caption:'Example on the humanoid egg-carton task: rollouts start from scratch or from intermediate stages, where some eggs already sit in different slots and the rest lie in arbitrary layouts on the table.',
      description:'This level targets state-space coverage. The agent perturbs <b>task initializations</b>, such as object and robot poses, which are difficult to engineer comprehensively at scale. For long-horizon tasks, trajectory distributions can further narrow at intermediate stages. We therefore allow the agent to identify <b>underrepresented intermediate states</b> and use them as new starting points, improving coverage of otherwise rarely visited regions of the task.',
      frames:[['Eggs on the table, carton empty','human_egg_1',900,600,1150],['Eggs spread across the table, one seated','human_egg_2',1000,580,1150],['Eggs in other slots, another layout','human_egg_3',1080,600,1150]]},
    {name:'Dynamics', color:'var(--teach)', title:'Vary the motion, keep the goal.', mult:'×4',
      description:'This level focuses on local perturbations to the trajectory dynamics. We randomize <b>physical parameters</b> such as mass, friction, and contact properties, while injecting <b>DART-style action noise</b> during execution. The noise can be <b>adapted across phases</b> of the task \u2014 for example, stronger during transport and weaker during precise manipulation \u2014 so that the resulting trajectories capture realistic deviations and recovery behaviors while improving robustness and local state coverage.',
      frames:[['Transport · stronger noise','transport',900,630,1200],['Insertion · weaker noise','insertion',900,630,1200],['Sample physical parameters','params']]},
    {name:'Visual', color:'var(--learn)', title:'The same motion. New observations.', mult:'×3',
      description:'This level produces new observations of the same physical trajectory. Recorded simulator states are re-rendered offline with different backgrounds, lighting (daylight, warm indoor light), materials and camera poses. Nothing is re-simulated and the actions are unchanged, so visual variety is added at almost no cost in agent tokens or simulation time.',
      frames:[['Original · daylight','daylight',880,560,880],['Warm lighting','warm',880,560,880],['Side camera','side',1150,560,950]]}
  ];
  var player = host.querySelector('.diversification-player');
  var stage = host.querySelector('.diversification-stage');
  var tabs = host.querySelector('.diversification-levels');
  var progress = host.querySelector('.diversification-timeline span');
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var paused = motion.matches, visible = false, current = 0, elapsed = 0, previous = 0, raf = 0;
  var duration = 6500;
  var source = host.querySelector('.diversification-fallback');
  var assetRoot = 'assets/img/diversification/';
  var clipRoot = 'assets/video/diversification/';

  // Short looping rollout clips (720 x 480, the frame's own 3:2 ratio), muted and
  // inline, with the matching WebP as poster. Autoplay only when motion is allowed.
  function renderClip(frame) {
    return '<video class="diversification-clip" src="' + clipRoot + frame[1] + '.mp4" poster="' + clipRoot + frame[1] +
      '.webp" muted loop playsinline preload="metadata" aria-label="' + frame[0] + '"' + (motion.matches ? '' : ' autoplay') + '></video>';
  }

  function renderFrame(frame) {
    var svg = '<svg viewBox="0 0 337.5 225" role="img" aria-label="' + frame[0] + '">';
    if (frame[1] === 'params') {
      // Same schematic ranges as the source figure, expressed as crisp vectors.
      svg += '<g font-family="system-ui,sans-serif" font-size="17" fill="var(--ink)">';
      [['mass',0.55],['friction',0.8],['contact',0.35]].forEach(function (row, i) {
        var y = 30 + i * 57, point = 20 + row[1] * 297;
        svg += '<text x="20" y="' + y + '">' + row[0] + '</text>' +
          '<path d="M20 ' + (y + 17) + 'H317" stroke="var(--line)" stroke-width="3"/>' +
          '<path d="M' + (point - 65) + ' ' + (y + 17) + 'h130" stroke="var(--teach)" stroke-width="6" stroke-linecap="round"/>' +
          '<circle cx="' + point + '" cy="' + (y + 17) + '" r="5"/>';
      });
      return svg + '<text x="20" y="211" fill="var(--mut)" font-size="13">agent-declared ranges</text></g></svg>';
    }
    // Match the figure builder's crop centers and height, at the viewer's 3:2 ratio.
    var h = Math.min(Math.floor(frame[4] * 0.75), 1080), w = h * 1.5;
    var x = Math.max(0, Math.min(1920 - w, frame[2] - w / 2));
    var y = Math.max(0, Math.min(1080 - h, frame[3] - h / 2));
    svg += '<svg width="337.5" height="225" viewBox="' + [x,y,w,h].join(' ') + '">' +
      '<image href="' + assetRoot + frame[1] + '.webp" width="1920" height="1080"/></svg>';
    if (frame[1] === 'transport' || frame[1] === 'insertion') {
      // Illustrative noise bands, matching the original figure's path geometry.
      var transport = frame[1] === 'transport';
      svg += '<g fill="none" stroke="#ef9690" stroke-width="1.5" opacity=".85">';
      for (var i = 0; i < 16; i++) {
        var offset = Math.sin(i * 2.4) * (transport ? 22 : 4);
        var path = transport ? 'M58.75 200 Q' + (128.75 + offset) + ' ' + (30 + offset * 2) + ' 240.75 130' :
          'M240.75 60 Q' + (240.75 + offset) + ' 105 240.75 150';
        svg += '<path d="' + path + '"/>';
      }
      svg += '</g><path d="' + (transport ? 'M58.75 200 Q128.75 30 240.75 130' : 'M240.75 60V150') +
        '" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="240.75" cy="' +
        (transport ? 130 : 150) + '" r="4" fill="#cf796b" stroke="#fff"/>';
    }
    return svg + '</svg>';
  }

  function show(index, announce) {
    current = index;
    elapsed = 0;
    progress.style.transform = 'scaleX(0)';
    var level = levels[index];
    host.style.setProperty('--level-color', level.color);
    tabs.querySelectorAll('button').forEach(function (button, i) {
      button.setAttribute('aria-pressed', String(i === index));
    });
    // Name first, in the level colour, then the explanation, then the renders.
    stage.innerHTML = '<div class="diversification-summary"><span class="diversification-number">LEVEL 0' + (index + 1) +
      '</span><h4><mark>' + level.name + '</mark></h4>' +
      '<p class="diversification-description">' + level.description + '</p>' +
      '</div>' +
      '<div class="diversification-frames" style="--tiles:' + level.frames.length + '">' + level.frames.map(function (frame, i) {
        return '<figure class="diversification-frame" style="--frame-delay:' + (i * 130) + 'ms">' +
          (level.clips ? renderClip(frame) : renderFrame(frame)) +
          (level.caption ? '' : '<figcaption>' + frame[0] + '</figcaption>') + '</figure>';
      }).join('') + '</div>' +
      (level.caption ? '<p class="diversification-caption">' + level.caption + '</p>' : '');
    if (level.clips && !motion.matches) {
      stage.querySelectorAll('video').forEach(function (video) {
        var attempt = video.play();
        if (attempt && attempt.catch) attempt.catch(function () {});
      });
    }
  }

  function tick(now) {
    raf = 0;
    if (paused || !visible || document.hidden) { previous = 0; return; }
    if (previous) elapsed += Math.min(now - previous, 100);
    previous = now;
    if (elapsed >= duration) show((current + 1) % levels.length, false);
    progress.style.transform = 'scaleX(' + elapsed / duration + ')';
    raf = requestAnimationFrame(tick);
  }

  function sync() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    previous = 0;
    host.classList.toggle('diversification-paused', paused);
    if (!paused && visible && !document.hidden) raf = requestAnimationFrame(tick);
  }

  tabs.innerHTML = levels.map(function (level, i) {
    return '<button type="button" aria-pressed="false" style="--tab-color:' + level.color + ';--tab-bg:' +
      level.color.replace(')', '-bg)') + '"><span>0' + (i + 1) + '</span>' + level.name + '</button>';
  }).join('');
  tabs.querySelectorAll('button').forEach(function (button, index) {
    button.addEventListener('click', function () { paused = true; show(index, true); sync(); });
  });
  motion.addEventListener('change', function (event) { paused = event.matches; sync(); });
  document.addEventListener('visibilitychange', sync);

  function start() {
    if (!source.naturalWidth) return; // Leave the reference figure as fallback.
    show(0, false);
    player.hidden = false;
    source.hidden = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        sync();
      }, {threshold:0.25}).observe(player);
    } else { visible = true; sync(); }
  }
  if (source.complete) start();
  else source.addEventListener('load', start, {once:true});
})();
