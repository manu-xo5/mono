import { db } from "../db/index.ts";
import { and, eq, gt, SQL } from "drizzle-orm";
import { messageTable } from "../db/schema/message.ts";
import { hr } from "./_router.ts";

export const router = hr.router({
  byRoomId: hr.query(async (c): Promise<Response> => {
    const roomId = c.req.query("roomId");
    const updatedAt = c.req.query("afterUpdatedAt");

    const filters: SQL[] = [];
    if (updatedAt) {
      filters.push(gt(messageTable.updatedAt, updatedAt));
    }

    if (!roomId) return c.json({ fail: "roomId is required" }, 400);

    const messages = await db.query.messageTable.findMany({
      where: and(eq(messageTable.roomId, roomId ?? ""), ...filters),
    });

    console.log(messages);
    return c.json({ ok: messages });
  }),

  send: hr.mutation(async (c) => {
    const body = await c.req.json();
    if (body.length === 0) return c.json({ ok: [] });
    // TODO: Zod
    const messages = body.map((message) => ({
      id: message.id,
      from: message.from,
      to: message.to,
      roomId: message.roomId,
      type: message.type,
      updatedAt: message.updatedAt,
      body: message.text,
    }));

    await db
      .insert(messageTable)
      .values(messages)
      .returning()
      .onConflictDoNothing();

    return c.json({ ok: messages });
  }),
});
