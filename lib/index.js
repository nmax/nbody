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
