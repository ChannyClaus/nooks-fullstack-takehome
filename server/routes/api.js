const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { sessions, events } = require("../models");

const router = express.Router();

router.get("/sessions/:sessionId", async (req, res) => {
  res.json(await sessions.findById(req.params.sessionId));
});

router.post("/sessions", async (req, res) => {
  await sessions.insertOne({ id: req.body.sessionId, link: req.body.link });
  res.sendStatus(200);
});

router.get("/sessions/:sessionId/events/:eventId", async (req, res) => {
  res.json(await events.findById(req.params.eventId));
});

router.get("/sessions/:sessionId/current", async (req, res) => {
  const sessionEvents = await events.find({ session_id: req.params.sessionId });
  const currentState = {};
  for (const sessionEvent of sessionEvents) {
    if (sessionEvent.type === "progress") {
      console.log("sessionEvent: ", sessionEvent);
      currentState["playedSeconds"] = sessionEvent.data.playedSeconds;
      break;
    }
  }
  for (const sessionEvent of sessionEvents) {
    if (sessionEvent.type === "play") {
      currentState["playing"] = true;
      break;
    } else if (sessionEvent.type === "pause") {
      currentState["playing"] = false;
      break;
    }
  }

  res.json(currentState);
});

router.post("/sessions/:sessionId/events", async (req, res) => {
  await events.insertOne({
    id: uuidv4(),
    session_id: req.body.sessionId,
    type: req.body.type,
    timestamp: req.body.timestamp,
    ...(req.body.data && { data: JSON.stringify(req.body.data) }),
  });
  res.sendStatus(200);
});

module.exports = { router };
