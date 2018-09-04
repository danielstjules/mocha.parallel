var assert = require('assert');
var parallel = require('../../lib/parallel');

describe('parent hooks regression #47', function() {

  beforeEach(function() {
    process.stdout.write('globalBeforeEach, ')
  });

  afterEach(function() {
    process.stdout.write('globalAfterEach, ')
  });

  describe('run parallel', function() {
    parallel('trigger hooks removal', function() {
      it('one', function() {
        assert(true);
      });
      it('two', function() {
        assert(true);
      });
    })
  });

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

    afterEach(function(done) {
      process.stdout.write('suiteAAfterEach, ');
      setTimeout(function() {
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

      afterEach(function(done) {
        process.stdout.write('suiteBAfterEach, ');
        setTimeout(function() {
          done();
        }, 50);
      });

      describe('hooks', function() {
        beforeEach(function(done) {
          process.stdout.write('childBeforeEach, ');
          setTimeout(function() {
            i++;
            done();
          }, 50);
        });

        it('test1', function(done) {
          process.stdout.write('test1, ');
          // Incremented by before and 4x beforeEach
          setTimeout(function() {
            assert.equal(i, 4);
            done();
          }, 1000);
        });

        it('test2', function(done) {
          process.stdout.write('test2\n');
          // Incremented by before and 6x beforeEach
          setTimeout(function() {
            assert.equal(i, 7);
            done();
          }, 1000);
        });
      });
    });
  });

});
