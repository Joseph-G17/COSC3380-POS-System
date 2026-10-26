const { query } = require('../sqlConnecter');

function findAll() {
  return query('SELECT * FROM Items');
}

async function findByID(id) {
  const items = await query('SELECT * FROM Items WHERE ItemID = ?', [id]);
  return items[0];
}

async function create(itemData) {
  const result = await query('INSERT INTO Items SET ?', [itemData]);
  return findByID(result.insertId);
}

async function update(id, itemData) {
  await query('UPDATE Items SET ? WHERE ItemID = ?', [itemData, id]);
  return findByID(id);
}

function remove(id) {
  return query('DELETE FROM Items WHERE ItemID = ?', [id]);
}

module.exports = {
  findAll,
  findByID,
  create,
  update,
  remove
};
