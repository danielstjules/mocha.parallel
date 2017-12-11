var exec     = require('child_process').exec;
var assert   = require('assert');
var path     = require('path');
var dirmap   = require('dirmap');
var fixtures = dirmap(path.resolve(__dirname, './fixtures'), true);
var path     = require('path');

describe('parallel', function() {
  this.timeout(4000);

  it('runs specs in parallel', function(done) {
    run(fixtures.delay, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('3 passing') !== -1);
      assert(stdout.indexOf('delays') !== -1);
      assertSubstrings(stdout, ['✓ test1', '✓ test2', '✓ test3']);
      assert(getRuntime(stdout) < 600);

      done();
    });
  });

  it('can limit the number of specs running simultaneously', function(done) {
    run(fixtures.limit, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('4 passing') !== -1);
      assertSubstrings(stdout, ['✓ test1', '✓ test2', '✓ test3', '✓ test4']);
      assert.equal(getRuntime(stdout), 1);

      done();
    });
  });

  it('isolates parallel suite execution', function(done) {
    run(fixtures.multiple, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('4 passing') !== -1);
      assertOneSecond(stdout);

      done();
    });
  });

  it('supports synchronous hooks/specs', function(done) {
    run(fixtures.sync, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('3 passing') !== -1);

      done();
    });
  });

  it('supports all mocha hooks', function(done) {
    run(fixtures.hooks, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('2 passing') !== -1);
      assertOneSecond(stdout);

      done();
    });
  });

  it('correctly supports root hooks', function(done) {
    run(fixtures.rootHooks, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('2 passing') !== -1);

      done();
    });
  });

  it('supports parent hooks', function(done) {
    var hookStr = 'suiteABeforeEach, suiteBBeforeEach, suiteABeforeEach, ' +
      'suiteBBeforeEach, childBeforeEach, childBeforeEach';

    run(fixtures.parentHooks, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('2 passing') !== -1);
      assert(stdout.indexOf(hookStr) !== -1);
      assertOneSecond(stdout);

      done();
    });
  });

  it('correctly handles the readme example', function(done) {
    run(fixtures.hooksExample, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('2 passing') !== -1);
      assertOneSecond(stdout);

      done();
    });
  });

  it('correctly handles spec failures', function(done) {
    run(fixtures.failure, function(err, stdout, stderr) {
      assert(err);
      assert(!stderr.length);

      assertSubstrings(stdout, [
        '2 passing',
        '1 failing',
        '1) suite test2:',
        'Error: Expected error',
        'fixtures/failure.js:10'
      ]);

      done();
    });
  });

  it('handles async assertion errors', function(done) {
    run(fixtures.assertionFailure, function(err, stdout, stderr) {
      assert(err);
      assert(!stderr.length);

      assertSubstrings(stdout, [
        '2 passing',
        '1 failing',
        '1) suite test2:',
        'true == false',
        'fixtures/assertionFailure.js:11'
      ]);

      done();
    });
  });

  it('links uncaught exceptions to the spec that threw them', function(done) {
    run(fixtures.uncaughtException, function(err, stdout, stderr) {
      assert(err);
      assert(!stderr.length);

      assertSubstrings(stdout, [
        '2 passing',
        '1 failing',
        '1) uncaught test2:',
        'fixtures/uncaughtException.js:11'
      ]);

      done();
    });
  });

  it('supports it.skip for pending specs', function(done) {
    run(fixtures.skip, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('2 passing') !== -1);
      assert(stdout.indexOf('1 pending') !== -1);
      assert(stdout.indexOf('should not appear') === -1);

      done();
    });
  });

  it('supports parallel.skip for pending suites', function(done) {
    run(fixtures.parallelSkip, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('should not be printed') === -1);
      assert(stdout.indexOf('3 passing') !== -1);
      assert(stdout.indexOf('1 pending') !== -1);

      done();
    });
  });

  it('supports it.only for specs', function(done) {
    run(fixtures.only, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('should not run') === -1);
      assert(stdout.indexOf('1 passing') !== -1);

      done();
    });
  });

  it('supports parallel.only for suites', function(done) {
    run( fixtures.parallelOnly, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('3 passing') !== -1);

      done();
    });
  });

  it('supports this.skip() from a spec', function(done) {
    run(fixtures.contextSkip, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('2 passing') !== -1);
      assert(stdout.indexOf('1 pending') !== -1);

      done();
    });
  });

  it('supports this.timeout() from a spec', function(done) {
    run(fixtures.contextTimeout, function(err, stdout, stderr) {
      assert(err);
      assert(!stderr.length);

      assertSubstrings(stdout, [
        '2 passing',
        '1 failing',
        '1) parent suite test2:',
        'timeout of 100ms exceeded. Ensure the done()',
        'callback is being called in this test.'
      ]);

      done();
    });
  });

  it('supports parallel.disable() for disabling functionality', function(done) {
    run(fixtures.disable, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assertSubstrings(stdout, ['2 passing', 'disable', '✓ test1', '✓ test2']);
      assert.equal(getRuntime(stdout), 1);

      done();
    });
  });


  it('supports timeout/slow/skip from specs and suites', function(done) {
    run(fixtures.contextProxy, function(err, stdout, stderr) {
      assert(err);
      assert(!stderr.length);
      assert(stdout.indexOf('2 passing') !== -1);
      assert(stdout.indexOf('1 pending') !== -1);
      assert(stdout.indexOf('1 failing') !== -1);
      assert(stdout.indexOf('1) suite test1:') !== -1);
      assert(stdout.indexOf('timeout of 100ms exceeded') !== -1);

      done();
    });
  });

  it('correctly handles default timeout', function(done) {
    run(fixtures.defaultTimeout, function(err, stdout, stderr) {
      stdout = stdout.toLowerCase();
      assert(err);
      assert(!stderr.length);
      assert(stdout.indexOf('0 passing') !== -1);
      assert(stdout.indexOf('2 failing') !== -1);
      assert(stdout.indexOf('1) suite test1:') !== -1);
      assert(stdout.indexOf('2) suite test2:') !== -1);
      var i = stdout.indexOf('timeout of 2000ms exceeded');
      assert(i !== -1);
      i = stdout.indexOf('timeout of 2000ms exceeded', i + 1);
      assert(i !== -1);

      done();
    });
  });

  it('correctly reports duration for synchronous tests', function(done) {
    run(fixtures.syncTime, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert.equal(stdout.indexOf('a ('), -1);
      done();
    });
  });

  it('correctly handles promise rejections', function(done) {
    run(fixtures.promiseRejection, function(err, stdout, stderr) {
      assert(err);
      assert(stdout.indexOf('false == true') !== -1);
      done();
    });
  });
});

