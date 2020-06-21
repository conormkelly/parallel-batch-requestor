//* Main

const branchService = require('./services/branch-service');
const batchService = require('./services/batch-service');

async function main() {
  const BRANCH_COUNT = 2;
  const EMPLOYEE_COUNT = 10;

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

  console.log('\n********\nRESULTS:\n********');
  console.log(JSON.stringify(results, null, 2));

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

  console.log(
    `Finished after ${durationTimeMs}ms - ${JSON.stringify({
      branches: branchCount,
      employees: employeeCount,
    })} - Mean response time: ${Math.ceil(
      durationTimeMs / (branchCount * employeeCount)
    )}ms per employee`
  );
}

main();
