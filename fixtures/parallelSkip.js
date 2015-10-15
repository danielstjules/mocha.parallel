var parallel = require('../index.js');

parallel.skip('suite', function() {
  it('test1', function(done) {
    console.log('should not be printed');
    setTimeout(done, 3000);
  });
});

parallel('suite', function() {
  it('test4', function(done) {
    setTimeout(done, 500);
  });

  it('test5', function(done) {
    setTimeout(done, 500);
  });

  it('test6', function(done) {
    setTimeout(done, 500);
  });
});
