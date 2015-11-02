var parallel = require('../index.js');

parallel('suite', function() {
  it('test1', function(done) {
    setTimeout(done, 500);
  });

  it('test2', function(done) {
    this.timeout(100);
    setTimeout(done, 500);
  });

  it('test3', function(done) {
    setTimeout(done, 500);
  });
});
