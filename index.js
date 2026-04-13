const http = require("http");
const app = require("./src/config/express.config");

const httpServer = http.createServer(app);

const port = process.env.PORT || 9005;
httpServer.listen(port, (err) => {
  if (!err) {
    console.log("Server is running on port ", port);
    console.log("Press Ctrl + C to disconnect");
  }
});
httpServer.on("error", (err) => {});
