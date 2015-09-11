var bodies = require('./bodies');
var G = 6.8e-11;

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
  b1.position[0] - b2.position[0] / distance,
  b1.position[1] - b2.position[1] / distance,
  b1.position[2] - b2.position[2] / distance
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
      //if (i === 0) {
        //console.log(distance, grav, direction);
      //}
      currentBody.combinedForces[0] += grav * direction[0];
      currentBody.combinedForces[1] += grav * direction[1];
      currentBody.combinedForces[2] += grav * direction[2];
    }
  }
}


exports.step = function step () {
  updateForces(bodies.getBodies());
  var allForces = bodies.getBodies().map(function (b) {
    return b.combinedForces;
  });
  console.log(allForces);
};

