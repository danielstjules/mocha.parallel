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
      assert(stdout.indexOf('5 passing') !== -1);

      ['500', '600', '700', '800', '900'].forEach(function(delay) {
        var line = '✓ ' + delay;
        assert(stdout.indexOf(line) !== -1);
      });

      // Specs should run in under 1s
      var timeStr = stdout.split('5 passing (')[1].split(')')[0];
      assert(parseInt(timeStr, 10) < 1000);

      done();
    });
  });

  it('can pass multiple arguments', function(done) {
    var cmd = './node_modules/.bin/mocha ' + fixtures.multipleArgs;
    exec(cmd, function(err, stdout, stderr) {
      if (err) return done(err);

      assert(!stderr.length);
      assert(stdout.indexOf('4 passing') !== -1);

      [
        '✓ 1 + 1 = 1',
        '✓ 2 + 2 = 4',
        '✓ 3 + 3 = 9',
        '✓ 4 + 4 = 16'
      ].forEach(function(line) {
        assert(stdout.indexOf(line) !== -1);
      })

      done();
    });
  });
});
