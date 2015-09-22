var b1 = nbody.createBody({
  position: [350, 350, 0],
  mass: 1e6,
  radius: 50,
  isStatic: true
});

var b2 = nbody.createBody({
  position: [500, 150, 0],
  mass: 3e2,
  radius: 30,
  startCircular: true
});

var b3 = nbody.createBody({
  position: [170, 350, 0],
  mass: 250e3,
  radius: 30,
  startCircular: true
});


var ball1 = document.getElementById('ball1');
var ball2 = document.getElementById('ball2');
var ball3 = document.getElementById('ball3');
var globalTime = document.getElementById('global-time');


var posStyle = function (pos, w) {
  return 'transform: translate(' + (Math.round(pos[0] - w)) + 'px, ' + (Math.round(pos[1] - w)) + 'px);';
}

var startOfSim = new Date().getTime();
var readableTime = function (millies) {
  var time = new Date(startOfSim + millies);
  var rough = [time.getDate(), time.getMonth() + 1, time.getFullYear()].join('.');
  var precise = [time.getHours(), time.getMinutes(), time.getSeconds()].join(':');
  return rough + ' - ' + precise + ' (' + ~~(millies/(1000*60)) + 'min)';
}

var lastTick = startOfSim;
var tick = function () {
  requestAnimationFrame(tick);

  var current = new Date().getTime();
  var dt = nbody.timer.dt;
  var time = nbody.timer.time;
  var elapsed = current - lastTick;

  nbody.timer.advance(dt * (elapsed/1000));

  ball1.setAttribute('style', posStyle(b1.state.x, 50));
  ball2.setAttribute('style', posStyle(b2.state.x, 30));
  ball3.setAttribute('style', posStyle(b3.state.x, 25));

  nbody.step(time, dt * (elapsed/1000));
  globalTime.innerHTML = readableTime(time);
  lastTick = current;
};

tick();
