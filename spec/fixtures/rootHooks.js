var parallel = require('../../lib/parallel');
var assert   = require('assert');

var i = 0;

beforeEach('root before', function(done) {
  console.log('before')
  setTimeout(function() {
    i++;
    done();
  }, 50);
});

afterEach('root after', function(done) {
  console.log('after')
  setTimeout(function() {
    i++;
    done();
  }, 50);
});

parallel('hooks', function() {

  before(function(done) {
    // Original value
    setTimeout(function() {
      assert.equal(i, 0);
      i++;
      done();
    }, 100);
  });

  beforeEach('hook with title', function(done) {
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
    // Incremented by before, 2x beforeEach, 2x root beforeEach, 2x afterEach, 2x root afterEach
    setTimeout(function() {
      assert.equal(i, 9);
      done();
    }, 50);
  });

  it('test1', function(done) {
    // Incremented by before, 2x beforeEach, 2x root beforeEach
    setTimeout(function() {
      assert.equal(i, 5);
      done();
    }, 250);
  });

  it('test2', function(done) {
    // Incremented by before, 2x beforeEach, 2x root beforeEach
    setTimeout(function() {
      assert.equal(i, 5);
      done();
    }, 250);
  });
});

parallel('super hooks', function() {

  before(function(done) {
    setTimeout(function() {
      // Original value after previous parallel block completes
      assert.equal(i, 9);
      i++;
      done();
    }, 100);
  });

  after(function(done) {
    // Original value (9) then incremented by before, 2x root beforeEach, 2x root afterEach
    setTimeout(function() {
      assert.equal(i, 14);
      done();
    }, 50);
  });

  it('test1', function(done) {
    // Original value (9) then incremented by before, 2x root beforeEach
    setTimeout(function() {
      assert.equal(i, 12);
      done();
    }, 250);
  });

  it('test2', function(done) {
    // Original value (9) then incremented by before, 2x root beforeEach
    setTimeout(function() {
      assert.equal(i, 12);
      done();
    }, 250);
  });
});
