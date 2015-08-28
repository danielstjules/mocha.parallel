var parallel = require('../index.js');
var assert   = require('assert');

parallel('suite', function() {
  it('test1', function(done) {
    setTimeout(done, 100);
  });

  it('test2', function(done) {
    setTimeout(function() {
      assert.equal(true, false);
      done();
    }, 100);
  });

  it('test3', function(done) {
    setTimeout(done, 100);
  });
});
