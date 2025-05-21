var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// main.ts
import "jsr:@std/dotenv/load";
import { Hono as Hono2 } from "hono";
import { cors } from "hono/cors";

// time.utils.ts
var SECOND = 1e3;
var MINUTE = 60 * SECOND;

// manager/handler.ts
import { action, race, sleep } from "@effection/effection";

// utils.ts
function safeJsonParse(input) {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}
async function tryCatch(promise) {
  try {
    const value = await promise;
    return [null, value];
  } catch (error) {
    console.error(error);
    return [error, null];
  }
}

// db/index.ts
import { drizzle } from "drizzle-orm/neon-http";

// db/schema/message.ts
import {
  boolean as boolean2,
  index,
  pgTable as pgTable2,
  text as text2,
  timestamp as timestamp2,
  varchar
} from "drizzle-orm/pg-core";

// db/schema/auth.ts
var auth_exports = {};
__export(auth_exports, {
  account: () => account,
  session: () => session,
  user: () => user,
  verification: () => verification
});
import {
  boolean,
  pgTable,
  text,
  timestamp
} from "drizzle-orm/pg-core";
var user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});
var session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })
});
var account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});
var verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at")
});

// db/schema/message.ts
import { relations } from "drizzle-orm";
var messageTable = pgTable2(
  "message",
  {
    id: text2("id").primaryKey(),
    roomId: text2("room_id").notNull().references(() => roomTable.roomId),
    type: text2("type", { enum: ["text"] }).notNull(),
    from: text2("sender_id").notNull().references(() => user.id, { onDelete: "no action" }),
    to: text2("receiver_id").notNull().references(() => user.id, { onDelete: "no action" }),
    body: varchar({ length: 512 }).notNull(),
    deleted: boolean2("deleted"),
    updatedAt: timestamp2("updated_at", { mode: "string" }).defaultNow().notNull()
  },
  (t) => [index().on(t.id)]
);
var messageRelations = relations(messageTable, ({ one }) => ({
  room: one(roomTable, {
    fields: [messageTable.roomId],
    references: [roomTable.roomId]
  })
}));
var roomTable = pgTable2(
  "rooms",
  {
    roomId: text2("room_id").primaryKey(),
    user1: text2().references(() => user.id),
    user2: text2().references(() => user.id)
  },
  (table) => [index().on(table.roomId)]
);
var roomRelations = relations(roomTable, ({ many }) => ({
  messages: many(messageTable)
}));

// db/index.ts
var db = drizzle(Deno.env.get("DATABASE_URL"), {
  schema: {
    messageTable,
    roomTable,
    roomRelations
  }
});

// db/helpers/messsage.ts
async function storeMessage(roomId, values) {
  await db.insert(roomTable).values({
    roomId,
    user1: values.from,
    user2: values.to
  }).onConflictDoNothing();
  const [message] = await db.insert(messageTable).values({
    id: values.id,
    from: values.from,
    roomId,
    to: values.to,
    type: values.type,
    body: values.body,
    updatedAt: values.updatedAt
  }).returning();
  console.log({ message });
  return message;
}

// manager/handler.ts
function createRoomId(user1, user2) {
  return [user1, user2].sort().join("-");
}
async function handleTextMessage(m, userId, event) {
  await new Promise((res) => setTimeout(res, 5 * 1e3));
  const body = event.body;
  const roomId = createRoomId(body.from, body.to);
  console.log({ roomId });
  const otherUserSocket = m.clients.get(body.to);
  otherUserSocket?.send(
    JSON.stringify({
      type: "message-receive",
      roomId,
      body: {
        id: event.id,
        type: "text",
        from: body.from,
        to: body.to,
        body: body.text,
        updatedAt: body.updatedAt
      }
    })
  );
  const [error, message] = await tryCatch(
    storeMessage(roomId, {
      id: event.id,
      type: "text",
      from: body.from,
      to: body.to,
      body: body.text,
      updatedAt: body.updatedAt
    })
  );
  const socket = m.clients.get(userId);
  if (!socket) return;
  if (error) {
    socket.send(
      JSON.stringify({
        type: "message-delivery",
        status: "fail",
        body: {
          id: event.id,
          error: String(error)
        }
      })
    );
    return;
  }
  socket.send(
    JSON.stringify({
      type: "message-delivery",
      status: "ok",
      body: message
    })
  );
}
function handleCallRequest(msg) {
  void msg;
}
function handleFileTransferReq(msg) {
  void msg;
}
function messageHandler(m, userId) {
  const socket = m.clients.get(userId);
  if (socket == null) return;
  const handleMessage = (rawMsg) => {
    const msg = safeJsonParse(String(rawMsg.data));
    if (!msg) return;
    switch (msg.type) {
      case "text":
        handleTextMessage(m, userId, msg);
        break;
      case "file":
        handleFileTransferReq(msg);
        break;
      case "call":
        handleCallRequest(msg);
        break;
      default:
        console.error(
          `Unknown event type "${String(
            msg?.type
          )}"`
        );
    }
  };
  socket.onmessage = handleMessage;
}

