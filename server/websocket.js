const { WebSocketServer } = require("ws");

const initWebSocket = function (server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", function connection(ws) {
    ws.on("error", console.error);

    ws.on("message", function message(data) {
      console.debug("received: %s", data);
    });

    ws.send("something");
  });
};

module.exports = { initWebSocket };
