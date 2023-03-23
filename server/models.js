const { db } = require("./db");

class Model {
  constructor(tableName) {
    this.tableName = tableName;
  }

  findById = async function (id) {
    const response = await db.query(`
    SELECT * FROM ${this.tableName}
    WHERE id = '${id}'
  `);
    return response.rows[0];
  };

  find = async function (filter) {
    const response = await db.query(`
    SELECT * FROM ${this.tableName} WHERE
    ${Object.entries(filter)
      .map(([k, v]) => `${k}='${v}'`)
      .toString()}
    ORDER BY created_at DESC
  `);
    return response.rows;
  };

  insertOne = async function (record) {
    await db.query(`
    INSERT INTO ${this.tableName} (${Object.keys(record).toString()})
    VALUES (${Object.values(record)
      .map((v) => `'${v}'`)
      .toString()})
  `);
  };
}

const sessions = new Model("sessions");
const events = new Model("events");
module.exports = { sessions, events };
