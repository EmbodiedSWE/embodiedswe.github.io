/* Five original 1080p keyframes per task, selected exactly as in Figure 2.
 * Stage descriptions/times come from the source folders' PICKS.txt files.
 */
(function () {
  'use strict';
  var host = document.getElementById('task-timeline');
  if (!host) return;
  var tasks = [
    {id:'tshirt', name:'T-shirt folding', robot:'Franka', suite:'Deformable',
      objective:'Fold a T-shirt into a compact, flat bundle.',
      frames:[0,2,4,7,9], labels:['Fold sample 1','Fold sample 2','Fold sample 3','Fold sample 4','Final folded state']},
    {id:'pc_all', name:'PC assembly', robot:'Franka', suite:'Assembly',
      objective:'Fasten the motherboard, seat the memory, and insert the graphics card.',
      frames:[0,2,4,7,9], labels:['First bolt seated','Three bolts seated','Five bolts seated','First RAM stick seated','GPU inserted'],
      times:['3:15','9:05','14:50','21:35','23:30']},
    {id:'ikea_table', name:'Table assembly', robot:'Bimanual Franka', suite:'Assembly',
      objective:'Coordinate two arms to thread four legs onto a tabletop.',
      frames:[0,2,4,7,9], labels:['Parts laid out','First leg upright','First leg threaded','Three legs threaded','All four legs threaded'],
      times:['0:00','0:18','2:22','20:12','22:37']},
    {id:'so101', name:'Arm assembly', robot:'Bimanual Franka', suite:'Assembly',
      objective:'Seat the servo, drive fasteners, and attach the forearm.',
      frames:[0,2,4,7,9], labels:['Parts laid out','Servo seated','First screw positioned','Forearm lifted','Horn screw driven'],
      times:['0:00','3:12','5:36','8:14','10:36'],
      note:'Recorded rollout: forearm attached; some fasteners remain loose.'},
    {id:'box_to_bin', name:'Box to bin', robot:'G1 humanoid', suite:'Locomanip',
      objective:'Lift a box from a shelf, carry it to a bin, and release it.',
      frames:[0,2,4,7,9], labels:['At the shelf','Box lifted','Backing out','Box over the bin','Box released'],
      times:['0:00','0:11','0:20','0:32','0:35']},
    {id:'slice_banana', name:'Banana slicing', robot:'Franka', suite:'Cutting',
      objective:'Pick up a chef knife and cut a banana at the target planes.',
      frames:[0,2,4,7,9], labels:['Knife at rest','Knife lifted','First press','Cutting another plane','Six of seven planes cut'],
      times:['0:00','0:05.5','0:17','0:51','1:22.5'],
      note:'Recorded rollout: partial completion, with 6 of 7 cutting planes released.'},
    {id:'syringe', name:'Syringe dosing', robot:'Franka', suite:'Puzzle',
      objective:'Draw liquid, dispense it into three tubes, and return the syringe.',
      frames:[0,1,2,3,4], labels:['Recorded sample 1','Recorded sample 2','Recorded sample 3','Recorded sample 4','Recorded sample 5'],
      times:['0:00','0:14','0:49','1:52','2:13']},
    {id:'tool_packing', name:'Tool packing', robot:'Franka', suite:'Packing',
      objective:'Stow three tools in the drawer, then close it.',
      frames:[0,1,2,3,4], labels:['Recorded sample 1','Recorded sample 2','Recorded sample 3','Recorded sample 4','Recorded sample 5'],
      times:['0:00','0:36.27','3:01.87','5:26.93','9:41.87']},
    {id:'latte', name:'Latte pouring', robot:'Bimanual Franka', suite:'Deformable',
      objective:'Lift the pitcher and mug, pour the milk, and set both vessels down.',
      frames:[0,1,2,3,4], labels:['Vessels at rest','Both vessels grasped','Pitcher lifted','Pouring into the mug','Set down and release']},
    {id:'bulb', name:'Bulb screwing', robot:'Franka', suite:'Assembly',
      objective:'Pick up a light bulb and screw it into its socket.',
      frames:[0,1,2,3,4], labels:['Recorded sample 1','Recorded sample 2','Recorded sample 3','Recorded sample 4','Recorded sample 5'],
      times:['0:00','3:45','6:14','12:28','23:42']},
    {id:'egg_carton', name:'Egg carton', robot:'G1 humanoid', suite:'Packing',
      objective:'Seat three eggs in the carton and close the lid.',
      frames:[0,1,2,3,4], labels:['Eggs on the counter','First egg lifted','Egg over the carton','Third egg placed','Lid closed'],
      times:['0:00','0:15','0:59','2:05.5','2:49.5']},
    {id:'wheel_carry', name:'Wheel carry', robot:'G1 humanoid', suite:'Locomanip',
      objective:'Lift a wheel, walk three metres, and place it in a basket.',
      frames:[0,1,2,3,4], labels:['At the pick table','Wheel lifted','Carrying along the hall','Wheel over the basket','Standing clear'],
      times:['0:00','0:24','0:38','1:15','1:53']}
  ];
  var player = host.querySelector('.task-timeline-player');
  var list = host.querySelector('.task-timeline-list');
  var select = host.querySelector('select');
  var screen = host.querySelector('.task-timeline-screen');
  var image = host.querySelector('.task-timeline-image');
  var loadingLabel = host.querySelector('.task-timeline-loading');
  var thumbs = host.querySelector('.task-timeline-frames');
  var play = host.querySelector('.task-timeline-play');
  var full = host.querySelector('.task-timeline-full');
  var status = host.querySelector('.task-timeline-status');
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var paused = motion.matches, visible = false, started = false, loading = false;
  var taskIndex = 0, frameIndex = 0, request = 0, elapsed = 0, previous = 0, raf = 0;
  var duration = 2400, entrance = null;
  var root = 'assets/img/task-timeline/';

  function url(task, index, thumb) {
    return root + task.id + '-' + task.frames[index] + (thumb ? '-thumb' : '') + '.webp';
  }

  function updatePlayback() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    previous = 0;
    play.textContent = paused ? '▷ Play' : 'Ⅱ Pause';
    play.setAttribute('aria-label', paused ? 'Play task timeline' : 'Pause task timeline');
    play.setAttribute('aria-pressed', String(paused));
    if (paused && entrance) { entrance.cancel(); entrance = null; }
    if (started && !paused && visible && !document.hidden && !loading) raf = requestAnimationFrame(tick);
  }

  function tick(now) {
    raf = 0;
    if (paused || !visible || document.hidden || loading) { previous = 0; return; }
    if (previous) elapsed += Math.min(now - previous, 100);
    previous = now;
    host.style.setProperty('--task-progress', String(elapsed / duration));
    if (elapsed >= duration) { showFrame((frameIndex + 1) % 5, false); return; }
    raf = requestAnimationFrame(tick);
  }

  function showFrame(index, announce) {
    var task = tasks[taskIndex];
    var token = ++request;
    frameIndex = index;
    elapsed = 0;
    loading = true;
    host.style.setProperty('--task-progress', '0');
    screen.setAttribute('aria-busy', 'true');
    screen.classList.remove('task-frame-error');
    loadingLabel.textContent = 'Loading frame…';
    full.removeAttribute('href');
    thumbs.querySelectorAll('button').forEach(function (button, i) {
      button.setAttribute('aria-pressed', String(i === index));
    });
    updatePlayback();
    var nextImage = new Image();
    nextImage.src = url(task, index, false);
    var ready = nextImage.decode ? nextImage.decode() : new Promise(function (resolve, reject) {
      if (nextImage.complete) { nextImage.naturalWidth ? resolve() : reject(); }
      else { nextImage.onload = resolve; nextImage.onerror = reject; }
    });
    ready.then(function () {
      if (token !== request) return; // A newer click owns the viewer.
      image.src = nextImage.src;
      image.alt = task.name + ': ' + task.labels[index] + ', recorded frame ' + (index + 1) + ' of 5.';
      full.href = nextImage.src;
      full.setAttribute('aria-label', 'Open full-size frame: ' + task.name + ', ' + task.labels[index]);
      host.querySelector('.task-timeline-position').textContent = 'FRAME 0' + (index + 1) + ' / 05';
      host.querySelector('.task-timeline-caption').textContent = task.labels[index];
      host.querySelector('.task-timeline-stamp').textContent = task.times ? task.times[index] + ' · recorded time' : 'Recorded keyframe';
      loading = false;
      screen.setAttribute('aria-busy', 'false');
      if (entrance) entrance.cancel();
      if (!motion.matches && !paused && image.animate) {
        entrance = image.animate([{opacity:0.65},{opacity:1}], {duration:350,easing:'ease-out'});
      }
      if (announce) status.textContent = image.alt;
      updatePlayback();
      // Warm just the following frame; other tasks load only when selected.
      if (!paused) { var preload = new Image(); preload.src = url(task, (index + 1) % 5, false); }
    }).catch(function () {
      if (token !== request) return;
      loading = false;
      paused = true;
      screen.setAttribute('aria-busy', 'false');
      screen.classList.add('task-frame-error');
      loadingLabel.textContent = 'This frame could not load. Choose another frame or view the original overview below.';
      status.textContent = loadingLabel.textContent;
      updatePlayback();
    });
  }

  function showTask(index, manual) {
    taskIndex = index;
    if (manual) paused = true;
    var task = tasks[index];
    select.value = String(index);
    list.querySelectorAll('button').forEach(function (button, i) {
      button.setAttribute('aria-pressed', String(i === index));
    });
    host.querySelector('.task-timeline-title h4').textContent = task.name;
    host.querySelector('.task-timeline-robot').textContent = task.robot;
    host.querySelector('.task-timeline-objective').textContent = task.objective;
    host.querySelector('.task-timeline-note').textContent = task.note || 'Five samples from one recorded rollout.';
    thumbs.innerHTML = task.frames.map(function (frame, i) {
      return '<button type="button" aria-pressed="false" aria-label="Frame ' + (i + 1) + ': ' + task.labels[i] + '">' +
        '<span class="task-thumb-image"><img src="' + url(task, i, true) + '" alt="" width="320" height="180"></span>' +
        '<span class="task-thumb-label"><span>0' + (i + 1) + '</span>' + (task.times ? task.times[i] : 'Frame ' + (i + 1)) + '</span></button>';
    }).join('');
    thumbs.querySelectorAll('button').forEach(function (button, i) {
      button.addEventListener('click', function () { paused = true; showFrame(i, true); });
    });
    showFrame(0, manual);
  }

  list.innerHTML = tasks.map(function (task, i) {
    return '<button type="button" aria-pressed="false"><span class="task-list-number">' + String(i + 1).padStart(2, '0') +
      '</span><span>' + task.name + '<small>' + task.suite + '</small></span><span class="task-list-arrow" aria-hidden="true">↗</span></button>';
  }).join('');
  select.innerHTML = tasks.map(function (task, i) { return '<option value="' + i + '">' + task.name + '</option>'; }).join('');
  list.querySelectorAll('button').forEach(function (button, i) {
    button.addEventListener('click', function () { showTask(i, true); });
  });
  select.addEventListener('change', function () { showTask(Number(select.value), true); });
  play.addEventListener('click', function () { paused = !paused; updatePlayback(); });
  motion.addEventListener('change', function (event) { paused = event.matches; updatePlayback(); });
  document.addEventListener('visibilitychange', updatePlayback);

  function start() {
    if (started) return;
    started = true;
    player.hidden = false;
    host.querySelector('.task-timeline-fallback').hidden = true;
    showTask(0, false);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        updatePlayback();
      }, {threshold:0.2}).observe(screen);
    } else { visible = true; updatePlayback(); }
  }
  if ('IntersectionObserver' in window) {
    var starter = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { starter.disconnect(); start(); }
    }, {rootMargin:'300px'});
    starter.observe(host);
  } else start();
})();
