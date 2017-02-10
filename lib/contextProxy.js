/**
 * Proxy class for test and suite contexts.
 *
 * @param {Spec} [spec]
 */
function ContextProxy(spec) {
  this.spec = spec;
  this.config = {};
}

/**
 * Set test timeout.
 *
 * @param  {number}       ms
 * @return {ContextProxy}
 */
ContextProxy.prototype.timeout = function(ms) {
  this.config.timeout = ms;
  if (!this.spec) return this;
  this.spec.timeout = setTimeout(function() {
    var error = new Error('timeout of ' + ms + 'ms exceeded. Ensure the ' +
      'done() callback is being called in this test.');
    error.stack = null;
    throw error;
  }, ms);
  return this;
};

/**
 * Set test slowness threshold.
 *
 * @param  {number}       ms
 * @return {ContextProxy}
 */
ContextProxy.prototype.slow = function(ms) {
  this.config.slow = ms;
  return this;
};

/**
 * Mark a test as skipped.
 *
 * @return {ContextProxy}
 */
ContextProxy.prototype.skip = function() {
  this.config.skip = true;
  return this;
};

/**
 * Overrides original context behavior and configuration.
 *
 * @param {Context} ctx
 */
ContextProxy.prototype.patchContext = function(ctx) {
  if (this.spec && this.spec.timeout) {
    ctx.timeout(0);
  } else if (this.config.timeout) {
    ctx.timeout(this.config.timeout);
  }

  if (this.config.slow) {
    ctx.slow(this.config.slow);
  }

  if (this.config.skip) {
    ctx.skip();
  }

  // Derive correct runnable duration
  if (this.spec && ctx.runnable) {
    var spec = this.spec;
    var originalDuration = ctx.runnable().duration;
    delete ctx.runnable().duration;
    Object.defineProperty(ctx.runnable(), 'duration', {
      get: function() {
        return spec.duration || originalDuration;
      },
      set: function(duration) {
        originalDuration = duration;
      },
      enumerable: true,
      configurable: true
    });
  }
};

module.exports = ContextProxy;
