var parallel = require('../index.js');
var assert   = require('assert');

describe('suiteA', function() {
  var i = 0;

  before(function(done) {
    setTimeout(function() {
      assert.equal(i, 0);
      i++;
      done();
    }, 100);
  });

  beforeEach(function(done) {
    process.stdout.write('suiteABeforeEach, ');
    setTimeout(function() {
      i++;
      done();
    }, 50);
  });

  describe('suiteB', function() {
    beforeEach(function(done) {
      process.stdout.write('suiteBBeforeEach, ');
      setTimeout(function() {
        i++;
        done();
      }, 50);
    });

    parallel('hooks', function() {
      beforeEach(function(done) {
        process.stdout.write('childBeforeEach, ');
        setTimeout(function() {
          i++;
          done();
        }, 50);
      });

      it('test1', function(done) {
        process.stdout.write('test1, ');
        // Incremented by before and 6x beforeEach
        setTimeout(function() {
          assert.equal(i, 7);
          done();
        }, 1000);
      });

      it('test2', function(done) {
        process.stdout.write('test2\n');
        // Incremented by before, 6x beforeEach
        setTimeout(function() {
          assert.equal(i, 7);
          done();
        }, 1000);
      });
    });
  });
});
