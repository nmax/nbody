const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR   = MINUTE * 60;
const DAY    = HOUR * 24;
const MONTH  = DAY * 31;
const YEAR   = DAY * 365;

const Timer = {
  units: Object.freeze({
    SECOND,
    MINUTE,
    HOUR,
    DAY,
    MONTH,
    YEAR
  }),

  time: 0,
  dt: 5 * MINUTE,

  advance (increment) {
    this.time += increment || this.dt;
  }
};

export default function timerFactory () {
  return Object.create(Timer);
}

