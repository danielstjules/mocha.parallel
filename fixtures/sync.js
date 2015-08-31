var parallel = require('../index.js');

parallel('suite', function() {
  beforeEach(function() {
    // sync
  });

  it('test1', function(done) {
    setTimeout(done, 500);
  });

  it('test2', function() {
    // sync
  });

  it('test3', function(done) {
    setTimeout(done, 500);
  });
});
