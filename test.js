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

      // Specs should run in 1s
      var timeStr = stdout.match(/passing \((\d+)s\)/)[1];
      assert(parseInt(timeStr, 10) === 1);

      done();
    });
  });

  it('supports all mocha hooks', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.hooks;
    exec(cmd, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('2 passing') !== -1);

      // Specs should run in 1s
      var timeStr = stdout.match(/passing \((\d+)s\)/)[1];
      assert(parseInt(timeStr, 10) === 1);

      done();
    });
  });

  it('correctly handles the readme example', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.hooksSimple;
    exec(cmd, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('2 passing') !== -1);

      // Specs should run in 1s
      var timeStr = stdout.match(/passing \((\d+)s\)/)[1];
      assert(parseInt(timeStr, 10) === 1);

      done();
    });
  });
});
