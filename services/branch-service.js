//* Returns an array of all branches and their associated employees.

/**
 * Generates and returns an array of branches of _branchCount_ length,
 * each containing _branchEmployeeCount_ employees.
 * @param {{branchCount: Number, branchEmployeeCount: Number}} config
 */
function generateBranchData({ branchCount, branchEmployeeCount }) {
  let ownerData = [];

  for (let i = 0; i < branchCount; i++) {
    const owner = { branchId: i + 1, employees: [] };
    for (let j = 0; j < branchEmployeeCount; j++) {
      owner.employees.push({ employeeId: j + 1 });
    }
    ownerData.push(owner);
  }
  return ownerData;
}

module.exports = { generateBranchData };
