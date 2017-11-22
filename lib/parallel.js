var Promise      = require('bluebird');
var domain       = require('domain');
var ContextProxy = require('./contextProxy');
var hookTypes    = ['before', 'beforeEach', 'afterEach', 'after'];
var Semaphore    = require('semaphore');
var semaphore;

/**
 * Generates a suite for parallel execution of individual specs. While each
 * spec is ran in parallel, specs resolve in series, leading to deterministic
 * output. Compatible with both callbacks and promises. Supports hooks, pending
 * or skipped specs/suites via parallel.skip() and it.skip(), but not nested
 * suites.  parallel.only() and it.only() may be used to only wait on the
 * specified specs and suites. Runnable contexts are bound, so this.skip()
 * and this.timeout() may be used from within a spec. parallel.disable()
 * may be invoked to use mocha's default test behavior, and parallel.enable()
 * will re-enable the module. parallel.limit(n) can be used to limit the number
 * of specs running simultaneously.
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
 * @param {string}   name Name of the function
 * @param {function} fn   The test suite's body
 */
function parallel(name, fn) {
  _parallel(name, fn);
}

/**
 * Whether or not to enable parallel. If false, specs will be ran using
 * mocha's default suite behavior.
 *
 * @var {bool}
 */
var enabled = true;

/**
 * Private function invoked by parallel.
 *
 * @param {string}   name  Name of the function
 * @param {function} fn    The suite or test body
 * @param {string}   [key] One of 'skip' or 'only'
 */
function _parallel(name, fn, key) {
  if (!enabled) {
    return (key) ? describe[key](name, fn) : describe(name, fn);
  }

  var specs = [];
  var hooks = {};
  var restoreIt = patchIt(specs);
  var restoreHooks = patchHooks(hooks);
  var restoreUncaught;
  var parentHooks;
  var parallelCtx = new ContextProxy();
  fn.call(parallelCtx);

  restoreIt();
  restoreHooks();

  hookTypes.forEach(function(key) {
    hooks[key] = hooks[key] || function() {
      return Promise.resolve();
    };
  });

  var runSpec = function(spec) {
    // beforeEach/spec/afterEach are grouped as a cancellable promise
    // and ran as part of a domain
    domain.create().on('error', function(err) {
      spec.error = err;
      spec.promise.cancel(err);
    }).run(function() {
      if (spec.skip) {
        if (semaphore) semaphore.leave();
        spec.promise = Promise.resolve();
        return;
      }

      process.nextTick(function() {
        spec.promise = parentHooks.beforeEach()
          .cancellable()
          .then(hooks.beforeEach)
          .then(spec.getPromise)
          .then(function() {
            clearTimeout(spec.timeout);
          })
          .then(hooks.afterEach)
          .then(parentHooks.afterEach)
          .finally(function() {
            if (semaphore) semaphore.leave();
          });
        });
    });
  };

  var run = function() {
    // If it.only() was used, only invoke that subset of specs
    var onlySpecs = specs.filter(function(spec) {
      return spec.only;
    });

    if (onlySpecs.length) {
      specs = onlySpecs;
    }

    specs.forEach(function(spec) {
      if (!semaphore) return runSpec(spec);

      semaphore.take(function() {
        runSpec(spec)
      });
    });
  };

  (key ? describe[key] : describe)(name, function() {
    parallelCtx.patchContext(this);
    var parentContext = this;
    if (!specs.length) return;

    parentHooks = getParentHooks(parentContext);

    specs.forEach(function(spec) {
      if (spec.skip) {
        return it.skip(spec.name);
      }

      (spec.only ? it.only : it)(spec.name, function() {
        if (spec.error) throw spec.error;
        spec.ctx.patchContext(this);
        return spec.promise.then(function() {
          if (spec.error) throw spec.error;
        });
      });
    });

    before(function() {
      disableEachHooks(parentContext);
      // Before hook exceptions are handled by mocha
      return hooks.before().then(function() {
        restoreUncaught = patchUncaught();
        run();
      });
    });

    after(function() {
      enableEachHooks(parentContext);
      // After hook errors are handled by mocha
      if (restoreUncaught) restoreUncaught();
      return hooks.after();
    });
  });
}

/**
 * Wrapper for mocha's describe.only()
 *
 * @param {string}   name
 * @param {function} fn
 */
parallel.only = function(name, fn) {
  _parallel(name, fn, 'only');
};

/**
 * Wrapper for mocha's describe.skip()
 *
 * @param {string}   name
 * @param {function} fn
 */
parallel.skip = function(name, fn) {
  _parallel(name, fn, 'skip');
};

/**
 * Limit the number of specs running simultaneously.
 *
 * @param {int} n
 */
parallel.limit = function(n) {
  n = parseInt(n, 10);
  if (n) semaphore = Semaphore(n);
};

