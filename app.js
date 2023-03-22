const express = require("express");
const app = express();
const cors = require("cors");

const { Client } = require("pg");

const db = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  port: 5432,
});
db.connect();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8000;

const router = express.Router();

router.get("/sessions/:sessionId", async (req, res) => {
  const response = await db.query(`
    SELECT * FROM sessions
    WHERE id = '${req.params.sessionId}'
  `);
  res.json(response.rows[0]);
});

router.post("/sessions", async (req, res) => {
  await db.query(`
    INSERT INTO sessions (
      id, link
    ) VALUES (
      '${req.body.sessionId}',
      '${req.body.link}'
    )
  `);
  res.sendStatus(200);
});

router.post("/sessions/:sessionId/events/:eventId", async (req, res) => {
  await db.query(`
    INSERT INTO events (
      id, type
    ) VALUES (
      '${req.body.sessionId}',
      '${req.body.link}'
    )
  `);
  res.sendStatus(200);
});

router.get("/watch/:sessionId", (req, res) => {
  res.send("watch session id GET endpoint");
});

router.get("/replay/:sessionId", (req, res) => {
  res.send("watch session id GET endpoint");
});

app.use("/api", router);

app.listen(port, async () => {
  // run database migrations

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
  console.log(`Example app listening on port ${port}`);
});
