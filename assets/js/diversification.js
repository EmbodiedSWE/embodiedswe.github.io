/* Animate the original figure's real renders without generating synthetic data.
 * Individual 1920 × 1080 sources keep the crops sharp on high-density screens.
 */
(function () {
  'use strict';
  var host = document.getElementById('diversification');
  if (!host) return;
  var levels = [
    {name:'Scene', color:'var(--solve)', title:'Change the task.', mult:'×5',
      description:'Vary objects, distractors, and object counts. The agent adapts the solution and success condition to the new scene.',
      tags:['Object type', 'Distractors', 'Object count'],
      frames:[['Banana · base','banana',900,620,850],['Carrot','carrot',900,620,850],['Tomato','tomato',900,620,850]]},
    {name:'Strategy', color:'var(--teach)', title:'Find another way to solve it.', mult:'×4',
      description:'Change the grasp, reorder interchangeable steps, or choose another plan. Recovery branches let the robot regrasp a dropped object and continue.',
      tags:['Recovery', 'Step order', 'Grasp side', 'Task plan'],
      frames:[['Nominal insertion · base','nominal',860,540,1100],['Drop → regrasp → insert','recovery',860,540,1100],['Alternate grasp side','grasp-right',1000,480,1100]]},
    {name:'Phase', color:'var(--learn)', title:'Start further into the task.', mult:'×2.5',
      description:'Initialize a valid intermediate state and finish from there. Entry phases and object arrangements vary without replaying every earlier step.',
      tags:['Entry phase', 'Intermediate state'],
      frames:[['Start at bolting · base','bolting',900,380,1100],['Start at RAM · bolts done','ram',900,380,1100],['Start at GPU · RAM done','gpu',900,380,1100]]},
    {name:'Dynamics', color:'var(--teach)', title:'Vary the motion, keep the goal.', mult:'×4',
      description:'Use stronger action noise in transport and weaker noise during insertion. Sample mass, friction, and contact from agent-declared ranges.',
      tags:['Phase-specific action noise', 'Mass', 'Friction', 'Contact'],
      frames:[['Transport · stronger noise','transport',900,630,1200],['Insertion · weaker noise','insertion',900,630,1200],['Sample physical parameters','params']]},
    {name:'Visual', color:'var(--learn)', title:'The same motion. New observations.', mult:'×3',
      description:'Re-render recorded states with new backgrounds, lighting, and camera poses. The physical trajectory stays the same; no re-simulation is needed.',
      tags:['Background', 'Lighting', 'Camera pose'],
      frames:[['Original · daylight','daylight',880,560,880],['Warm lighting','warm',880,560,880],['Side camera','side',1150,560,950]]}
  ];
  var player = host.querySelector('.diversification-player');
  var stage = host.querySelector('.diversification-stage');
  var tabs = host.querySelector('.diversification-levels');
  var toggle = host.querySelector('.diversification-toggle');
  var progress = host.querySelector('.diversification-timeline span');
  var status = host.querySelector('.diversification-status');
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var paused = motion.matches, visible = false, current = 0, elapsed = 0, previous = 0, raf = 0;
  var duration = 6500;
  var source = host.querySelector('.diversification-fallback');
  var assetRoot = 'assets/img/diversification/';

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
    stage.innerHTML = '<div class="diversification-summary"><div><span class="diversification-number">LEVEL 0' + (index + 1) +
      '</span><h4>' + level.title + '</h4></div><div class="diversification-mult">' + level.mult + '<span>level multiplier</span></div></div>' +
      '<div class="diversification-frames">' + level.frames.map(function (frame, i) {
        return '<figure class="diversification-frame" style="--frame-delay:' + (i * 130) + 'ms">' +
          renderFrame(frame) +
          '<figcaption>' + frame[0] + '</figcaption></figure>';
      }).join('') + '</div><p class="diversification-description">' + level.description + '</p>' +
      '<div class="diversification-tags">' + level.tags.map(function (tag) { return '<span>' + tag + '</span>'; }).join('') + '</div>';
    // Only manual changes announce, so auto-play does not interrupt reading.
    if (announce) status.textContent = 'Level ' + (index + 1) + ': ' + level.name + '. ' + level.description;
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
    toggle.textContent = paused ? '▷ Play' : 'Ⅱ Pause';
    toggle.setAttribute('aria-label', paused ? 'Play level animation' : 'Pause level animation');
    toggle.setAttribute('aria-pressed', String(paused));
    if (!paused && visible && !document.hidden) raf = requestAnimationFrame(tick);
  }

  tabs.innerHTML = levels.map(function (level, i) {
    return '<button type="button" aria-pressed="false"><span>0' + (i + 1) + '</span> ' + level.name + '</button>';
  }).join('');
  tabs.querySelectorAll('button').forEach(function (button, index) {
    button.addEventListener('click', function () { paused = true; show(index, true); sync(); });
  });
  host.querySelector('.diversification-next').addEventListener('click', function () {
    paused = true; show((current + 1) % levels.length, true); sync();
  });
  toggle.addEventListener('click', function () { paused = !paused; sync(); });
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
