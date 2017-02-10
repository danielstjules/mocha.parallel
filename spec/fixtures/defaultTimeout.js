var parallel = require('../../lib/parallel');
var Promise = require('bluebird');

// Based on issue #13
parallel('suite', function() {
  it('test1', function() {
    return Promise.delay(2500);
  });

  it('test2', function() {
    return Promise.delay(2500);
  });
});
