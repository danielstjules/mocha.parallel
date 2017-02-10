var parallel = require('../../lib/parallel');
var Promise  = require('bluebird');

parallel.limit(2);

parallel('suite', function() {
  it('test1', function(done) {
    setTimeout(done, 500);
  });

  it('test2', function(done) {
    setTimeout(done, 500);
  });

  it('test3', function() {
    return Promise.delay(500);
  });

  it('test4', function() {
    return Promise.delay(500);
  });
});
