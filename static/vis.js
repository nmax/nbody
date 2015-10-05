/*global nbody*/

var sim = nbody();
sim.timer.dt = 12 * sim.timer.units.SECOND;

// assuming b1 as barycenter since:
// b1.mass >> b2.mass and b1.mass >> b3.mass
//

var globalTime = document.getElementById('global-time');
var balls = [];
var center = [window.innerWidth/2, window.innerHeight/2, 0];

var b1pos = center;
var b2pos = [1030, 350, 0];

var virutaMass = 500e3;
var barycenter = [( b2pos[0] + b1pos[0] ) / 2,
                   ( b2pos[1] + b1pos[1] ) / 2,
                   ( b2pos[2] + b1pos[2] ) / 2];

var b1 = sim.bodies.createBody({
  //position: [350, 350, 0],
  position: b1pos,
  mass: 250e3,
  radius: 50,
  isStatic: true,
  //startCircular: {
    //center: barycenter,
    //mass: virutaMass
  //}
});

var b2 = sim.bodies.createBody({
  position: b2pos,
  mass: 250e3,
  radius: 50,
  isStatic: true,
  //startCircular: {
    //center: barycenter,
    //mass: virutaMass
  //}
});

balls.push([document.getElementById('ball1'), b1]);
balls.push([document.getElementById('ball2'), b2]);

function createBody () {
  var id = Math.round(Date.now() + (Math.random() * 1000));
  //var flip = Math.random() > 0.5 ? b1 : b2;
  var amplidtude = (Math.random() * 50) + 240;
  var freq = Math.random();
  var x = Math.cos(2 * Math.PI * freq) * amplidtude;
  var y = Math.sin(2 * Math.PI * freq) * amplidtude;

  var props = {
    position: [barycenter[0] + x, barycenter[1] + y , 0],
    mass: 1,
    radius: 5,
    startCircular: {
      center: barycenter,
      mass: virutaMass
    }
  };

  var ball = sim.bodies.createBody(props);
  var elem = document.createElement('div');
  elem.classList.add('ball');
  elem.setAttribute('id', id);
  document.body.appendChild(elem);
  balls.push([elem, ball]);
}

var posStyle = function (pos, w) {
  return 'transform: translate(' + (Math.round(pos[0] - w)) + 'px, ' + (Math.round(pos[1] - w)) + 'px);';
};

var startOfSim = new Date().getTime();
var readableTime = function (millies) {
  var time = new Date(startOfSim + millies);
  var rough = [time.getDate(), time.getMonth() + 1, time.getFullYear()].join('.');
  var precise = [time.getHours(), time.getMinutes(), time.getSeconds()].join(':');
  return rough + ' - ' + precise + ' (+'+ (millies) + 'ms)';
};

for (var i = 0; i < 40; i+=1) {
  createBody();
}

window.addEventListener('keyup', function (e) {
  e.preventDefault();
  if (e.which === 32) {
    createBody();
  }
}, false);

var lastTick = startOfSim;
var tick = function () {
  requestAnimationFrame(tick);

  var current = new Date().getTime();
  var dt = sim.timer.dt;
  var time = sim.timer.time;
  var elapsed = current - lastTick;

  sim.timer.advance(dt * (elapsed/1000));

  balls.forEach(function (tuple) {
    var elem = tuple[0];
    var ball = tuple[1];
    elem.setAttribute('style', posStyle(ball.state.x, 5));
  });

  sim.step(time, dt * (elapsed/1000));
  globalTime.innerHTML = readableTime(time);
  lastTick = current;
};

tick();
