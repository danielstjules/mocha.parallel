# mocha.parallel

Run async mocha specs in parallel.

[![Build Status](https://travis-ci.org/danielstjules/mocha.parallel.svg?branch=master)](https://travis-ci.org/danielstjules/mocha.parallel)

## Installation

```
npm install --save mocha.parallel
```

## Overview

``` javascript
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
```

## Examples

Rather than taking 1.5s, the specs below run in parallel, completing in just
over 500ms.

``` javascript
var parallel = require('../index.js');
var Promise  = require('bluebird');

parallel('delays', function() {
  it('test1', function(done) {
    setTimeout(done, 500);
  });

  it('test2', function(done) {
    setTimeout(done, 500);
  });

  it('test3', function() {
    return Promise.delay(500);
  });
});
```

```
  ✓ test1 (506ms)
  ✓ test2
  ✓ test3

  3 passing (516ms)
```

## Caveats

Debugging parallel execution can be more difficult as exceptions may be thrown
from any of the running specs.
