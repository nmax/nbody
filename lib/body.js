var G = 6.674e-11 //  N⋅m²/kg²
var assign = require('object-assign');

var BodyPrototype = {
  applyForces: true,

  position: undefined,
  velocity: undefined,
  _forces: undefined,

  mass: undefined,
  radius: undefined,

  computeGravity: function computeGravity (body, distance) {
    return (G * this.mass * body.mass) / (distance * distance)
  },

  computeDistance: function computeDistance (body) {
    var dx = body.position[0] - this.position[0];
    var dy = body.position[1] - this.position[1];
    var dz = body.position[2] - this.position[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  computeHeading: function computeHeading (body, distance) {
   return [
     (body.position[0] - this.position[0]) / distance,
     (body.position[1] - this.position[1]) / distance,
     (body.position[2] - this.position[2]) / distance
   ];
  },

  computeAcceleration: function computeAcceleration (bodies) {
    if (!this.applyForces) {
      return this._forces; // no force, no acceleration
    }

    this._forces[0] = 0;
    this._forces[1] = 0;
    this._forces[2] = 0;

    if (this.velStart) {
      this._forces[0] = 0.5 * this.mass * this.velStart[0];;
      this._forces[1] = 0.5 * this.mass * this.velStart[1];;
      this._forces[2] = 0.5 * this.mass * this.velStart[2];;
      delete this.velStart;
    }

    bodies.forEach(function (body) {
      if (this !== body) {
        var dist = this.computeDistance(body);
        var heading = this.computeHeading(body, dist);
        var gravity = this.computeGravity(body, dist);

        if (dist > this.radius + body.radius) {
          this._forces[0] += heading[0] * gravity;
          this._forces[1] += heading[1] * gravity;
          this._forces[2] += heading[2] * gravity;
        }
      }
    }, this);

    return this._forces.map(function (force, i) {
      return force / this.mass;
    }, this);
  }

};

exports.BodyPrototype = BodyPrototype;
exports.create = function createBody (props) {
  var body = Object.create(BodyPrototype);

  assign(body, {
    radius: props.radius || 0,
    mass: props.mass || 1,
    position: props.position || [0, 0, 0],
    velStart: props.velStart || [0, 0, 0],

    velocity: props.velocity || [0, 0, 0],
    _forces: [0, 0, 0]
  });

  if (props.isStatic) {
    body.applyForces = false;
  }

  return body;
};
