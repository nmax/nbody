var test = require('tape');
var assign = require('../lib/helpers').assign;
var body = require('../lib/mixins/body');

test('body mixin properties', function (t) {
  t.plan(5);
  t.equal(body.type, '_body-mixin_', 'has a mixin type');

  t.equal(body.mass, 0, 'has default mass 0');
  t.equal(body.radius, 1, 'has default radius 1');
  t.deepEqual(body.position, [0, 0, 0], 'has default pos of 0-0-0');
  t.deepEqual(body.motion, [0, 0, 0], 'has default motion of 0-0-0');
});

test('works as a mixin', function (t) {
  t.plan(6);
  var myObj = assign({}, body);
  var myscnd = assign({}, body);
  t.equal(myObj.type, '_body-mixin_', 'has a mixin type');

  t.equal(myObj.mass, 0, 'has default mass 0');
  t.equal(myObj.radius, 1, 'has default radius 1');
  t.deepEqual(myObj.position, [0, 0, 0], 'has default pos of 0-0-0');
  t.deepEqual(myObj.motion, [0, 0, 0], 'has default motion of 0-0-0');

  myscnd.mass = 100;
  t.ok(myObj.mass !== myscnd.mass, 'one does not affect the other');
});