// manager/index.ts
function createManager() {
  const m = {
    clients: /* @__PURE__ */ new Map(),
    addClient,
    removeClient
  };
  function addClient(userId, ws) {
    m.clients.set(userId, ws);
    messageHandler(m, userId);
  }
  function removeClient(clientId) {
    const ws = m.clients.get(clientId);
    if (ws != null) {
      ws.close(1006, "Server Closed");
    }
    m.clients.delete(clientId);
  }
  return m;
}

// auth/index.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
var auth = betterAuth({
  emailAndPassword: { enabled: false },
  trustedOrigins: ["http://localhost:3000"],
  socialProviders: {
    google: {
      clientId: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
      clientSecret: Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "",
      redirectURI: "http://localhost:1553/api/auth/callback/google"
    }
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: auth_exports
  })
});

// auth/middleware.ts
function authMiddleware() {
  return async (c, next) => {
    if (c.req.method.toLowerCase() == "options") {
      console.log(c.req.path);
      await next();
    }
    const session2 = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session2) {
      return c.json({}, 403);
    }
    c.set("user", session2.user);
    c.set("session", session2.session);
    return next();
  };
}

// api/room.ts
import { eq, or } from "drizzle-orm";

// api/_router.ts
import { Hono } from "hono";
function query(fn) {
  return {
    _type: "handler",
    method: "GET",
    handler: fn
  };
}
function mutation(fn) {
  return {
    _type: "handler",
    method: "POST",
    handler: fn
  };
}
function router(procedures) {
  const app2 = new Hono();
  for (const [path, proc] of Object.entries(procedures)) {
    if (proc._type == "handler") {
      if (proc.method == "GET") {
        app2.get("/" + path, proc.handler);
      } else if (proc.method == "POST") {
        app2.post("/" + path, proc.handler);
      }
    } else if (proc._type == "router") {
      app2.route("/" + path, proc.routes);
    }
  }
  return {
    _type: "router",
    routes: app2
  };
}
var example = router({
  helloworld: query((c) => {
    return c.text("hello world");
  }),
  ping: mutation(async (c) => {
    console.log(await c.req.json());
    return c.text("updated");
  }),
  v2: router({
    helloworld: query((c) => c.text("v2: hello world")),
    ping: query((c) => c.text("pong"))
  })
});
console.dir(example.routes.routes, { depth: null });
var hr = {
  router,
  query,
  mutation
};

// api/room.ts
var router2 = hr.router({
  all: hr.query(async (c) => {
    const user2 = c.get("user");
    if (!user2 || !user2.id) return c.json({ fail: "user_id is required" }, 400);
    const rooms = await db.query.roomTable.findMany({
      where: or(eq(roomTable.user1, user2.id), eq(roomTable.user2, user2.id))
    });
    return c.json({ ok: rooms });
  })
});

// api/message.ts
import { and, eq as eq2, gt } from "drizzle-orm";
var router3 = hr.router({
  byRoomId: hr.query(async (c) => {
    const roomId = c.req.query("roomId");
    const updatedAt = c.req.query("afterUpdatedAt");
    const filters = [];
    if (updatedAt) {
      filters.push(gt(messageTable.updatedAt, updatedAt));
    }
    if (!roomId) return c.json({ fail: "roomId is required" }, 400);
    const messages = await db.query.messageTable.findMany({
      where: and(eq2(messageTable.roomId, roomId ?? ""), ...filters)
    });
    console.log(messages);
    return c.json({ ok: messages });
  })
});

// api/index.ts
var router4 = hr.router({
  room: router2,
  message: router3
});

// main.ts
var manager = createManager();
var app = new Hono2();
app.use(
  "/api/*",
  cors({
    origin: "http://localhost:3000",
    allowMethods: ["GET", "POST", "OPTIONS", "PATCH", "PUT"],
    credentials: true
  })
);
app.use("/api/vx/*", authMiddleware());
app.get("/api/ping", (c) => c.text("pong", 200));
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
app.route("/api/vx", router4.routes);
app.get("/ws", async (c) => {
  if (c.req.header("Upgrade") != "websocket") {
    return c.text("not a websocket request", 400);
  }
  const session2 = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session2) {
    return c.text("not authenticated");
  }
  const { socket, response } = Deno.upgradeWebSocket(c.req.raw);
  manager.addClient(session2.user.id, socket);
  return response;
});
Deno.serve({ port: Number.parseInt(Deno.env.get("PORT")) }, app.fetch);
