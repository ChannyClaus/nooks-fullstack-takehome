const { Client } = require("pg");

const db = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  port: 5432,
});
db.connect();

const migration = async () => {
  // `IF NOT EXISTS` was included for better iteration,
  // should be removed if for production.
  await db.query(`
  CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY,
    link TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY,
    session_id UUID,
    type TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);
};

migration();
module.exports = { db };
