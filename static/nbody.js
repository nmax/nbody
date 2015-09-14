(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./body":2,"./timer":5}],2:[function(require,module,exports){
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

},{"object-assign":6}],3:[function(require,module,exports){
var bodiesStore = require('./bodies');

function integrateEuler (body, bodies, dt) {
  var steps = 8;
  var delta = dt / steps;
  var a = body.computeAcceleration(bodies);

  for (var i = 0; i < steps; i += 1) {
    body.velocity[0] += a[0] * delta;
    body.velocity[1] += a[1] * delta;
    body.velocity[2] += a[2] * delta;
  }


  body.position[0] += body.velocity[0];
  body.position[1] += body.velocity[1];
  body.position[2] += body.velocity[2];
}

function integrateRK4 (body, bodies, dt) {

}

function moveBodies (type, bodies, dt) {
  bodies.forEach(function (body) {
    if (type === 'euler') {
      integrateEuler(body, bodies, dt);
    }

    if (type === 'rk4') {
      integrateRK4(body, dt);
    }
  });
}

exports.step = function step (time, dt) {
  var bodies = bodiesStore.getBodies();
  moveBodies('euler', bodies, dt);
};


},{"./bodies":1}],4:[function(require,module,exports){
var bodies = require('./bodies');
var compute = require('./compute');
var timer = require('./timer');

window.nbody = Nbody = {
  createBody: bodies.createBody,
  getBodies: bodies.getBodies,
  removeBody: bodies.removeBody,
  step: compute.step,
  timer: timer
};

module.exports = Nbody;

},{"./bodies":1,"./compute":3,"./timer":5}],5:[function(require,module,exports){
var SECOND = 1000;
var MINUTE = SECOND * 60;
var HOUR   = MINUTE * 60;
var DAY    = HOUR * 24;
var MONTH  = DAY * 31;
var YEAR   = DAY * 365;

var time = 0;
var dt = 1.5 * HOUR;

var Timer = {
  time: 0,
  dt: 1 * HOUR,
  advance: function () {
    this.time += this.dt;
  }
};

module.exports = Timer;


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
