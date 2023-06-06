var parallel = require('../../lib/parallel');
const flakySuite = require('./flakySuite');

parallel.maxRetries(2);
parallel.retryTimeoutInMiliseconds(5000);
flakySuite(3000);