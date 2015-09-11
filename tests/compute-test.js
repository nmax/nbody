var test = require('tape');
var compute = require('../lib/compute');
var bodies = require('../lib/bodies');

test('compute module', function (t) {
  t.plan(1);

  var b1 = bodies.createBody();
  var b2 = bodies.createBody();
  b1.mass = 10;
  b2.mass = 10;

  b1.position[0] = 1000;
  b2.position[0] = -1000;

  compute.step();
  var b1NaNs = b1.combinedForces.filter(function (f) {
    return isNaN(f);
  }).length;

  var b2NaNs = b2.combinedForces.filter(function (f) {
    return isNaN(f);
  }).length;

  t.equal(b1NaNs + b2NaNs, 0, 'no not a number errors');
});
