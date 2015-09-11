var test = require('tape');
var bodies = require('../lib/bodies');

test('bodies basic crud methods', function (t) {
  t.plan(6);
  t.ok(Array.isArray(bodies.getBodies()), 'getBodies returns an array');
  t.deepEqual(bodies.getBodies(), [], 'bodies starts off with no bodies');

  var b1 = bodies.createBody({});
  var b2 = bodies.createBody({});
  var b3 = bodies.createBody({});
  t.equal(bodies.getBodies().length, 3, 'createBody method add one body');

  var removed = bodies.removeBody(b2);
  t.equal(removed, b2, 'removeBody method returns the removed body');
  t.deepEqual(bodies.getBodies(), [b1, b3], 'removeBody method removes bodies');

  t.deepEqual(bodies.resetBodies(), [], 'resetBodies deletes all bodies');
});

test('removeBody method', function (t) {
  var randomObj = {};
  t.plan(1);

  t.throws(function () {
    bodies.removeBody(randomObj);
  }, /can only remove bodies/i, 'throws when trying to remove non bodies');
});

