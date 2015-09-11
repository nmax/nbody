exports.assign = function (target, source) {
  Object.getOwnPropertyNames(source)
    .forEach(function (name) {
      var desc = Object.getOwnPropertyDescriptor(source, name);
      Object.defineProperty(target, name, desc)
    });
  return target;
};

