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
});
