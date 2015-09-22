function integrateEuler (body, bodies, dt) {
  var a = body.computeAcceleration(bodies, body.state);

  body.state.dx[0] += a[0] * dt;
  body.state.dx[1] += a[1] * dt;
  body.state.dx[2] += a[2] * dt;

  body.state.x[0] += body.state.dx[0] * dt;
  body.state.x[1] += body.state.dx[1] * dt;
  body.state.x[2] += body.state.dx[2] * dt;
}

function integrateRK4 (body, bodies, t, dt) {
  var initialState = body.state;
  var d1 = body.initialDerivative(bodies);
  var d2 = body.nextDerivative(bodies, initialState, d1, t, dt * 0.5);
  var d3 = body.nextDerivative(bodies, initialState, d2, t, dt * 0.5);
  var d4 = body.nextDerivative(bodies, initialState, d3, t, dt);

  var vel0 = 1/6 * (d1.x[0] + 2 * (d2.x[0] + d3.x[0]) + d4.x[0]) * dt;
  var vel1 = 1/6 * (d1.x[1] + 2 * (d2.x[1] + d3.x[1]) + d4.x[1]) * dt;
  var vel2 = 1/6 * (d1.x[2] + 2 * (d2.x[2] + d3.x[2]) + d4.x[2]) * dt;

  var acc0 = 1/6 * (d1.dx[0] + 2 * (d2.dx[0] + d3.dx[0]) + d4.dx[0]) * dt;
  var acc1 = 1/6 * (d1.dx[1] + 2 * (d2.dx[1] + d3.dx[1]) + d4.dx[1]) * dt;
  var acc2 = 1/6 * (d1.dx[2] + 2 * (d2.dx[2] + d3.dx[2]) + d4.dx[2]) * dt;

  body.state.x[0] += vel0;
  body.state.x[1] += vel1;
  body.state.x[2] += vel2;

  body.state.dx[0] += acc0;
  body.state.dx[1] += acc1;
  body.state.dx[2] += acc2;
}

function moveBodies (type, bodies, t, dt) {
  var steps = 4;

  bodies.forEach(function (body) {
    var step = 0;
    for (; step < steps; step += 1) {
      if (type === 'euler') {
        integrateEuler(body, bodies, dt / steps);
      }

      if (type === 'rk4') {
        integrateRK4(body, bodies, t, dt / steps);
      }
    }
  });
}

exports.step = function configureStepper (bodies, timer) {
  return function step () {
    moveBodies('rk4', bodies.getBodies(), timer.time, timer.dt);
    //moveBodies('euler', bodies, time, dt);
  };
};

