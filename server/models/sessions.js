const { db } = require("../db");

const tableName = "sessions";

const findById = async function (id) {
  const response = await db.query(`
    SELECT * FROM ${tableName}
    WHERE id = ${id}
  `);
  return response.rows[0];
};

const insertOne = async function (record) {
  console.log("insertOne: ", record);
  await db.query(`
    INSERT INTO ${tableName} (${Object.keys(record).toString()})
    VALUES (${Object.values(record)
      .map((v) => `'${v}'`)
      .toString()})
  `);
};

module.exports = { findById, insertOne };
