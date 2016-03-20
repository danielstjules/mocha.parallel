var exec     = require('child_process').exec;
var assert   = require('assert');
var fixtures = require('./fixtures');

describe('parallel', function() {
  this.timeout(2000);

  it('runs specs in parallel', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.delay;
    exec(cmd, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('3 passing') !== -1);
      assert(stdout.indexOf('delays') !== -1);

      [
        '✓ test1',
        '✓ test2',
        '✓ test3'
      ].forEach(function(line) {
        assert(stdout.indexOf(line) !== -1);
      });

      // Specs should run in under 1s
      var timeStr = stdout.match(/passing \((\d+)ms\)/)[1];
      assert(parseInt(timeStr, 10) < 600);

      done();
    });
  });

  it('isolates parallel suite execution', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.multiple;
    exec(cmd, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('4 passing') !== -1);
      assertOneSecond(stdout);

      done();
    });
  });

  it('supports synchronous hooks/specs', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.sync;
    exec(cmd, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('3 passing') !== -1);

      done();
    });
  });

  it('supports all mocha hooks', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.hooks;
    exec(cmd, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('2 passing') !== -1);
      assertOneSecond(stdout);

      done();
    });
  });

  it('supports parent hooks', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.parentHooks;
    var hookStr = 'suiteABeforeEach, suiteBBeforeEach, suiteABeforeEach, ' +
      'suiteBBeforeEach, childBeforeEach, childBeforeEach';

    exec(cmd, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('2 passing') !== -1);
      assert(stdout.indexOf(hookStr) !== -1);
      assertOneSecond(stdout);

      done();
    });
  });

  it('correctly handles the readme example', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.hooksExample;
    exec(cmd, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('2 passing') !== -1);
      assertOneSecond(stdout);

      done();
    });
  });

  it('correctly handles spec failures', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.failure;
    exec(cmd, function(err, stdout, stderr) {
      assert(err);
      assert(!stderr.length);

      assert(stdout.indexOf('2 passing') !== -1);
      assert(stdout.indexOf('1 failing') !== -1);
      assert(stdout.indexOf('1) suite test2:') !== -1);
      assert(stdout.indexOf('Error: Expected error') !== -1);
      assert(stdout.indexOf('fixtures/failure.js:10') !== -1);

      done();
    });
  });

  it('handles async assertion errors', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.assertionFailure;
    exec(cmd, function(err, stdout, stderr) {
      assert(err);
      assert(!stderr.length);

      assert(stdout.indexOf('2 passing') !== -1);
      assert(stdout.indexOf('1 failing') !== -1);
      assert(stdout.indexOf('1) suite test2:') !== -1);
      assert(stdout.indexOf('AssertionError: true == false') !== -1);
      assert(stdout.indexOf('fixtures/assertionFailure.js:11') !== -1);

      done();
    });
  });

  it('links uncaught exceptions to the spec that threw them', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.uncaughtException;
    exec(cmd, function(err, stdout, stderr) {
      assert(err);
      assert(!stderr.length);

      assert(stdout.indexOf('2 passing') !== -1);
      assert(stdout.indexOf('1 failing') !== -1);
      assert(stdout.indexOf('1) uncaught test2:') !== -1);
      assert(stdout.indexOf('fixtures/uncaughtException.js:11') !== -1);

      done();
    });
  });

  it('supports it.skip for pending specs', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.skip;
    exec(cmd, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('2 passing') !== -1);
      assert(stdout.indexOf('1 pending') !== -1);

      done();
    });
  });

  it('supports parallel.skip for pending suites', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.parallelSkip;
    exec(cmd, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('should not be printed') === -1);
      assert(stdout.indexOf('3 passing') !== -1);
      assert(stdout.indexOf('1 pending') !== -1);

      done();
    });
  });

  it('supports it.only for specs', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.only;
    exec(cmd, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('should not run') === -1);
      assert(stdout.indexOf('1 passing') !== -1);

      done();
    });
  });

  it('supports parallel.only for suites', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.parallelOnly;
    exec(cmd, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('3 passing') !== -1);

      done();
    });
  });

  it('supports this.skip() from a spec', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.contextSkip;
    exec(cmd, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('2 passing') !== -1);
      assert(stdout.indexOf('1 pending') !== -1);

      done();
    });
  });

  it('supports this.timeout() from a spec', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures. contextTimeout;
    exec(cmd, function(err, stdout, stderr) {
      assert(err);
      assert(!stderr.length);

      assert(stdout.indexOf('2 passing') !== -1);
      assert(stdout.indexOf('1 failing') !== -1);
      assert(stdout.indexOf('1) parent suite test2:') !== -1);
      assert(stdout.indexOf('timeout of 100ms exceeded. Ensure the done() ' +
        'callback is being called in this test.') !== -1);

      done();
    });
  });

  it('supports parallel.disable() for disabling functionality', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.disable;
    exec(cmd, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('2 passing') !== -1);
      assert(stdout.indexOf('disable') !== -1);

      [
        '✓ test1',
        '✓ test2'
      ].forEach(function(line) {
        assert(stdout.indexOf(line) !== -1);
      });

      // Specs should run in 1s
      var timeStr = stdout.match(/passing \((\d+)s\)/)[1];
      assert.equal(parseInt(timeStr, 10), 1);

      done();
    });
  });
});

/**
 * Asserts that a given test suite ran for one second, given mocha's stdout.
 *
 * @param {string} stdout
 */
function assertOneSecond(stdout) {
  var timeStr = stdout.match(/passing \((\d+)s\)/)[1];
  assert(parseInt(timeStr, 10) === 1);
}
