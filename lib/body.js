const G = 6.674e-11; //  N⋅m²/kg²

import {
  assign
} from './helpers';

const State = {
  x: undefined,
  dx: undefined,

  create (x, dx) {
    let s = Object.create(State);
    s.x = x;
    s.dx = dx;
    return s;
  }
};

export const BodyPrototype = {
  applyForces: true,
  state: undefined,

  _forces: undefined,

  mass: undefined,
  radius: undefined,

  computeAcceleration (bodies, state) {
    if (!this.applyForces) {
      return this._forces; // no force, no acceleration
    }

    this._forces[0] = 0;
    this._forces[1] = 0;
    this._forces[2] = 0;

    bodies.forEach(function (otherBody) {
      if (this !== otherBody) {
        let dist = this.computeDistance(otherBody, state);
        let heading = this.computeHeading(otherBody, state, dist);
        let gravity = this.computeGravity(otherBody, dist);

        if (dist > this.radius + otherBody.radius) {
          this._forces[0] += heading[0] * gravity;
          this._forces[1] += heading[1] * gravity;
          this._forces[2] += heading[2] * gravity;
        }
      }
    }, this);

    return this._forces.map((force) => force / this.mass );
  },

  initialDerivative (bodies) {
    let acceleration = this.computeAcceleration(bodies, this.state);
    return State.create(this.state.dx, acceleration);
  },

  nextDerivative (bodies, initialState, derivative, t, dt) {
    let nextState = State.create([
      initialState.x[0] + derivative.dx[0] * dt,
      initialState.x[1] + derivative.dx[1] * dt,
      initialState.x[2] + derivative.dx[2] * dt
    ], [
      initialState.dx[0] + derivative.dx[0] * dt,
      initialState.dx[1] + derivative.dx[1] * dt,
      initialState.dx[2] + derivative.dx[2] * dt
    ]);

    let acceleration = this.computeAcceleration(bodies, nextState, t + dt);
    return State.create(nextState.dx, acceleration);
  },

  computeGravity (otherBody, distance) {
    return (G * this.mass * otherBody.mass) / (distance * distance);
  },

  computeDistance (otherBody, state) {
    let xdist = otherBody.state.x[0] - state.x[0];
    let ydist = otherBody.state.x[1] - state.x[1];
    let zdist = otherBody.state.x[2] - state.x[2];
    return Math.sqrt(xdist * xdist + ydist * ydist + zdist * zdist);
  },

  computeHeading (otherBody, state, distance) {
   return [
     (otherBody.state.x[0] - state.x[0]) / distance,
     (otherBody.state.x[1] - state.x[1]) / distance,
     (otherBody.state.x[2] - state.x[2]) / distance
   ];
  }

};

function setCircularSpeed (body, barycenter, virtualCentralMass) {
  let center = State.create(barycenter, [0, 0, 0]);
  let dist = BodyPrototype.computeDistance(body, center);
  let heading = BodyPrototype.computeHeading(body, center, dist);
  let speed = Math.sqrt((G * (body.mass + virtualCentralMass)) / dist);
  if (dist !== 0) {
    body.state.dx[0] = heading[1] * speed;
    body.state.dx[1] = -heading[0] * speed;
  }
}

export default function bodyFactory (props) {
  let body = Object.create(BodyPrototype);
  let pos = props.position || [0, 0, 0];
  let vel = props.velocity || [0, 0, 0];
  body.state = State.create(pos, vel);

  assign(body, {
    radius: props.radius || 0,
    mass: props.mass || 1,
    _forces: [0, 0, 0]
  });

  if (props.isStatic) {
    body.applyForces = false;
  }

  if (props.startCircular) {
    let bPos = props.startCircular.center;
    let bMass = props.startCircular.mass;
    setCircularSpeed(body, bPos, bMass);
  }

  return body;
}
