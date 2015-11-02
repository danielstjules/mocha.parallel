var parallel = require('../index.js');

parallel('suite', function() {
  it('test1', function(done) {
    setTimeout(done, 500);
  });

  it('test2', function() {
    this.skip();
  });

  it('test3', function(done) {
    setTimeout(done, 500);
  });
});
