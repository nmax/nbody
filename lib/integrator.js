function integrateEuler (body, bodies, dt) {
  let a = body.computeAcceleration(bodies, body.state);

  body.state.dx[0] += a[0] * dt;
  body.state.dx[1] += a[1] * dt;
  body.state.dx[2] += a[2] * dt;

  body.state.x[0] += body.state.dx[0] * dt;
  body.state.x[1] += body.state.dx[1] * dt;
  body.state.x[2] += body.state.dx[2] * dt;
}

function integrateRK4 (body, bodies, t, dt) {
  let initialState = body.state;
  let d1 = body.initialDerivative(bodies);
  let d2 = body.nextDerivative(bodies, initialState, d1, t, dt * 0.5);
  let d3 = body.nextDerivative(bodies, initialState, d2, t, dt * 0.5);
  let d4 = body.nextDerivative(bodies, initialState, d3, t, dt);

  let vel0 = 1/6 * (d1.x[0] + 2 * (d2.x[0] + d3.x[0]) + d4.x[0]) * dt;
  let vel1 = 1/6 * (d1.x[1] + 2 * (d2.x[1] + d3.x[1]) + d4.x[1]) * dt;
  let vel2 = 1/6 * (d1.x[2] + 2 * (d2.x[2] + d3.x[2]) + d4.x[2]) * dt;

  let acc0 = 1/6 * (d1.dx[0] + 2 * (d2.dx[0] + d3.dx[0]) + d4.dx[0]) * dt;
  let acc1 = 1/6 * (d1.dx[1] + 2 * (d2.dx[1] + d3.dx[1]) + d4.dx[1]) * dt;
  let acc2 = 1/6 * (d1.dx[2] + 2 * (d2.dx[2] + d3.dx[2]) + d4.dx[2]) * dt;

  body.state.x[0] += vel0;
  body.state.x[1] += vel1;
  body.state.x[2] += vel2;

  body.state.dx[0] += acc0;
  body.state.dx[1] += acc1;
  body.state.dx[2] += acc2;
}

function moveBodies (type, bodies, t, dt) {
  let steps = 4;

  bodies.forEach(function (body) {
    let step = 0;
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

export default function integratorFactory (bodies, timer, type='rk4') {
  return function integrate () {
    moveBodies(type, bodies.getBodies(), timer.time, timer.dt);
  };
}

