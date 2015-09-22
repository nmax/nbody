var test = require('tape');
var assign = require('../lib/helpers').assign;

test('assign method', function (t) {
  t.plan(7);
  t.ok(assign);
  t.ok(typeof assign === 'function');

  var target = Object.create(null);
  var source = {
    name: 'max',
    greet: function () {
      var name = this.name;
      return 'hello ' + name;
    }
  };
  Object.defineProperty(source, 'meta', {
    value: 'such meta',
    enumerable: false,
    writeable: true
  });

  var expectedResult = assign(target, source);
  t.equal(typeof expectedResult, 'object');
  t.equal(expectedResult.name, 'max', 'assigns normal properties');
  t.equal(expectedResult.greet(), 'hello max', 'assigns functions');
  t.equal(expectedResult.meta, 'such meta', 'respects obj descriptors');

  expectedResult.name = 'johanna';
  t.notEqual(expectedResult.name, source.name, 'mixins are note backwards affected by changes');
});
