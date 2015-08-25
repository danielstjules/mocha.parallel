var Promise   = require('bluebird');
var hookTypes = ['before', 'beforeEach', 'afterEach', 'after'];

/**
 * Generates a suite for parallel execution of individual specs. While each
 * spec is ran in parallel, specs resolve in series, leading to deterministic
 * output. Compatible with both callbacks and promises. Supports hooks, but
 * not nested suites.
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
  var restoreIt = patchIt(specs);
  var restoreHooks = patchHooks(hooks);
  var run;

  fn();

  restoreIt();
  restoreHooks();

  hookTypes.forEach(function(key) {
    hooks[key] = hooks[key] || function() {
      return Promise.resolve();
    };
  });

  run = function() {
    specs.forEach(function(spec) {
      spec.promise = hooks.beforeEach().then(function() {
        return spec.getPromise();
      }).then(function() {
        return hooks.afterEach();
      });
    });
  };

  describe(name, function() {
    if (!specs.length) return;

    before(function() {
      return hooks.before().then(function() {
        run();
      });
    });

    after(function() {
      return hooks.after();
    });

    specs.forEach(function(spec) {
      it(spec.name, function() {
        return spec.promise;
      });
    });
  });
};

/**
 * Patches the global it() function used by mocha, and returns a function that
 * restores the original behavior when invoked.
 *
 * @param   {array}    specs Array on which to push specs
 * @returns {function} Function that restores the original it() behavior
 */
function patchIt(specs) {
  var original = it;
  var restore = function() {
    it = original;
  };

  it = function it(name, fn) {
    specs.push({
      name: name,
      getPromise: createWrapper(fn),
      promise: null
    });
  };

  return restore;
}

/**
 * Patches the global hook functions used by mocha, and returns a function
 * that restores the original behavior when invoked.
 *
 * @param   {object}   hooks Object on which to add hooks
 * @returns {function} Function that restores the original it() behavior
 */
function patchHooks(hooks) {
  var original = {};
  var restore;

  hookTypes.map(function(key) {
    original[key] = global[key];

    global[key] = function(fn) {
      hooks[key] = createWrapper(fn);
    };
  });

  restore = function() {
    hookTypes.forEach(function(key) {
      global[key] = original[key];
    });
  };

  return restore;
}

/**
 * Returns a wrapper for a given runnable, including specs or hooks.
 *
 * @param   {function} fn
 * @returns {function}
 */
function createWrapper(fn) {
  return function() {
    return new Promise(function(resolve, reject) {
      var res = fn(function(err) {
        if (err) return reject(err);
        resolve();
      });

      // Using promises rather than callbacks
      if (res && res.then) resolve(res);
    });
  };
}
