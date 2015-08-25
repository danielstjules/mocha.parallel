var parallel = require('../index.js');
var assert   = require('assert');

parallel('hooks', function() {
  var i = 0;

  before(function(done) {
    setTimeout(function() {
      assert.equal(i, 0);
      i++;
      done();
    }, 100);
  });

  beforeEach(function(done) {
    setTimeout(function() {
      i++;
      done();
    }, 50);
  });

  afterEach(function(done) {
    setTimeout(function() {
      i++;
      done();
    }, 50);
  });

  after(function(done) {
    // Incremented by before, 2x beforeEach, 2x afterEach
    setTimeout(function() {
      assert.equal(i, 5);
      done();
    }, 50);
  });

  it('test1', function(done) {
    // Incremented by before and 2x beforeEach
    setTimeout(function() {
      assert.equal(i, 3);
      done();
    }, 1000);
  });

  it('test2', function(done) {
    // Incremented by before, 2x beforeEach
    setTimeout(function() {
      assert.equal(i, 3);
      done();
    }, 1000);
  });
});
