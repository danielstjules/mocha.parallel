var path = require('path');
var fs   = require('fs');

module.exports = fs.readdirSync(__dirname).reduce(function(res, file) {
  var key = file.replace('.js', '');
  res[key] = path.resolve(__dirname, file);
  return res;
}, {});
