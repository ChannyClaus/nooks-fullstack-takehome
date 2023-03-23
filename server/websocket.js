const { WebSocketServer } = require("ws");
const { sessions } = require("./models");

// maps a session id to the correspoding
// set of websocket connections.
const connectionMap = new Map();

// maps a session Id to its state
const sessionState = new Map();

// update the state for the given session and
// returns the updated state.
const updateState = function (sessionId, type) {
  if (!sessionState.get(sessionId)) {
    sessionState.set(sessionId, {});
  }
  const currentState = sessionState.get(sessionId);
  // clone the state for update
  // https://stackoverflow.com/a/30042948
  const updatedState = Object.assign({}, currentState);
  switch (type) {
    case "play":
      updatedState["playing"] = true;
      sessionState.set(sessionId, updatedState);
      break;
    case "pause":
      updatedState["playing"] = false;
      sessionState.set(sessionId, updatedState);
      break;
    default:
      break;
  }

  return updatedState;
};

const initWebSocket = function (server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", function connection(ws) {
    ws.on("error", console.error);
    ws.on("message", function message(data) {
      const { sessionId, type } = JSON.parse(decodeURIComponent(data));

      // add the connection to the set
      if (!connectionMap.get(sessionId)) {
        connectionMap.set(sessionId, new Set());
      }
      connectionMap.get(sessionId).add(ws);

      const state = updateState(sessionId, type);
      connectionMap.get(sessionId).forEach((connection) => {
        connection.send(JSON.stringify(state));
      });
    });
  });
};

module.exports = { initWebSocket };