/**
 * Runs mocha with the supplied argumentss, and passes the resulting stdout and
 * stderr to the callback.
 *
 * @param {...string} args
 * @param {function}  fn
 */
function run() {
  var bin = path.resolve(__dirname, '../node_modules/.bin/mocha');
  var args = Array.prototype.slice.call(arguments);
  var fn = args.pop();
  var cmd = [bin].concat(args).join(' ');
  exec(cmd, fn);
}

/**
 * Returns mocha's runtime given the stdout of a run.
 *
 * @param   {string} str
 * @returns {int}
 */
function getRuntime(str) {
  var timeStr = str.match(/passing \((\d+)\w+\)/)[1];
  return parseInt(timeStr, 10);
}

/**
 * Asserts that each substring is present in the supplied string.
 *
 * @param {string}   str
 * @param {string[]} substrings
 */
function assertSubstrings(str, substrings) {
  substrings.forEach(function(substring) {
    assert(str.indexOf(substring) !== -1, + str +
      ' - string does not contain: ' + substring);
  });
}

/**
 * Asserts that a given test suite ran for one second, given mocha's stdout.
 *
 * @param {string} stdout
 */
function assertOneSecond(stdout) {
  var timeStr = stdout.match(/passing \((\d+)s\)/)[1];
  assert(parseInt(timeStr, 10) === 1);
}
