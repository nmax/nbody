var test = require('tape');
var index = require('../lib/index');

test('it exports all the right things', function (t) {
  t.plan(4);
  t.equal(typeof index.createBody, 'function', 'has createBody fn');
  t.equal(typeof index.removeBody, 'function', 'has removeBody fn');
  t.equal(typeof index.getBodies, 'function', 'has getBodies fn');
  t.equal(typeof index.step, 'function', 'has step fn');
});
