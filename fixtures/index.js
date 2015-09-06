var path = require('path');

var absolutePaths = {};
var fixtures = ['delay', 'multiple', 'hooks', 'hooksExample',
  'uncaughtException', 'skip', 'only', 'parallelOnly', 'failure', 'assertionFailure',
  'parentHooks', 'sync'];

fixtures.forEach(function(fixture) {
  absolutePaths[fixture] = path.resolve(__dirname, fixture + '.js');
});

module.exports = absolutePaths;
