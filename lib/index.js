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
