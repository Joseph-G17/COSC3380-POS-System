const { withTransaction } = require('../sqlConnecter');

//Moves every employee in oldDept to newDept, then deletes oldDept, all in one transaction.
//Both department rows are locked first (in ID order) so two admins merging at once can't deadlock.
async function mergeDepartment(oldDept, newDept) {
  return withTransaction(async (q) => {
    const rows = await q(
      'SELECT DepartmentID FROM Departments WHERE DepartmentID IN (?, ?) ORDER BY DepartmentID FOR UPDATE',
      [oldDept, newDept]
    );
    if (rows.length !== 2) {
      throw Object.assign(new Error('Department not found'), { status: 404 });
    }

    const moved = await q('UPDATE Employees SET DepartmentID = ? WHERE DepartmentID = ?', [newDept, oldDept]);
    await q('DELETE FROM Departments WHERE DepartmentID = ?', [oldDept]);

    return { employeesMoved: moved.affectedRows };
  });
}

module.exports = { mergeDepartment };
