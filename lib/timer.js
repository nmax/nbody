var SECOND = 1000;
var MINUTE = SECOND * 60;
var HOUR = MINUTE * 60;
var DAY = HOUR * 24;
var MONTH = DAY * 31;
var YEAR = DAY * 36;

var Timer = {
  units: Object.freeze({
    SECOND: SECOND,
    MINUTE: MINUTE,
    HOUR: HOUR,
    DAY: DAY,
    MONTH: MONTH,
    YEAR: YEAR
  }),

  time: 0,
  dt: 5 * MINUTE,
  advance: function (increment) {
    this.time += increment || this.dt;
  }
};

exports.create = function createTimer () {
  return Object.create(Timer);
};

