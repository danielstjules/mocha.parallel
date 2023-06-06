var parallel = require('../../lib/parallel');
const flakySuite = require('./flakySuite');

parallel.maxRetries(2);
parallel.retryTimeoutInMiliseconds(500);
flakySuite(1000);