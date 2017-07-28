var parallel = require('../../lib/parallel');

parallel('suite', function() {
  it('test1', function(done) {
    setTimeout(done, 500);
  });

  it.skip('test2', function(done) {
    console.log('should not appear');
    setTimeout(done, 500);
  });

  it('test3', function(done) {
    setTimeout(done, 500);
  });
});
