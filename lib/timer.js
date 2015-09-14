var SECOND = 1000;
var MINUTE = SECOND * 60;
var HOUR   = MINUTE * 60;
var DAY    = HOUR * 24;
var MONTH  = DAY * 31;
var YEAR   = DAY * 365;

var time = 0;
var dt = 1.5 * HOUR;

var Timer = {
  time: 0,
  dt: 1 * HOUR,
  advance: function () {
    this.time += this.dt;
  }
};

module.exports = Timer;

