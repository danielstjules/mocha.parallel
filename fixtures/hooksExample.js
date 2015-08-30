var parallel = require('../index.js');
var assert   = require('assert');

describe('suite', function() {
  var i = 0;

  beforeEach(function(done) {
    // Invoked twice, before either spec starts
    i++;
    done();
  });

  parallel('hooks', function() {
    beforeEach(function(done) {
      // Invoked twice, before either spec starts
      i++;
      done();
    });

    it('test1', function(done) {
      // Incremented by 4x beforeEach
      setTimeout(function() {
        assert.equal(i, 4);
        done();
      }, 1000);
    });

    it('test2', function(done) {
      // Incremented by 4x beforeEach
      setTimeout(function() {
        assert.equal(i, 4);
        done();
      }, 1000);
    });
  });
});
