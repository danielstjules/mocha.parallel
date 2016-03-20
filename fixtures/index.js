var path = require('path');

var absolutePaths = {};
var fixtures = ['delay', 'multiple', 'hooks', 'hooksExample',
  'uncaughtException', 'parallelSkip', 'skip', 'only', 'parallelOnly',
  'failure', 'assertionFailure', 'parentHooks', 'sync', 'contextSkip',
  'contextTimeout', 'disable'];

fixtures.forEach(function(fixture) {
  absolutePaths[fixture] = path.resolve(__dirname, fixture + '.js');
});

module.exports = absolutePaths;
