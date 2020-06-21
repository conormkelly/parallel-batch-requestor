const asyncService = require('./async-service');
const httpService = require('./http-service');

// Holds state for the batch processor
let RESPONSE_TIME = { CURRENT_MAX: 0, TARGET: 10000, CUTOFF: 15000 };
let BATCH_SIZE = { CURRENT: 1, STEP: 1 };

async function getClients(branchData) {
  let clientResults = {};

  for (let branch of branchData) {
    clientResults[`branch${branch.branchId}`] = await processBranch(branch);
  }

  return clientResults;
}

async function processBranch(branch) {
  // Make a temp "queue" of employees
  let emps = [...branch.employees];
  const totalEmployees = emps.length;

  let branchResults = [];

  while (emps.length > 0 && emps.length >= BATCH_SIZE.CURRENT) {
    const empBatch = emps.splice(0, BATCH_SIZE.CURRENT);
    const batchResults = await processEmployeeBatch(empBatch);

    for (let batchRes of batchResults) {
      branchResults.push(batchRes);
    }
    console.log(
      `${emps.length}/${totalEmployees} remaining for branch${branch.branchId}...\n`
    );
  }

  return branchResults;
}

async function processEmployeeBatch(employees) {
  const batchResponses = await asyncService.executeParallel({
    fn: getEmployeeClients,
    args: employees,
  });

  setCurrentMaxResponseTime(batchResponses);
  setNextBatchSize();

  return batchResponses;
}

async function getEmployeeClients(employee) {
  const httpResponse = await httpService.get({
    url: `http://localhost:4001/employees/1/clients`,
  });
  const clients = httpResponse.data;
  return {
    employeeId: employee.employeeId,
    clients: clients.data,
    duration: httpResponse.duration,
  };
}

function setCurrentMaxResponseTime(batchResults) {
  const batchTimes = batchResults.map((cr) => cr.duration);

  RESPONSE_TIME.CURRENT_MAX = Math.max(...batchTimes);
  console.log('RESPONSE_TIME.CURRENT_MAX:', RESPONSE_TIME.CURRENT_MAX);
}

function setNextBatchSize() {
  const isBeingUnderUtilized = RESPONSE_TIME.CURRENT_MAX < RESPONSE_TIME.TARGET;
  const isBeingOverloaded = RESPONSE_TIME.CURRENT_MAX >= RESPONSE_TIME.CUTOFF;

  if (isBeingUnderUtilized) {
    if (RESPONSE_TIME.CURRENT_MAX * 2 < RESPONSE_TIME.TARGET) {
      console.log('Batch size: doubling!');
      BATCH_SIZE.CURRENT *= 2;
    } else {
      // Increase by a step
      console.log(`Batch size: +${BATCH_SIZE.STEP}...`);
      BATCH_SIZE.CURRENT += BATCH_SIZE.STEP;
    }
  } else if (isBeingOverloaded) {
    // We're overloading the service, so halve the current batch size or reset to 1
    console.log('Batch size: Overload - halving...');
    BATCH_SIZE.CURRENT = Math.max(1, Math.floor(BATCH_SIZE.CURRENT / 2));
  }

  console.log('Batch size:', BATCH_SIZE.CURRENT);
}

module.exports = { getClients };
