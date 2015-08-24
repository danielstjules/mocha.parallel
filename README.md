# mocha.parallel

Run async mocha specs in parallel.

[![Build Status](https://travis-ci.org/danielstjules/mocha.parallel.svg?branch=master)](https://travis-ci.org/danielstjules/mocha.parallel)

```
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
```

## Examples

Rather than taking 3.5s, the specs below run in parallel, completing in just
over 900ms.

``` javascript
var parallel = require('../index.js');
var Promise  = require('bluebird');

describe('delays', function() {
  var args = [500, 600, 700, 800, 900];
  parallel(args, args, function(arg) {
    return Promise.delay(arg);
  });
});
```

```
  delays
    ✓ 500 (497ms)
    ✓ 600 (99ms)
    ✓ 700 (98ms)
    ✓ 800 (99ms)
    ✓ 900 (99ms)


  5 passing (902ms)
```

An example of passing multiple arguments

``` javascript
var parallel = require('../index.js');
var Promise  = require('bluebird');
var assert   = require('assert');

describe('multiplications', function() {
  var args = [
    [1, 1, 1],
    [2, 2, 4],
    [3, 3, 9],
    [4, 4, 16]
  ];

  var names = args.map(function(val) {
    return val[0] + ' + ' + val[1] + ' = ' + val[2];
  });

  parallel(names, args, function(x, y, res) {
    return Promise.delay(100).then(function() {
      assert.equal(x * y, res)
    });
  });
});
```

```
  multiplications
    ✓ 1 + 1 = 1 (101ms)
    ✓ 2 + 2 = 4
    ✓ 3 + 3 = 9
    ✓ 4 + 4 = 16


  4 passing (110ms)
```
