var Promise = require('bluebird');

/**
 * Generates a suite for parallel execution of individual specs. While each
 * spec is ran in parallel, specs resolve in series, leading to deterministic
 * output. Compatible with both callbacks and promises. Supports before/after
 * hooks, but not afterEach/beforeEach hooks, nor nested suites.
 *
 * @example
 * parallel('setTimeout', function() {
 *   it('test1', function(done) {
 *     setTimeout(done, 500);
 *   });
 *   it('test2', function(done) {
 *     setTimeout(done, 500);
 *   });
 * });
 *
 * @param {string}   name
 * @param {function} fn
 */
module.exports = function parallel(name, fn) {
  var specs = [];
  var hooks = {};
  var original = it;

  it = function it(name, fn) {
    var promise = new Promise(function(resolve, reject) {
      // Use timeout to prioritize hook execution
      setTimeout(function() {
        var res = fn(function(err) {
          if (err) return reject(err);
          resolve();
        });

        // Using promises rather than callbacks
        if (res && res.then) resolve(res);
      });
    });

    specs.push({
      name: name,
      promise: promise
    });
  };

  fn();
  it = original;

  describe(name, function() {
    specs.forEach(function(spec) {
      it(spec.name, function() {
        return spec.promise;
      });
    });
  });
};
