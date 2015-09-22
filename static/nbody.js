(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./body":2,"./timer":5}],2:[function(require,module,exports){
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

},{"object-assign":6}],3:[function(require,module,exports){
function integrateEuler (body, bodies, dt) {
  var a = body.computeAcceleration(bodies, body.state);

  body.state.dx[0] += a[0] * dt;
  body.state.dx[1] += a[1] * dt;
  body.state.dx[2] += a[2] * dt;

  body.state.x[0] += body.state.dx[0] * dt;
  body.state.x[1] += body.state.dx[1] * dt;
  body.state.x[2] += body.state.dx[2] * dt;
}

function integrateRK4 (body, bodies, t, dt) {
  var initialState = body.state;
  var d1 = body.initialDerivative(bodies);
  var d2 = body.nextDerivative(bodies, initialState, d1, t, dt * 0.5);
  var d3 = body.nextDerivative(bodies, initialState, d2, t, dt * 0.5);
  var d4 = body.nextDerivative(bodies, initialState, d3, t, dt);

  var vel0 = 1/6 * (d1.x[0] + 2 * (d2.x[0] + d3.x[0]) + d4.x[0]) * dt;
  var vel1 = 1/6 * (d1.x[1] + 2 * (d2.x[1] + d3.x[1]) + d4.x[1]) * dt;
  var vel2 = 1/6 * (d1.x[2] + 2 * (d2.x[2] + d3.x[2]) + d4.x[2]) * dt;

  var acc0 = 1/6 * (d1.dx[0] + 2 * (d2.dx[0] + d3.dx[0]) + d4.dx[0]) * dt;
  var acc1 = 1/6 * (d1.dx[1] + 2 * (d2.dx[1] + d3.dx[1]) + d4.dx[1]) * dt;
  var acc2 = 1/6 * (d1.dx[2] + 2 * (d2.dx[2] + d3.dx[2]) + d4.dx[2]) * dt;

  body.state.x[0] += vel0;
  body.state.x[1] += vel1;
  body.state.x[2] += vel2;

  body.state.dx[0] += acc0;
  body.state.dx[1] += acc1;
  body.state.dx[2] += acc2;
}

function moveBodies (type, bodies, t, dt) {
  var steps = 4;

  console.log(arguments);
  bodies.forEach(function (body) {
    var step = 0;
    for (; step < steps; step += 1) {
      if (type === 'euler') {
        integrateEuler(body, bodies, dt / steps);
      }

      if (type === 'rk4') {
        integrateRK4(body, bodies, t, dt / steps);
      }
    }
  });
}

exports.step = function configureStepper (bodies, timer) {
  return function step () {
    moveBodies('rk4', bodies.getBodies(), timer.time, timer.dt);
    //moveBodies('euler', bodies, time, dt);
  };
};


},{}],4:[function(require,module,exports){
var Bodies = require('./bodies');
var compute = require('./compute');
var Timer = require('./timer');

window.nbody = {
  create: function () {
    var sim = Object.create(null);
    sim.bodies = Bodies.create();
    sim.timer = Timer.create();
    sim.step = compute.step(sim.bodies, sim.timer);

    return sim;
  }
};

module.exports = window.nbody;

},{"./bodies":1,"./compute":3,"./timer":5}],5:[function(require,module,exports){
var SECOND = 1000;
var MINUTE = SECOND * 60;
var HOUR = MINUTE * 60;
var DAY = HOUR * 24;
var MONTH = DAY * 31;
var YEAR = DAY * 36;

var Timer = {
  units: Object.freeze({
    SECOND: SECOND,
    MINUTE: MINUTE,
    HOUR: HOUR,
    DAY: DAY,
    MONTH: MONTH,
    YEAR: YEAR
  }),

  time: 0,
  dt: 5 * MINUTE,
  advance: function (increment) {
    this.time += increment || this.dt;
  }
};

exports.create = function createTimer () {
  return Object.create(Timer);
};


},{}],6:[function(require,module,exports){
/* eslint-disable no-unused-vars */
'use strict';
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}]},{},[4]);
