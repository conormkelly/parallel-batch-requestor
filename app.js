//* Main

const branchService = require('./services/branch-service');
const batchService = require('./services/batch-service');

async function main() {
  const BRANCH_COUNT = 2;
  const EMPLOYEE_COUNT = 50;

  // Generate test data
  const allBranches = branchService.generateBranchData({
    branchCount: BRANCH_COUNT,
    branchEmployeeCount: EMPLOYEE_COUNT,
  });

  // Log the start time
  const startTimeMs = new Date().getTime();

  // Feed all the test data to the processor and wait for results
  const results = await batchService.getClients(allBranches);

  // Log the end time
  const endTimeMs = new Date().getTime();

  // console.log('\n********\nRESULTS:\n********');
  // console.log(JSON.stringify(results, null, 2));

  showStatistics({
    startTimeMs,
    endTimeMs,
    branchCount: BRANCH_COUNT,
    employeeCount: EMPLOYEE_COUNT,
  });
}

/**
 * Helper function to log results.
 */
function showStatistics({
  startTimeMs,
  endTimeMs,
  branchCount,
  employeeCount,
}) {
  const durationTimeMs = endTimeMs - startTimeMs;

  const avgTimePerEmp = Math.ceil(
    durationTimeMs / (branchCount * employeeCount)
  );

  const reportText = `Finished after ${durationTimeMs}ms - ${JSON.stringify({
    branches: branchCount,
    employees: employeeCount,
  })} - Mean response time: ${avgTimePerEmp}ms per employee`;

  console.log('-'.repeat(reportText.length));
  console.log(reportText);

  console.log(
    `\nEstimated time for 20k employees: ${
      (avgTimePerEmp * 20000) / 1000 / 60 / 60
    } hours`
  );

}

main();
