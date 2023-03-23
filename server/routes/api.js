const express = require("express");
const { sessions } = require("../models/sessions");

const router = express.Router();

router.get("/sessions/:sessionId", async (req, res) => {
  res.json(await sessions.findById(req.params.sessionId));
});

router.post("/sessions/", async (req, res) => {
  await sessions.insertOne({ id: req.body.sessionId, link: req.body.link });
  res.send(200);
});

router.get("/sessions/:sessionId", (req, res) => {
  res.send(200);
});

router.get("/sessions/:sessionId", (req, res) => {
  res.send(200);
});

module.exports = { router };
