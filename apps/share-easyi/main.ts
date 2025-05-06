import { Hono } from "hono";
import { upgradeWebSocket } from "hono/deno";
import { createManager } from "./manager/index.ts";

const app = new Hono();

const manager = createManager();

app.get(
  "/ws",
  upgradeWebSocket(() => {
    return {
      onOpen(_, ws) {
        console.log("hello")
        manager.addClient(ws);
      },
    };
  }),
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

Deno.serve({ port: 1553 }, app.fetch);
