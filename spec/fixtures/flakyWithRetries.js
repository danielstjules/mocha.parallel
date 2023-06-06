var parallel = require('../../lib/parallel');
const flakySuite = require('./flakySuite');

parallel.maxRetries(2);
flakySuite();