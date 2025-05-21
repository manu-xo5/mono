import "jsr:@std/dotenv/load";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createManager } from "./manager/index.ts";
import { auth } from "./auth/index.ts";
import { authMiddleware } from "./auth/middleware.ts";
import { router } from "./api/index.ts";

const manager = createManager();
const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
}>();

app.use(
  "/api/*",
  cors({
    origin: "http://localhost:3000",
    allowMethods: ["GET", "POST", "OPTIONS", "PATCH", "PUT"],
    credentials: true,
  }),
);
app.use("/api/vx/*", authMiddleware());

app.get("/api/ping", (c) => {
  console.log("pong")
  return c.text("pong", 200);
});

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
app.route("/api/vx", router.routes);

app.get("/ws", async (c) => {
  if (c.req.header("Upgrade") != "websocket") {
    return c.text("not a websocket request", 400);
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.text("not authenticated");
  }

  const { socket, response } = Deno.upgradeWebSocket(c.req.raw);
  manager.addClient(session.user.id, socket);

  return response;
});

Deno.serve({ port: Number.parseInt(Deno.env.get("PORT")!) }, app.fetch);
