var parallel = require('../../lib/parallel');
var assert   = require('assert');

parallel('suite', function() {
  this.timeout(3000);
  this.slow(2600);

  it('test1', function(done) {
    this.timeout(100);
    setTimeout(done, 500);
  });

  it('test2', function(done) {
    this.skip();
    setTimeout(done, 500);
  });

  it('test3', function(done) {
    this.slow(200);
    setTimeout(done, 500);
  });

  it('test4', function(done) {
    setTimeout(done, 2500);
  });

  it('test5', function(done) {
    assert.strictEqual('test5', this.spec.title);
    assert.strictEqual('test5', this.spec.fullTitle());
    assert.strictEqual('test5', this.spec.name);
    assert.strictEqual('test5', this.spec.titlePath());
    done();
  });
});
