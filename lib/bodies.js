var Body = require('./body');
var timer = require('./timer');

var Bodies = {
  createBody: function addBody (bodyProps) {
    var newBody = Body.create(bodyProps);
    this._bodies.push(newBody);
    return newBody;
  },

  removeBody: function removeBody (body) {
    for (var i = 0, l = _bodies.length; i < l; i += 1) {
      if (this._bodies[i] === body) {
        var removed = this._bodies.splice(i, 1);
        return removed[0];
      }
    }
  },

  getBodies: function getBodies () {
    return this._bodies;
  },

  resetBodies: function reset () {
    this._bodies = [];
    return this._bodies;
  }
};

exports.create = function createBodies () {
  var bodies = Object.create(Bodies);
  bodies._bodies = [];
  return bodies;
};
