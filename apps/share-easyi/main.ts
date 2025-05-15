import "jsr:@std/dotenv/load";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { upgradeWebSocket } from "hono/deno";
import { createManager } from "./manager/index.ts";
import { auth } from "./auth/index.ts";

const manager = createManager();
const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: "http://localhost:3000",
    allowMethods: ["GET", "POST", "OPTIONS", "PATCH", "PUT"],
    credentials: true,
  }),
);

app.get("/api/ping", (c) => {
  console.log("sent");
  return c.text("pong", 200);
});

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get(
  "/ws",
  upgradeWebSocket(() => ({
    onOpen(_, ws) {
      if (ws.raw) {
        manager.addClient(ws.raw);
      }
    },
  })),
  //(c) => {
  //  try {
  //    if (c.req.header("Upgrade") != "websocket") {
  //      return c.text("not a websocket request", 501);
  //    }
  //    const { socket, response } = Deno.upgradeWebSocket(c.req.raw);
  //
  //    console.log(["CONNECTING", "OPEN", "CLOSING", "CLOSED"][socket.readyState]);
  //    if (
  //      !(
  //        socket.readyState === WebSocket.CLOSED ||
  //          socket.readyState === WebSocket.CLOSING
  //      )
  //    ) {
  //      console.log("client added")
  //      manager.addClient(socket);
  //    }
  //
  //    return response;
  //  } catch (err) {
  //    console.log(err);
  //    return c.text("server error", 500);
  //  }
  //}
);
Deno.serve({ port: 1553 }, app.fetch);
