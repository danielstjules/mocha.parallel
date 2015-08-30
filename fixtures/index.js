var path = require('path');

var absolutePaths = {};
var fixtures = ['delay', 'multiple', 'hooks', 'hooksExample',
  'uncaughtException', 'skip', 'failure', 'assertionFailure',
  'parentHooks'];

fixtures.forEach(function(fixture) {
  absolutePaths[fixture] = path.resolve(__dirname, fixture + '.js');
});

module.exports = absolutePaths;
