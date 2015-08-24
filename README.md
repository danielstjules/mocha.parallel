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
 * output. Compatible with both callbacks and promises. Does not support hooks
 * nor nested suites.
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
var parallel = require('mocha.parallel');
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
  delays
    ✓ test1 (500ms)
    ✓ test2
    ✓ test3


  3 passing (512ms)
```

Individual parallel suites run in series and in isolation from each other.
In the example below, the two specs in suite1 run in parallel, followed by
those in suite2.

``` javascript
var parallel = require('mocha.parallel');

parallel('suite1', function() {
  it('test1', function(done) {
    setTimeout(done, 500);
  });

  it('test2', function(done) {
    setTimeout(done, 500);
  });
});

parallel('suite2', function() {
  it('test1', function(done) {
    setTimeout(done, 500);
  });

  it('test2', function(done) {
    setTimeout(done, 500);
  });
});
```

```
  suite1
    ✓ test1 (503ms)
    ✓ test2

  suite2
    ✓ test1 (505ms)
    ✓ test2


  4 passing (1s)
```

## Caveats

Debugging parallel execution can be more difficult as exceptions may be thrown
from any of the running specs.
