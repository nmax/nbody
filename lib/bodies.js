import bodyFactory from './body';

export const BodiesProto = {
  createBody (bodyProps) {
    let newBody = bodyFactory(bodyProps);
    this._bodies.push(newBody);
    return newBody;
  },

  removeBody (body) {
    for (let i = 0, l = this._bodies.length; i < l; i += 1) {
      if (this._bodies[i] === body) {
        let removed = this._bodies.splice(i, 1);
        return removed[0];
      }
    }
  },

  getBodies () {
    return this._bodies;
  },

  resetBodies () {
    this._bodies = [];
    return this._bodies;
  }
};

export default function bodiesFactory () {
  let bodies = Object.create(BodiesProto);
  bodies._bodies = [];
  return bodies;
}
