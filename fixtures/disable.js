var parallel = require('../index.js');
parallel.disable();

parallel('disable', function() {
  after(function() {
    parallel.enable();
  });

  it('test1', function(done) {
    setTimeout(done, 500);
  });

  it('test2', function(done) {
    setTimeout(done, 500);
  });
});
