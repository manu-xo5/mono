import { Context } from "hono";
import { db } from "../db/index.ts";
import { roomTable } from "../db/schema/message.ts";
import { eq, or } from "drizzle-orm";
import { hr } from "./_router.ts";
import { user } from "../db/schema/auth.ts";
import { alias } from "drizzle-orm/pg-core";

export const router = hr.router({
  all: hr.query(async (c: Context) => {
    const currentUser = c.get("user");
    if (!currentUser || !currentUser.id) {
      return c.json({ fail: "user_id is required" }, 400);
    }

    const user1Alias = alias(user, "user1");
    const user2Alias = alias(user, "user2");

    const rooms = await db
      .select({
        rooms: roomTable,
        user1: user1Alias,
        user2: user2Alias,
      })
      .from(roomTable)
      .leftJoin(user1Alias, eq(roomTable.user1, user1Alias.id))
      .leftJoin(user2Alias, eq(roomTable.user2, user2Alias.id))
      .where(
        or(
          eq(roomTable.user1, currentUser.id),
          eq(roomTable.user2, currentUser.id),
        ),
      );

    return c.json({
      ok: rooms.map(({ rooms, user1, user2 }) =>
        Object.assign(rooms, {
          user1Data: user1,
          user2Data: user2,
        }),
      ),
    });
  }),
});
