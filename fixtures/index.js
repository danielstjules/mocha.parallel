var path = require('path');

var absolutePaths = {};
var fixtures = ['delay', 'multiple', 'hooks', 'hooksSimple',
  'uncaughtException'];

fixtures.forEach(function(fixture) {
  absolutePaths[fixture] = path.resolve(__dirname, fixture + '.js');
});

module.exports = absolutePaths;
