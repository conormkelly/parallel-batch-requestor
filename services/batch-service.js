//* Contains main business logic for batch size determination and processing.

const asyncService = require('./async-service');
const httpService = require('./http-service');

// Config
const RESPONSE_TIME_CONSTRAINTS = { TARGET: 12000, CUTOFF: 15000 };
const MAX_PARALLEL_REQUESTS = 50;

// State
let CURRENT_MAX_RESPONSE_TIME = 0;
let EFFECTIVE_BATCH_SIZE = 1;

/**
 * Gets all clients for all employees of all branches.
 */
async function getAllClients(allBranches) {
  let clientResults = {};

  for (let branch of allBranches) {
    clientResults[branch.branchId] = await processBranch(branch);
  }

  return clientResults;
}

/**
 * Get all clients for all employees of a single branch.
 */
async function processBranch(branch) {
  // Make a working "queue" of employees
  let emps = [...branch.employees];

  // Store initial length
  const totalEmps = emps.length;

  let branchResults = [];

  while (emps.length > 0) {
    // Prepare header
    const batchHeader = `Branch ${branch.branchId} - starting batch - [${emps.length}/${totalEmps} remaining]`;

    console.log(batchHeader.toUpperCase());
    console.log('-'.repeat(batchHeader.length));

    console.log('Effective batch size:', EFFECTIVE_BATCH_SIZE);

    // If there are fewer emps left than the effective batch size
    // just process the remainder of emps with the lower working batch size
    let workingBatchSize = Math.min(emps.length, EFFECTIVE_BATCH_SIZE);
    console.log('Working batch size:', workingBatchSize);

    const empBatch = emps.splice(0, workingBatchSize);
    const batchResults = await processEmployeeBatch(empBatch);

    for (let batchRes of batchResults) {
      branchResults.push(batchRes);
    }
  }

  return branchResults;
}

/**
 * Get all clients for this batch of employees.
 */
async function processEmployeeBatch(employees) {
  const batchResponses = await asyncService.executeParallel({
    fn: getEmployeeClients,
    args: employees,
  });

  CURRENT_MAX_RESPONSE_TIME = calculateMaxResponseTime(batchResponses);
  console.log('Max response time (ms):', CURRENT_MAX_RESPONSE_TIME);
  setNextBatchSize(CURRENT_MAX_RESPONSE_TIME);

  return batchResponses;
}

/**
 * Get all clients for a single employee.
*/
async function getEmployeeClients(employee) {
  const httpResponse = await httpService.get({
    url: `http://localhost:4001/employees/${employee.employeeId}/clients`,
  });
  const clients = httpResponse.data;
  return {
    employeeId: employee.employeeId,
    clients: clients.data,
    duration: httpResponse.duration,
  };
}

function calculateMaxResponseTime(batchResults) {
  const responseTimes = batchResults.map((cr) => cr.duration);

  console.log('\nResponse times (ms):', responseTimes, '\n');

  const max = Math.max(...responseTimes);
  return max;
}

function setNextBatchSize(lastBatchMaxResponseTime) {
  const isBeingOverloaded =
    lastBatchMaxResponseTime >= RESPONSE_TIME_CONSTRAINTS.CUTOFF;

  const scalingFactor = isBeingOverloaded
    ? RESPONSE_TIME_CONSTRAINTS.CUTOFF / 2 / lastBatchMaxResponseTime
    : RESPONSE_TIME_CONSTRAINTS.TARGET / lastBatchMaxResponseTime;

  console.log('Scaling factor:', scalingFactor);

  if (isBeingOverloaded) {
    EFFECTIVE_BATCH_SIZE = Math.max(
      1,
      Math.floor(EFFECTIVE_BATCH_SIZE * scalingFactor)
    );
  } else {
    EFFECTIVE_BATCH_SIZE = Math.min(
      MAX_PARALLEL_REQUESTS,
      Math.floor(EFFECTIVE_BATCH_SIZE * scalingFactor)
    );
  }

  console.log('Next effective batch size:', EFFECTIVE_BATCH_SIZE, '\n');
}

module.exports = { getClients: getAllClients };
