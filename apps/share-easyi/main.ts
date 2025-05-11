import "jsr:@std/dotenv/load";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { upgradeWebSocket } from "hono/deno";
import { createManager } from "./manager/index.ts";
import { auth } from "./auth/index.ts";

const manager = createManager();
const app = new Hono();

app.use(
  cors({
    origin: "http://localhost:3000",
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    credentials: true,
  }),
);

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get(
  "/ws",
  upgradeWebSocket(() => {
    return {
      onOpen(_, ws) {
        console.log("hello");
        manager.addClient(ws);
      },
    };
  }),
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

Deno.serve({ port: 1553 }, app.fetch);
