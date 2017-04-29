var parallel = require('../../lib/parallel');
var Promise  = require('bluebird');
var assert   = require('assert');

parallel('suite', function() {
  it('should throw an AssertionError', function() {
    return Promise.resolve().then(function() {
      assert(false)
    });
  });
});
