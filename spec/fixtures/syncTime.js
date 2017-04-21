var parallel = require('../../lib/parallel');

/**
 * This fixture exists in reference to issue #30. The following test suite
 * previously reported:
 *
 *  suite
 *    ✓ a (110ms)
 *    ✓ b (109ms)
 *    ✓ c (52ms)
 *
 * but now correctly reports:
 *
 *  suite
 *    ✓ a
 *    ✓ b (60ms)
 *    ✓ c (46ms)
 */
parallel('suite', function() {
  this.slow(10);

  it('a', function(done) {
    done();
  });

  it('b', function(done) {
    var a;
    for (var i = 0; i <= 100000000; i++){
      a = i;
    }
    done();
  });

  it('c', function(done) {
    var a;
    for (var i = 0; i <= 100000000; i++){
      a = i;
    }
    done();
  });
});
