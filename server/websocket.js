const { WebSocketServer } = require("ws");

// maps a session id to the correspoding
// set of websocket connections.
const connectionMap = new Map();

const initWebSocket = function (server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", function connection(ws) {
    ws.on("error", console.error);
    ws.on("message", function message(payload) {
      const { sessionId, type, data } = JSON.parse(decodeURIComponent(payload));
      console.log(new Date(), type);

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
