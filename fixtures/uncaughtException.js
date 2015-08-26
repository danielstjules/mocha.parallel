var parallel = require('../index.js');

parallel('uncaught', function() {
  it('test1', function(done) {
    setTimeout(done, 500);
  });

  it('test2', function(done) {
    setTimeout(function() {
      // Thrown while test1 is executing
      throw new Error('test');
    }, 100);
  });

  it('test3', function(done) {
    setTimeout(done, 500);
  });
});
