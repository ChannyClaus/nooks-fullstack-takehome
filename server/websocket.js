const { WebSocketServer } = require("ws");

// maps a session id to the correspoding
// set of websocket connections.
const connectionMap = new Map();

// keeps track of where in the video
// the session is at + whether or not it's currently playing
const sessionStateMap = new Map();

const initWebSocket = function (server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", function connection(ws) {
    ws.on("error", console.error);

    ws.on("message", function message(payload) {
      // TODO: actually pass the `sessionId` (currently null or undefined)
      const { sessionId, type, data } = JSON.parse(decodeURIComponent(payload));

      // update the state
      if (!sessionStateMap.get(sessionId)) {
        sessionStateMap.set(sessionId, { playing: false, position: 0 });
      }
      const updatedState = Object.assign(sessionStateMap.get(sessionId), {});
      console.log("state: ", new Date(), type, updatedState);
      switch (type) {
        case "progress":
          updatedState["position"] = JSON.parse(data).playedSeconds;
          break;
        case "play":
          updatedState["playing"] = true;
          break;
        case "pause":
          updatedState["playing"] = false;
          break;
        default:
          break;
      }
      sessionStateMap.set(sessionId, updatedState);

      // send state for initialization
      if (type === "init") {
        ws.send(JSON.stringify({ type: "init", data: updatedState }));
        return;
      }

      // add the connection to the set
      if (!connectionMap.get(sessionId)) {
        connectionMap.set(sessionId, new Set());
      }
      connectionMap.get(sessionId).add(ws);

      // broadcast the received message to all
      // connections sharing the same session id.
      connectionMap.get(sessionId).forEach((connection) => {
        connection.send(JSON.stringify({ sessionId, type, data }));
      });
    });
  });
};

module.exports = { initWebSocket };
