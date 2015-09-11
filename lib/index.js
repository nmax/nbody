var bodies = require('./bodies');
var compute = require('./compute');

module.exports = {
  createBody: bodies.createBody,
  getBodies: bodies.getBodies,
  removeBody: bodies.removeBody,
  step: compute.step
};
