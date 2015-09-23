;(function() {
var define, requireModule, require, requirejs;

(function() {

  var _isArray;
  if (!Array.isArray) {
    _isArray = function (x) {
      return Object.prototype.toString.call(x) === "[object Array]";
    };
  } else {
    _isArray = Array.isArray;
  }

  var registry = {};
  var seen = {};
  var FAILED = false;

  var uuid = 0;

  function tryFinally(tryable, finalizer) {
    try {
      return tryable();
    } finally {
      finalizer();
    }
  }

  function unsupportedModule(length) {
    throw new Error("an unsupported module was defined, expected `define(name, deps, module)` instead got: `" + length + "` arguments to define`");
  }

  var defaultDeps = ['require', 'exports', 'module'];

  function Module(name, deps, callback, exports) {
    this.id       = uuid++;
    this.name     = name;
    this.deps     = !deps.length && callback.length ? defaultDeps : deps;
    this.exports  = exports || { };
    this.callback = callback;
    this.state    = undefined;
    this._require  = undefined;
  }


  Module.prototype.makeRequire = function() {
    var name = this.name;

    return this._require || (this._require = function(dep) {
      return require(resolve(dep, name));
    });
  }

  define = function(name, deps, callback) {
    if (arguments.length < 2) {
      unsupportedModule(arguments.length);
    }

    if (!_isArray(deps)) {
      callback = deps;
      deps     =  [];
    }

    registry[name] = new Module(name, deps, callback);
  };

  // we don't support all of AMD
  // define.amd = {};
  // we will support petals...
  define.petal = { };

  function Alias(path) {
    this.name = path;
  }

  define.alias = function(path) {
    return new Alias(path);
  };

  function reify(mod, name, seen) {
    var deps = mod.deps;
    var length = deps.length;
    var reified = new Array(length);
    var dep;
    // TODO: new Module
    // TODO: seen refactor
    var module = { };

    for (var i = 0, l = length; i < l; i++) {
      dep = deps[i];
      if (dep === 'exports') {
        module.exports = reified[i] = seen;
      } else if (dep === 'require') {
        reified[i] = mod.makeRequire();
      } else if (dep === 'module') {
        mod.exports = seen;
        module = reified[i] = mod;
      } else {
        reified[i] = requireFrom(resolve(dep, name), name);
      }
    }

    return {
      deps: reified,
      module: module
    };
  }

  function requireFrom(name, origin) {
    var mod = registry[name];
    if (!mod) {
      throw new Error('Could not find module `' + name + '` imported from `' + origin + '`');
    }
    return require(name);
  }

  function missingModule(name) {
    throw new Error('Could not find module ' + name);
  }
  requirejs = require = requireModule = function(name) {
    var mod = registry[name];

    if (mod && mod.callback instanceof Alias) {
      mod = registry[mod.callback.name];
    }

    if (!mod) { missingModule(name); }

    if (mod.state !== FAILED &&
        seen.hasOwnProperty(name)) {
      return seen[name];
    }

    var reified;
    var module;
    var loaded = false;

    seen[name] = { }; // placeholder for run-time cycles

    tryFinally(function() {
      reified = reify(mod, name, seen[name]);
      module = mod.callback.apply(this, reified.deps);
      loaded = true;
    }, function() {
      if (!loaded) {
        mod.state = FAILED;
      }
    });

    var obj;
    if (module === undefined && reified.module.exports) {
      obj = reified.module.exports;
    } else {
      obj = seen[name] = module;
    }

    if (obj !== null &&
        (typeof obj === 'object' || typeof obj === 'function') &&
          obj['default'] === undefined) {
      obj['default'] = obj;
    }

    return (seen[name] = obj);
  };

  function resolve(child, name) {
    if (child.charAt(0) !== '.') { return child; }

    var parts = child.split('/');
    var nameParts = name.split('/');
    var parentBase = nameParts.slice(0, -1);

    for (var i = 0, l = parts.length; i < l; i++) {
      var part = parts[i];

      if (part === '..') {
        if (parentBase.length === 0) {
          throw new Error('Cannot access parent module of root');
        }
        parentBase.pop();
      } else if (part === '.') {
        continue;
      } else { parentBase.push(part); }
    }

    return parentBase.join('/');
  }

  requirejs.entries = requirejs._eak_seen = registry;
  requirejs.unsee = function(moduleName) {
    delete seen[moduleName];
  };

  requirejs.clear = function() {
    requirejs.entries = requirejs._eak_seen = registry = {};
    seen = state = {};
  };
})();

define('nbody/bodies', ['exports', 'nbody/body'], function (exports, _nbodyBody) {
  'use strict';

  exports['default'] = bodiesFactory;
  var BodiesProto = {
    createBody: function createBody(bodyProps) {
      var newBody = (0, _nbodyBody['default'])(bodyProps);
      this._bodies.push(newBody);
      return newBody;
    },

    removeBody: function removeBody(body) {
      for (var i = 0, l = this._bodies.length; i < l; i += 1) {
        if (this._bodies[i] === body) {
          var removed = this._bodies.splice(i, 1);
          return removed[0];
        }
      }
    },

    getBodies: function getBodies() {
      return this._bodies;
    },

    resetBodies: function resetBodies() {
      this._bodies = [];
      return this._bodies;
    }
  };

  exports.BodiesProto = BodiesProto;

  function bodiesFactory() {
    var bodies = Object.create(BodiesProto);
    bodies._bodies = [];
    return bodies;
  }
});
define('nbody/body', ['exports', 'nbody/helpers'], function (exports, _nbodyHelpers) {
  'use strict';

  exports['default'] = bodyFactory;
  var G = 6.674e-11; //  N⋅m²/kg²

  var State = {
    x: undefined,
    dx: undefined,

    create: function create(x, dx) {
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

    computeAcceleration: function computeAcceleration(bodies, state) {
      var _this = this;

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

      return this._forces.map(function (force) {
        return force / _this.mass;
      });
    },

    initialDerivative: function initialDerivative(bodies) {
      var acceleration = this.computeAcceleration(bodies, this.state);
      return State.create(this.state.dx, acceleration);
    },

    nextDerivative: function nextDerivative(bodies, initialState, derivative, t, dt) {
      var nextState = State.create([initialState.x[0] + derivative.dx[0] * dt, initialState.x[1] + derivative.dx[1] * dt, initialState.x[2] + derivative.dx[2] * dt], [initialState.dx[0] + derivative.dx[0] * dt, initialState.dx[1] + derivative.dx[1] * dt, initialState.dx[2] + derivative.dx[2] * dt]);

      var acceleration = this.computeAcceleration(bodies, nextState, t + dt);
      return State.create(nextState.dx, acceleration);
    },

    computeGravity: function computeGravity(otherBody, distance) {
      return G * this.mass * otherBody.mass / (distance * distance);
    },

    computeDistance: function computeDistance(otherBody, state) {
      var xdist = otherBody.state.x[0] - state.x[0];
      var ydist = otherBody.state.x[1] - state.x[1];
      var zdist = otherBody.state.x[2] - state.x[2];
      return Math.sqrt(xdist * xdist + ydist * ydist + zdist * zdist);
    },

    computeHeading: function computeHeading(otherBody, state, distance) {
      return [(otherBody.state.x[0] - state.x[0]) / distance, (otherBody.state.x[1] - state.x[1]) / distance, (otherBody.state.x[2] - state.x[2]) / distance];
    }

  };

  exports.BodyPrototype = BodyPrototype;
  function setCircularSpeed(body, barycenter, virtualCentralMass) {
    var center = State.create(barycenter, [0, 0, 0]);
    var dist = BodyPrototype.computeDistance(body, center);
    var heading = BodyPrototype.computeHeading(body, center, dist);
    var speed = Math.sqrt(G * (body.mass + virtualCentralMass) / dist);
    if (dist !== 0) {
      body.state.dx[0] = heading[1] * speed;
      body.state.dx[1] = -heading[0] * speed;
    }
  }

  function bodyFactory(props) {
    var body = Object.create(BodyPrototype);
    var pos = props.position || [0, 0, 0];
    var vel = props.velocity || [0, 0, 0];
    body.state = State.create(pos, vel);

    (0, _nbodyHelpers.assign)(body, {
      radius: props.radius || 0,
      mass: props.mass || 1,
      _forces: [0, 0, 0]
    });

    if (props.isStatic) {
      body.applyForces = false;
    }

    if (props.startCircular) {
      var bPos = props.startCircular.center;
      var bMass = props.startCircular.mass;
      setCircularSpeed(body, bPos, bMass);
    }

    return body;
  }
});
define("nbody/helpers", ["exports"], function (exports) {
  "use strict";

  var _slice = Array.prototype.slice;
  exports.assign = assign;

  function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

  var isEnumerableProp = Object.prototype.isEnumerable;
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  function assign() {
    var args = [].concat(_slice.call(arguments));
    if (Object.assign) {
      return Object.assign.apply(Object, args);
    } else {
      var _ret = (function () {
        var _args = _toArray(args);

        var target = _args[0];

        var sources = _args.slice(1);

        sources.forEach(function (source) {
          var keys = Object.keys(source);

          keys.forEach(function (key) {
            if (hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          });

          if (Object.getOwnPropertySymbols) {
            var symbols = Object.getOwnPropertySymbols(source);
            symbols.forEach(function (symbol) {
              if (isEnumerableProp.call(source, symbol)) {
                target[symbol] = source[symbol];
              }
            });
          }
        });

        return {
          v: target
        };
      })();

      if (typeof _ret === "object") return _ret.v;
    }
  }
});
define('nbody', ['exports', 'nbody/bodies', 'nbody/timer', 'nbody/integrator'], function (exports, _nbodyBodies, _nbodyTimer, _nbodyIntegrator) {
  'use strict';

  exports['default'] = createNBody;
  exports.registerGlobal = registerGlobal;

  function createNBody() {
    var sim = Object.create(null);
    sim.bodies = (0, _nbodyBodies['default'])();
    sim.timer = (0, _nbodyTimer['default'])();
    sim.step = (0, _nbodyIntegrator['default'])(sim.bodies, sim.timer);
    return sim;
  }

  function registerGlobal(window) {
    window.nbody = createNBody;
  }
});
define('nbody/integrator', ['exports'], function (exports) {
  'use strict';

  exports['default'] = integratorFactory;
  function integrateEuler(body, bodies, dt) {
    var a = body.computeAcceleration(bodies, body.state);

    body.state.dx[0] += a[0] * dt;
    body.state.dx[1] += a[1] * dt;
    body.state.dx[2] += a[2] * dt;

    body.state.x[0] += body.state.dx[0] * dt;
    body.state.x[1] += body.state.dx[1] * dt;
    body.state.x[2] += body.state.dx[2] * dt;
  }

  function integrateRK4(body, bodies, t, dt) {
    var initialState = body.state;
    var d1 = body.initialDerivative(bodies);
    var d2 = body.nextDerivative(bodies, initialState, d1, t, dt * 0.5);
    var d3 = body.nextDerivative(bodies, initialState, d2, t, dt * 0.5);
    var d4 = body.nextDerivative(bodies, initialState, d3, t, dt);

    var vel0 = 1 / 6 * (d1.x[0] + 2 * (d2.x[0] + d3.x[0]) + d4.x[0]) * dt;
    var vel1 = 1 / 6 * (d1.x[1] + 2 * (d2.x[1] + d3.x[1]) + d4.x[1]) * dt;
    var vel2 = 1 / 6 * (d1.x[2] + 2 * (d2.x[2] + d3.x[2]) + d4.x[2]) * dt;

    var acc0 = 1 / 6 * (d1.dx[0] + 2 * (d2.dx[0] + d3.dx[0]) + d4.dx[0]) * dt;
    var acc1 = 1 / 6 * (d1.dx[1] + 2 * (d2.dx[1] + d3.dx[1]) + d4.dx[1]) * dt;
    var acc2 = 1 / 6 * (d1.dx[2] + 2 * (d2.dx[2] + d3.dx[2]) + d4.dx[2]) * dt;

    body.state.x[0] += vel0;
    body.state.x[1] += vel1;
    body.state.x[2] += vel2;

    body.state.dx[0] += acc0;
    body.state.dx[1] += acc1;
    body.state.dx[2] += acc2;
  }

  function moveBodies(type, bodies, t, dt) {
    var steps = 4;

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

  function integratorFactory(bodies, timer) {
    var type = arguments.length <= 2 || arguments[2] === undefined ? 'rk4' : arguments[2];

    return function integrate() {
      moveBodies(type, bodies.getBodies(), timer.time, timer.dt);
    };
  }
});
define("nbody/timer", ["exports"], function (exports) {
  "use strict";

  exports["default"] = timerFactory;
  var SECOND = 1000;
  var MINUTE = SECOND * 60;
  var HOUR = MINUTE * 60;
  var DAY = HOUR * 24;
  var MONTH = DAY * 31;
  var YEAR = DAY * 365;

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

    advance: function advance(increment) {
      this.time += increment || this.dt;
    }
  };

  function timerFactory() {
    return Object.create(Timer);
  }
});
require("nbody")["registerGlobal"](window, document);
})();
//# sourceMappingURL=nbody.map