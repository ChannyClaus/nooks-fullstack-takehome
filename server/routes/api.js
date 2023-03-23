const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { sessions, events } = require("../models");

const router = express.Router();

router.get("/sessions/:sessionId", async (req, res) => {
  res.json(await sessions.findById(req.params.sessionId));
});

router.post("/sessions", async (req, res) => {
  await sessions.insertOne({ id: req.body.sessionId, link: req.body.link });
  res.send(200);
});

router.get("/sessions/:sessionId/events/:eventId", async (req, res) => {
  res.json(await events.findById(req.params.eventId));
});

router.post("/sessions/:sessionId/events", async (req, res) => {
  await events.insertOne({
    id: uuidv4(),
    session_id: req.body.sessionId,
    type: req.body.type,
    timestamp: req.body.timestamp,
    ...(req.body.data && { data: JSON.stringify(req.body.data) }),
  });
  res.send(200);
});

module.exports = { router };
