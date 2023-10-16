import express from "express";
import ViteExpress from "vite-express";
import { WebSocketServer } from "ws";

const PORT = 5174;
const UPDATE_INTERVAL = 1000;

let likeCount = 1;

const app = express();
const httpServer = ViteExpress.listen(app, PORT, () => {
  return console.log(`Server is listening on port ${PORT}...`);
});

let lastUpdateSize;
let lastUpdateLike;
const maybeUpdateClients = function (force) {
  //   if (
  //     !force &&
  //     lastUpdateSize === wsServer.clients.size &&
  //     likeCount === lastUpdateLike
  //   ) {
  //     return;
  //   }

  lastUpdateSize = wsServer.clients.size;
  lastUpdateLike = likeCount;

  const clients = [...wsServer.clients].map((c) => {
    return { name: c.name, avatarId: c.avatarId };
  });

  for (const client of wsServer.clients) {
    client.send(
      JSON.stringify({
        likeCount,
        clients,
      })
    );
  }
};

setInterval(maybeUpdateClients, UPDATE_INTERVAL);

// web sockets
const wsServer = new WebSocketServer({ noServer: true });
wsServer.on("connection", (ws) => {
  ws.avatarId = 0;
  ws.name = "Anonymous";

  maybeUpdateClients(true);

  ws.on("error", console.error);
  ws.on("message", (wsData) => {
    const [type, data] = wsData.toString().split(":");
    // console.log(`type ${type} data ${data}`);

    if (type === "like") {
      likeCount++;
      console.log("liked by ", ws.name);
    } else if (type === "name") {
      //   console.log("setting name to", data);
      ws.name = data;
    } else if (type === "avatar") {
      //   console.log("setting avatar to", data);
      ws.avatarId = data;
    }
  });
});

httpServer.on("upgrade", (req, socket, head) => {
  wsServer.handleUpgrade(req, socket, head, function (ws) {
    wsServer.emit("connection", ws, req);
  });
});
