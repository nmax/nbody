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
    for (var j = 0; j < len; j += 1) {
      otherBody = bodies[j];
      if (currentBody === otherBody) {
        continue;
      }
      var distance = computeDistance(currentBody, otherBody);
      var grav = computeGravity(currentBody, otherBody, distance);
      var direction = normalize(currentBody, otherBody, distance);

      currentBody.combinedForces[0] += grav * direction[0];
      currentBody.combinedForces[1] += grav * direction[1];
      currentBody.combinedForces[2] += grav * direction[2];
    }
  }
}

function moveBodies (bodies, dt) {
  bodies.forEach(function (body) {
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

    body.combinedForces = [0, 0, 0];
  });
}

exports.step = function step (dt) {
  var bodies = bodiesStore.getBodies();
  updateForces(bodies);
  moveBodies(bodies, dt);
};

