var parallel = require('../../lib/parallel');
var assert   = require('assert')

var i = 0;

before('root before', function() {
  console.log('root before')
  i++;
});

beforeEach('root beforeEach', function() {
  console.log('root beforeEach')
  i++;
});

afterEach('root afterEach', function() {
  console.log('root afterEach')
  i++;
});

after('root after', function() {
  console.log('root after')
  i++;
});

parallel('first suite', function() {
  before(function() {
    console.log('parallel before')
    i++;
  });

  beforeEach('hook with title', function() {
    console.log('parallel beforeEach')
    i++;
  });

  afterEach(function() {
    console.log('parallel afterEach')
    i++;
  });

  after(function() {
    console.log('parallel after')
    i++;
  });

  it('test', function() {
    assert.equal(i, 4)
  });
});

parallel('second suite', function() {
  before(function() {
    console.log('parallel before')
    i++;
  });

  beforeEach('hook with title', function() {
    console.log('parallel beforeEach')
    i++;
  });

  afterEach(function() {
    console.log('parallel afterEach')
    i++;
  });

  after(function() {
    console.log('parallel after')
    i++;
  });

  it('test', function() {
    assert.equal(i, 10)
  });
});
