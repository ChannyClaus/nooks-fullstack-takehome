const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const api = require("./routes/api");

const port = process.env.PORT || 8000;
const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

app.use("/api", api.router);

server.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = { server };
