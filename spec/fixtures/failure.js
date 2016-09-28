var parallel = require('../../lib/parallel');

parallel('suite', function() {
  it('test1', function(done) {
    setTimeout(done, 100);
  });

  it('test2', function(done) {
    setTimeout(function() {
      return done(new Error('Expected error'));
    }, 100);
  });

  it('test3', function(done) {
    setTimeout(done, 100);
  });
});
