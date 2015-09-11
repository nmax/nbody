var bodyMixin = require('./mixins/body');
//var assign = require('./helpers').assign;
var assign = require('object-assign');
var _bodies = [];

exports.createBody = function addBody (body) {
  var  decorated = assign(body || {}, bodyMixin);
  Object.defineProperty(decorated, 'id', {
    writeable: false,
    value: Math.random().toString(8).slice(2)
  });
  _bodies.push(decorated);
  return decorated;
};

exports.removeBody = function removeBody (body) {
  if (body.type !== '_body-mixin_') {
    throw 'can only remove bodies';
  }


  for (var i = 0, l = _bodies.length; i < l; i += 1) {
    if (_bodies[i] === body) {
      var removed = _bodies.splice(i, 1);
      return removed[0];
    }
  }
};

exports.getBodies = function getBodies () {
  return _bodies;
};

exports.resetBodies = function reset () {
  _bodies = [];
  return _bodies;
};