/**
 * Re-enables parallel if previously disabled.
 */
parallel.enable = function() {
  enabled = true;
};

/**
 * Disables parallel, falling back to mocha's default test functionality.
 */
parallel.disable = function() {
  enabled = false;
};

/**
 * Patches the global it() function used by mocha, and returns a function that
 * restores the original behavior when invoked.
 *
 * @param   {Spec[]}   specs Array on which to push specs
 * @returns {function} Function that restores the original it() behavior
 */
function patchIt(specs) {
  var original = it;
  var restore = function() {
    it = original;
    xit = it.skip;
  };

  var createSpec = function(name, fn, opts) {
    opts = opts || {};

    var spec = {
      name: name,
      getPromise: function() {
        var start = Date.now();
        return createWrapper(fn, spec.ctx)().then(function(duration) {
          spec.duration = duration;
        });
      },
      duration: 0,
      only: opts.only || null,
      skip: opts.skip || null,
      timeout: null,
      error: null,
      promise: null
    };

    spec.ctx = new ContextProxy(spec);
    specs.push(spec);
  };

  it = function it(name, fn) {
    createSpec(name, fn);
  };

  xit = it.skip = function skip(name, fn) {
    createSpec(name, fn, {skip: true});
  };

  it.only = function only(name, fn) {
    createSpec(name, fn, {only: true});
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

    global[key] = function(title, fn) {
      // Hooks accept an optional title, though they're
      // ignored here for simplicity
      if (!fn) fn = title;
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
 * Optionally binds the function handler to the passed context. Resolves
 * with the duration of the fn.
 *
 * @param   {function} fn
 * @param   {function} [ctx]
 * @returns {function}
 */
function createWrapper(fn, ctx) {
  return function() {
    return new Promise(function(resolve, reject) {
      var start = Date.now();

      var cb = function(err) {
        if (err) return reject(err);
        resolve(Date.now() - start);
      };

      // Wrap generator functions
      if (fn && fn.constructor.name === 'GeneratorFunction') {
        fn = Promise.coroutine(fn);
      }

      var res = fn.call(ctx || this, cb);

      // Synchronous spec, or using promises rather than callbacks
      if (!fn.length || (res && res.then)) {
        Promise.resolve(res).then(function() {
          resolve(Date.now() - start);
        }, reject);
      }
    });
  };
}

/**
 * Wraps the existing hooks into a series of promises. Returns an object with
 * two functions: beforeEach and afterEach. Each function returns a promise
 * that resolves once all parents hooks have completed, recursively.
 *
 * @param   {Context} context
 * @returns {object}
 */
function getParentHooks(context) {
  var getOrderedHooks = function(context, type) {
    var hooks = [].concat(context['_' + type]).map(function(hook) {
      return createWrapper(hook.fn);
    });

    if (!context.parent) return hooks;

    return hooks.concat(getOrderedHooks(context.parent, type));
  };

  return ['beforeEach', 'afterEach'].reduce(function(res, type) {
    var array = getOrderedHooks(context, type);
    // parent beforeEach runs before child beforeEach
    if (type === 'beforeEach') {
      array.reverse();
    }

    res[type] = function() {
      var promise = Promise.resolve();
      array.forEach(function(hook) {
        promise = promise.then(hook());
      });

      return promise;
    };
    return res;
  }, {});
}

/**
 * Given a mocha context object, recursively disables all beforeEach/afterEach
 * hooks for all parents suites. Necessary override when the parent hooks are
 * invoked.
 *
 * @param {Context} context
 */
function disableEachHooks(context) {
  context._disabledBeforeEach = context._beforeEach;
  context._disabledAfterEach = context._afterEach;
  context._beforeEach = [];
  context._afterEach = [];

  if (!context.parent) return;
  disableEachHooks(context.parent);
}

/**
 * Given a mocha context object, recursively re-enables all beforeEach and
 * afterEach hooks.
 *
 * @param {Context} context
 */
function enableEachHooks(context) {
  context._beforeEach= context._disabledBeforeEach;
  context._afterEach = context._disabledAfterEach;
  delete context._disabledBeforeEach;
  delete context._disabledAfterEach;

  if (!context.parent) return;
  disableEachHooks(context.parent);
}

/**
 * Removes mocha's uncaughtException handler, allowing exceptions to be handled
 * by domains during parallel spec execution, and all others to terminate the
 * process.
 *
 * @returns {function} Function that restores mocha's uncaughtException listener
 */
function patchUncaught() {
  var name = 'uncaughtException';
  var originalListener = process.listeners(name).pop();

  if (originalListener) {
    process.removeListener(name, originalListener);
  }

  return function() {
    if (!originalListener) return;
    process.on(name, originalListener);
  };
}

Promise.onPossiblyUnhandledRejection(function() {
  // Stop bluebird from printing the unhandled rejections
});

module.exports = parallel;
