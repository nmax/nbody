const isEnumerableProp = Object.prototype.isEnumerable;
const hasOwnProperty = Object.prototype.hasOwnProperty;

export function assign () {
  let args = [...arguments];
  if (Object.assign) {
    return Object.assign.apply(Object, args);
  } else {
    let [target, ...sources] = args;

    sources.forEach(function (source) {
      let keys = Object.keys(source);

      keys.forEach(function (key) {
        if (hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      });

      if (Object.getOwnPropertySymbols) {
        let symbols = Object.getOwnPropertySymbols(source);
        symbols.forEach(function (symbol) {
          if (isEnumerableProp.call(source, symbol)) {
            target[symbol] = source[symbol];
          }
        });
      }
    });

    return target;
  }
}
