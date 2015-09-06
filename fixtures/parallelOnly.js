var parallel = require('../index.js');

parallel('suite1', function() {
  it('test1', function(done) {
    setTimeout(done, 500);
  });

  it('test2', function(done) {
    setTimeout(done, 500);
  });

  it('test3', function(done) {
    setTimeout(done, 500);
  });
});

parallel.only('suite2', function() {
  it('test1', function(done) {
    setTimeout(done, 500);
  });

  it('test2', function(done) {
    setTimeout(done, 500);
  });

  it('test3', function(done) {
    setTimeout(done, 500);
  });
});

parallel('suite3', function() {
  it('test1', function(done) {
    setTimeout(done, 500);
  });

  it('test2', function(done) {
    setTimeout(done, 500);
  });

  it('test3', function(done) {
    setTimeout(done, 500);
  });
});
