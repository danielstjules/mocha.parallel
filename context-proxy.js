module.exports = ContextProxy;

/**
 * Proxy object for the test context.
 * Allows to store async spec context configurations
 * and apply them to the mocha test context when it becomes available
 *
 * @param {Spec} [spec] used to store context configurations
 */
function ContextProxy(spec) {
    this.spec = spec;
    this.config = {};
}

/**
 * Set test timeout `ms`.
 *
 * @param {number} ms
 * @return {ContextProxy} self
 */
ContextProxy.prototype.timeout = function(ms) {
    if(this.spec){
        this.spec.timeout = setTimeout(function() {
            var error = new Error('timeout of ' + ms + 'ms exceeded. Ensure the ' +
                'done() callback is being called in this test.');
            error.stack = null;
            throw error;
        }, ms);
    }

    this.config.timeout = ms;
    return this;
};

/**
 * Set test slowness threshold `ms`.
 *
 * @param {number} ms
 * @return {ContextProxy} self
 */
ContextProxy.prototype.slow = function(ms) {
    this.config.slow = ms;
    return this;
};


/**
 * Mark a test as skipped.
 *
 * @return {ContextProxy} self
 */
ContextProxy.prototype.skip = function() {
    this.config.skip = true;
    return this;
};

/**
 * Apply stored configurations to the mocha test context
 *
 * @param {Context} test_ctx
 */
ContextProxy.prototype.patchContext = function(test_ctx) {

    if(this.spec && this.spec.timeout)
        test_ctx.timeout(0); //Disable timeout if one is already running
    else if(this.config.timeout)
        test_ctx.timeout(this.config.timeout);

    if(this.config.slow)
        test_ctx.slow(this.config.slow);

    if(this.config.skip)
        test_ctx.skip();

    //Hack duration variable of the test runnable to use the actual duration of the spec.
    if(this.spec && test_ctx.runnable){
        var spec = this.spec;
        var orig_duration = test_ctx.runnable().duration;
        delete test_ctx.runnable().duration;
        Object.defineProperty(test_ctx.runnable(), "duration", {
            get: function () {
                return spec.duration || orig_duration;
            },
            set: function (duration) {
                orig_duration = duration;
            },
            enumerable: true,
            configurable: true
        });
    }


};


