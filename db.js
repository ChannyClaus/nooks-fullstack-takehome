const { Client } = require("pg");

const db = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  port: 5432,
});
db.connect();
