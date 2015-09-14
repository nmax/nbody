var b1 = nbody.createBody({
  position: [350, 350, 0],
  mass: 10e5,
  radius: 50,
  isStatic: true
});

var b2 = nbody.createBody({
  position: [500, 350, 0],
  velStart: [0, 6e-7, 0],
  // velocity: [3e-9, 3e-9, 0],
  mass: 1e3,
  radius: 30
});

var b3 = nbody.createBody({
  position: [570, 350, 0],
  velStart: [0, 4.5e-7, 0],
  // velocity: [3e-9, 3e-9, 0],
  mass: 3e3,
  radius: 30
});


var ball1 = document.getElementById('ball1');
var ball2 = document.getElementById('ball2');
var ball3 = document.getElementById('ball3');
var globalTime = document.getElementById('global-time');


// b3.position = [150, 170, 0];
// b3.radius = 25;
// b3.mass = 1.5e3;
// b3.motion = [15e-9, -18.5e-9, 0];

var posStyle = function (pos, w) {
  return 'left: ' + (pos[0] - w) + 'px; top: ' + (pos[1] - w) + 'px;';
}

var readableTime = function (millies) {
  var time = new Date(Date.now() + millies);
  var rough = [time.getDate(), time.getMonth() + 1, time.getFullYear()].join('.');
  var precise = [time.getHours(), time.getMinutes(), time.getSeconds()].join('.');
  
  return rough + ' | ' + precise;
}

var tick = function () {
  nbody.timer.advance();
  requestAnimationFrame(tick);

  ball1.setAttribute('style', posStyle(b1.position, 50));
  ball2.setAttribute('style', posStyle(b2.position, 30));
  ball3.setAttribute('style', posStyle(b3.position, 25));

  var dt = nbody.timer.dt;
  var time = nbody.timer.time;

  nbody.step(time, dt);
  globalTime.innerHTML = readableTime(time);
};

tick();
