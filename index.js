var Funnel = require('broccoli-funnel');

module.exports = {
  name: "nbody",
  treeForVendor: function() {
    var files = new Funnel(__dirname + '/dist/', {
      files: [
        'global/nbody.js'
      ],
      destDir: 'nbody'
    });
    return files;
  },
  included: function(app) {
    app.import('vendor/nbody/global/nbody.js');
  }
};
