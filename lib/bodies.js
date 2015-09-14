var Body = require('./body');
var timer = require('./timer');
var _bodies = [];

exports.createBody = function addBody (bodyProps) {
  var newBody = Body.create(bodyProps);
  _bodies.push(newBody);
  return newBody;
};

exports.removeBody = function removeBody (body) {
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
