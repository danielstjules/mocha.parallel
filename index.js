/**
 * Builds the test suite dynamically to allow for parallel execution of the
 * individual specs. While each spec is ran in parallel, specs resolve in
 * series, leading to deterministic output. Expects an array of names,
 * arguments, and a function that returns a Promise.
 *
 * @example
 * parallel(['test1', 'test2'], [[1, 2], [2, 4]], function(x, expected) {
 *   return Promise.delay(100).then(function() {
 *     assert.equal(x + x, res);
 *   });
 * });
 *
 * @param {string[]} names Names to assign the specs
 * @param {*[]}      args  Arguments to pass to the function
 * @param {}               A function returning a promise
 */
module.exports = function parallel(names, args, fn) {
  args.map(function(arg) {
    if (arg instanceof Array) {
      return fn.apply(fn, arg);
    } else {
      return fn(arg);
    }
  }).forEach(function(promise, i) {
    it(names[i], function() {
      return promise;
    });
  });
};
