var parallel = require('../index.js');
var Promise  = require('bluebird');

describe('delays', function() {
  var args = [500, 600, 700, 800, 900];
  parallel(args, args, function(arg) {
    return Promise.delay(arg);
  });
});
