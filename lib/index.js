import bodiesFactory from './bodies';
import timerFactory from './timer';
import integratorFactory from './integrator';

export default function createNBody () {
  let sim = Object.create(null);
  sim.bodies = bodiesFactory();
  sim.timer = timerFactory();
  sim.step = integratorFactory(sim.bodies, sim.timer);
  return sim;
}

export function registerGlobal(window) {
  window.nbody = createNBody;
}
