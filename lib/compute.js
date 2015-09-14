var bodiesStore = require('./bodies');

function integrateEuler (body, bodies, dt) {
  var steps = 8;
  var delta = dt / steps;
  var a = body.computeAcceleration(bodies);

  for (var i = 0; i < steps; i += 1) {
    body.velocity[0] += a[0] * delta;
    body.velocity[1] += a[1] * delta;
    body.velocity[2] += a[2] * delta;
  }


  body.position[0] += body.velocity[0];
  body.position[1] += body.velocity[1];
  body.position[2] += body.velocity[2];
}

function integrateRK4 (body, bodies, dt) {

}

function moveBodies (type, bodies, dt) {
  bodies.forEach(function (body) {
    if (type === 'euler') {
      integrateEuler(body, bodies, dt);
    }

    if (type === 'rk4') {
      integrateRK4(body, dt);
    }
  });
}

exports.step = function step (time, dt) {
  var bodies = bodiesStore.getBodies();
  moveBodies('euler', bodies, dt);
};

