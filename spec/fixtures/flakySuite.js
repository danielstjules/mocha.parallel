var parallel = require('../../lib/parallel');

let i =0;

function flakySuite(flakyDelay=100){
  parallel('suite', function() {
    it('good', function(done) {
      setTimeout(done, 100);
    });

    it('bad', function(done) {
      setTimeout(function() {
        return done(new Error('Expected error'));
      }, 100);
    });

    it('ugly', function(done) {
      i++;
      //fails half of the time
      if(i%2===1){
        setTimeout(function() {
          return done(new Error('Flaky error'));
        }, flakyDelay);
      }
      else{
        setTimeout(done, 100);      
      }
    });

    // after hook is a simplistic approach to building a reporter for flaky tests.
    // Consider using .getRetriedTestFailures() to build a proper mocha reporter
    after(async () => {
      if(parallel.getRetriedTestFailures().length>0){
        console.log("\n\nFlaky Tests:")
        console.log(
          parallel
            .getRetriedTestFailures()
            .sort(orderBySpecNameThenTestExecutionIndex)
            .map((failedTest) =>
              `- failed ${failedTest.testExecutionIndex + 1} times: ${failedTest.specName}\n${failedTest.err}`
            )
            .join("\n")
        );  
      }
    });
  });
}

function orderBySpecNameThenTestExecutionIndex(a, b) {
  return a.specName == b.specName
    ? compare(a.testExecutionIndex, b.testExecutionIndex)
    : compare(a.specName, b.specName);
}

function compare(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

module.exports = flakySuite;