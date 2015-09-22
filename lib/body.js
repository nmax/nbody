var G = 6.674e-11; //  N⋅m²/kg²
var assign = require('object-assign');

var State = {
  x: undefined,
  dx: undefined,

  create: function createState (x, dx) {
    var s = Object.create(State);
    s.x = x;
    s.dx = dx;
    return s;
  }
};

var BodyPrototype = {
  applyForces: true,
  state: undefined,

  _forces: undefined,

  mass: undefined,
  radius: undefined,

  computeAcceleration: function computeAcceleration (bodies, state) {
    if (!this.applyForces) {
      return this._forces; // no force, no acceleration
    }

    this._forces[0] = 0;
    this._forces[1] = 0;
    this._forces[2] = 0;

    bodies.forEach(function (otherBody) {
      if (this !== otherBody) {
        var dist = this.computeDistance(otherBody, state);
        var heading = this.computeHeading(otherBody, state, dist);
        var gravity = this.computeGravity(otherBody, dist);

        if (dist > this.radius + otherBody.radius) {
          this._forces[0] += heading[0] * gravity;
          this._forces[1] += heading[1] * gravity;
          this._forces[2] += heading[2] * gravity;
        }
      }
    }, this);

    return this._forces.map(function (force, i) {
      return force / this.mass;
    }, this);
  },

  initialDerivative: function (bodies) {
    var acceleration = this.computeAcceleration(bodies, this.state);
    return State.create(this.state.dx, acceleration);
  },

  nextDerivative: function (bodies, initialState, derivative, t, dt) {
    var nextState = State.create([
      initialState.x[0] + derivative.dx[0] * dt,
      initialState.x[1] + derivative.dx[1] * dt,
      initialState.x[2] + derivative.dx[2] * dt
    ], [
      initialState.dx[0] + derivative.dx[0] * dt,
      initialState.dx[1] + derivative.dx[1] * dt,
      initialState.dx[2] + derivative.dx[2] * dt
    ]);

    var acceleration = this.computeAcceleration(bodies, nextState, t + dt);
    return State.create(nextState.dx, acceleration);
  },

  computeGravity: function computeGravity (otherBody, distance) {
    return (G * this.mass * otherBody.mass) / (distance * distance);
  },

  computeDistance: function computeDistance (otherBody, state) {
    var xdist = otherBody.state.x[0] - state.x[0];
    var ydist = otherBody.state.x[1] - state.x[1];
    var zdist = otherBody.state.x[2] - state.x[2];
    return Math.sqrt(xdist * xdist + ydist * ydist + zdist * zdist);
  },

  computeHeading: function computeHeading (otherBody, state, distance) {
   return [
     (otherBody.state.x[0] - state.x[0]) / distance,
     (otherBody.state.x[1] - state.x[1]) / distance,
     (otherBody.state.x[2] - state.x[2]) / distance
   ];
  }

};

function setCircularSpeed (body, barycenter, virtualCentralMass) {
  var center = State.create(barycenter, [0, 0, 0]);
  var dist = BodyPrototype.computeDistance(body, center);
  var heading = BodyPrototype.computeHeading(body, center, dist);
  var speed = Math.sqrt((G * (body.mass + virtualCentralMass)) / dist);
  body.state.dx[0] = heading[1] * speed;
  body.state.dx[1] = -heading[0] * speed;
}

exports.BodyPrototype = BodyPrototype;

exports.create = function createBody (props) {
  var body = Object.create(BodyPrototype);
  var pos = props.position || [0, 0, 0];
  var vel = props.velocity || [0, 0, 0];

  body.state = State.create(pos, vel);

  assign(body, {
    radius: props.radius || 0,
    mass: props.mass || 1,
    _forces: [0, 0, 0]
  });

  if (props.isStatic) {
    body.applyForces = false;
  }

  if (props.circularStart) {
    var bPos = props.cirularStart.barycenter;
    var bMass = props.cirularStart.centralMass;
    setCircularSpeed(body, bPos, bMass);
  }

  return body;
};
