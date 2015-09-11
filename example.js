var nbody = require('./lib');

var b1 = nbody.createBody();
var b2 = nbody.createBody();

b1.position = [-10, 1, 0];
b1.mass = 5e6;
b2.position = [10, -1, 0];
b2.mass = 5e6;

for (var i = 0; i < 100000; i += 1) {
  nbody.step(16);
  //console.log('\n#step: ' + i);
  //console.log('#1', b1.position);
  //console.log('#2', b2.position);
}

