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
