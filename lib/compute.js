var bodiesStore = require('./bodies');
var G = 6.674e-11 //  N⋅m²/kg²

function computeGravity (b1, b2, distance) {
  return (G * b1.mass * b2.mass) / (distance * distance)
}

function computeDistance (b1, b2) {
  var dx = b2.position[0] - b1.position[0];
  var dy = b2.position[1] - b1.position[1];
  var dz = b2.position[2] - b1.position[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function normalize (b1, b2, distance) {
 return [
   (b2.position[0] - b1.position[0]) / distance,
   (b2.position[1] - b1.position[1]) / distance,
   (b2.position[2] - b1.position[2]) / distance
 ];
}

function updateForces (bodies) {
  var currentBody;
  var otherBody;
  var i, j, len;

  for (i = 0, len = bodies.length; i < len; i += 1) {
    currentBody = bodies[i];
    if (!currentBody.applyForces) {
      continue;
    }

    for (var j = 0; j < len; j += 1) {
      otherBody = bodies[j];
      if (currentBody === otherBody) {
        continue;
      }
      var distance = computeDistance(currentBody, otherBody);
      var grav = computeGravity(currentBody, otherBody, distance);
      var direction = normalize(currentBody, otherBody, distance);

      // Only apply new forces if there is no overlapping to avoid crazy g forces.
      // lim Fg(r) -> 0 = +inf
      if (distance > currentBody.radius + otherBody.radius) {
        currentBody.combinedForces[0] += grav * direction[0];
        currentBody.combinedForces[1] += grav * direction[1];
        currentBody.combinedForces[2] += grav * direction[2];
      }
    }
  }
}

function integrateEuler (body, dt) {
  var steps = 8;
  var delta = dt /steps;
  for (var i = 0; i < steps; i += 1) {
    body.motion[0] += (body.combinedForces[0] / body.mass) * delta;
    body.motion[1] += (body.combinedForces[1] / body.mass) * delta;
    body.motion[2] += (body.combinedForces[2] / body.mass) * delta;
  }

  body.position[0] += body.motion[0];
  body.position[1] += body.motion[1];
  body.position[2] += body.motion[2];
}

function integrateRK4 (body, dt) {
  var accFn = function (x, v, delta) {
    return (body.combinedForces[xyz]/body.mass) / dt;
  }

  for (var xyz; xyz <= 2; xyz += 1) {
    var x1 = body.position[xyz];
    var v1 = body.motion[xyz];
    var a1 = accFn(x1, v1, dt);

    var x2 = x1 + 0.5 * v1 * dt;
    var v2 = v1 + 0.5 * a1 * dt;
    var a2 = accFn(x2, v2, dt/2);

    var x3 = x1 + 0.5 * v2 * dt;
    var v3 = v1 + 0.5 * a2 * dt;
    var a3 = accFn(x3, v3, dt/2);

    var x4 = x1 + v3 * dt;
    var v4 = v1 + a3 * dt;
    var a4 = accFn(x4, v4, dt);

    body.motion[xyz] = v1 + (dt/6) * (a1 + 2*a2 + 2*a3 + a4);
    body.position[xyz] = x1 + (dt/6) * (v1 + 2*v2 + 2*v3 + v4);
  }
}

function updateForcesFromMotion (body) {
  var eKinX = 0.5 * body.mass * (body.initialMotion[0] * body.initialMotion[0]);
  var eKinY = 0.5 * body.mass * (body.initialMotion[1] * body.initialMotion[1]);
  var eKinZ = 0.5 * body.mass * (body.initialMotion[2] * body.initialMotion[2]);

  //debugger;
  body.combinedForces[0] += eKinX;
  body.combinedForces[1] += eKinY;
  body.combinedForces[2] += eKinZ;

  delete body.initialMotion;
}

function moveBodies (type, bodies, dt) {
  bodies.forEach(function (body) {

    if (body.initialMotion) {
      updateForcesFromMotion(body);
    }

    if (type === 'euler') {
      integrateEuler(body, dt);
    }

    if (type === 'rk4') {
      integrateRK4(body, dt);
    }

    body.combinedForces = [0, 0, 0];
  });
}

exports.step = function step (dt) {
  var bodies = bodiesStore.getBodies();
  updateForces(bodies);
  moveBodies('rk4', bodies, dt);
};

