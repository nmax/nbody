var bodies = require('./bodies');
var compute = require('./compute');

window.nbody = Nbody = {
  createBody: bodies.createBody,
  getBodies: bodies.getBodies,
  removeBody: bodies.removeBody,
  step: compute.step
};

module.exports = Nbody;
