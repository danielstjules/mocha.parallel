var Promise   = require('bluebird');
var domain    = require('domain');
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
  var restoreUncaught;
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
      // beforeEach/spec/afterEach are grouped as a cancellable promise
      // and ran as part of a domain
      domain.create().on('error', function(err) {
        spec.error = err;
        spec.promise.cancel(err);
      }).run(function() {
        spec.promise = hooks.beforeEach().cancellable().then(function() {
          return spec.getPromise();
        }).then(function() {
          return hooks.afterEach();
        });
      });
    });
  };

  describe(name, function() {
    if (!specs.length) return;

    before(function() {
      // Before hook exceptions are handled by mocha
      return hooks.before().then(function() {
        restoreUncaught = patchUncaught();
        run();
      });
    });

    after(function() {
      // After hook errors are handled by mocha
      if (restoreUncaught) restoreUncaught();
      return hooks.after();
    });

    specs.forEach(function(spec) {
      it(spec.name, function() {
        if (spec.err) throw spec.err;
        return spec.promise.then(function() {
          if (spec.err) throw spec.err;
        });
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
      error: null,
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
 * Returns a wrapper for a given runnable's fn, including specs or hooks.
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

/**
 * Removes mocha's uncaughtException handler, allowing exceptions to be handled
 * by domains during parallel spec execution.
 *
 * @returns {function} Function that restores mocha's uncaughtException listener
 */
function patchUncaught() {
  var name = 'uncaughtException';
  var originalListener = process.listeners(name).pop();

  var listener = function(err) {
    // noop
  };

  process.removeListener(name, originalListener);
  process.on(name, listener);

  return function() {
    process.removeListener(name, listener);
    process.on(name, originalListener);
  };
}

Promise.onPossiblyUnhandledRejection(function() {
  // Stop bluebird from printing the unhandled rejections
});
