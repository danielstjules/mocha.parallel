var parallel = require('../../lib/parallel');
var Promise = require('bluebird');
//Based on issue #13

parallel("suite", function () {
    var its = ["test1", "test2"]
    its.forEach(function (name) {
        it(name, function () {
            return new Promise(function (resolve) {
                setTimeout(resolve, 2500)
            })
        })
    })
});