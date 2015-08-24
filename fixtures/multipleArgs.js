var parallel = require('../index.js');
var Promise  = require('bluebird');
var assert   = require('assert');

describe('multiplications', function() {
  var args = [
    [1, 1, 1],
    [2, 2, 4],
    [3, 3, 9],
    [4, 4, 16]
  ];

  var names = args.map(function(val) {
    return val[0] + ' + ' + val[1] + ' = ' + val[2];
  });

  parallel(names, args, function(x, y, res) {
    return Promise.delay(100).then(function() {
      assert.equal(x * y, res)
    });
  });
});
