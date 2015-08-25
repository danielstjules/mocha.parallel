var parallel = require('../index.js');
var assert   = require('assert');

parallel('hooks', function() {
  var i = 0;

  beforeEach(function(done) {
    // The beforeEach will be invoked twice,
    // before either spec starts
    setTimeout(function() {
      i++;
      done();
    }, 50);
  });

  it('test1', function(done) {
    // Incremented by 2x beforeEach
    setTimeout(function() {
      assert.equal(i, 2);
      done();
    }, 1000);
  });

  it('test2', function(done) {
    // Incremented by 2x beforeEach
    setTimeout(function() {
      assert.equal(i, 2);
      done();
    }, 1000);
  });
});
