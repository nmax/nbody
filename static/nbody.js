(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./mixins/body":4,"object-assign":5}],2:[function(require,module,exports){
var bodiesStore = require('./bodies');
var G = 6.674e-11 //  N⋅m²/kg²

function computeGravity (b1, b2, distance) {
  return (G * b1.mass * b2.mass) / (distance * distance)
}

function computeDistance (b1, b2) {
  var dx = b2.position[0] - b1.position[0];
  var dy = b2.position[1] - b1.position[1];
  var dz = b2.position[2] - b1.position[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function normalize (b1, b2, distance) {
 return [
   (b2.position[0] - b1.position[0]) / distance,
   (b2.position[1] - b1.position[1]) / distance,
   (b2.position[2] - b1.position[2]) / distance
 ];
}

function updateForces (bodies) {
  var currentBody;
  var otherBody;
  var i, j, len;

  for (i = 0, len = bodies.length; i < len; i += 1) {
    currentBody = bodies[i];
    if (!currentBody.applyForces) {
      continue;
    }

    for (var j = 0; j < len; j += 1) {
      otherBody = bodies[j];
      if (currentBody === otherBody) {
        continue;
      }
      var distance = computeDistance(currentBody, otherBody);
      var grav = computeGravity(currentBody, otherBody, distance);
      var direction = normalize(currentBody, otherBody, distance);

      currentBody.combinedForces[0] += grav * direction[0];
      currentBody.combinedForces[1] += grav * direction[1];
      currentBody.combinedForces[2] += grav * direction[2];
    }
  }
}

function integrateEuler (body, dt) {
  var steps = 8;
  var delta = dt /steps;
  for (var i = 0; i < steps; i += 1) {
    body.motion[0] += (body.combinedForces[0] / body.mass) * delta;
    body.motion[1] += (body.combinedForces[1] / body.mass) * delta;
    body.motion[2] += (body.combinedForces[2] / body.mass) * delta;
  }

  body.position[0] += body.motion[0];
  body.position[1] += body.motion[1];
  body.position[2] += body.motion[2];
}

function integrateRK4 (body, dt) {
  var xyz = 0;
  var accFn = function (x, v, delta) {
    return (body.combinedForces[xyz]/body.mass) / dt;
  }

  for (xyz; xyz <= 2; xyz += 1) {
    var x1 = body.position[xyz];
    var v1 = body.motion[xyz];
    var a1 = accFn(x1, v1, dt);

    var x2 = x1 + 0.5 * v1 * dt;
    var v2 = v1 + 0.5 * a1 * dt;
    var a2 = accFn(x2, v2, dt/2);

    var x3 = x1 + 0.5 * v2 * dt;
    var v3 = v1 + 0.5 * a2 * dt;
    var a3 = accFn(x3, v3, dt/2);

    var x4 = x1 + v3 * dt;
    var v4 = v1 + a3 * dt;
    var a4 = accFn(x4, v4, dt);

    body.motion[xyz] = v1 + (dt/6) * (a1 + 2*a2 + 2*a3 + a4);
    body.position[xyz] = x1 + (dt/6) * (v1 + 2*v2 + 2*v3 + v4);
  }
}

function moveBodies (type, bodies, dt) {
  bodies.forEach(function (body) {
    if (type === 'euler') {
      integrateEuler(body, dt);
    }

    if (type === 'rk4') {
      integrateRK4(body, dt);
    }

    body.combinedForces = [0, 0, 0];
  });
}

exports.step = function step (dt) {
  var bodies = bodiesStore.getBodies();
  updateForces(bodies);
  moveBodies('rk4', bodies, dt);
};


},{"./bodies":1}],3:[function(require,module,exports){
var bodies = require('./bodies');
var compute = require('./compute');

window.nbody = Nbody = {
  createBody: bodies.createBody,
  getBodies: bodies.getBodies,
  removeBody: bodies.removeBody,
  step: compute.step
};

module.exports = Nbody;

},{"./bodies":1,"./compute":2}],4:[function(require,module,exports){
var bodyPrototype = {
  mass: 0,
  radius: 1,
  applyForces: true,

  get position () {
   return [0, 0, 0];
  },

  get motion () {
    return [0, 0, 0];
  },

  get combinedForces () {
    return [0, 0, 0];
  }
};

Object.defineProperty(bodyPrototype, 'type', {
  value: '_body-mixin_',
  enumerable: true,
  writeable: false
});

module.exports = bodyPrototype;

},{}],5:[function(require,module,exports){
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

},{}]},{},[3]);
