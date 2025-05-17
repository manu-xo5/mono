import {
  boolean,
  index,
  pgTable,
  serial,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth.ts";
import { relations } from "drizzle-orm";

export const messageTable = pgTable(
  "message",
  {
    id: serial("id").primaryKey(),
    roomId: text("room_id")
      .notNull()
      .references(() => roomTable.roomId),

    type: text("type", { enum: ["text"] }).notNull(),

    from: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "no action" }),

    to: text("receiver_id")
      .notNull()
      .references(() => user.id, { onDelete: "no action" }),

    body: varchar({ length: 512 }).notNull(),
    deleted: boolean("deleted"),
  },
  (t) => [index().on(t.id)],
);

export const messageRelations = relations(messageTable, ({ one }) => ({
  room: one(roomTable, {
    fields: [messageTable.roomId],
    references: [roomTable.roomId],
  }),
}));

export const roomTable = pgTable(
  "rooms",
  {
    roomId: text("room_id").primaryKey(),
    user1: text().references(() => user.id),
    user2: text().references(() => user.id)
  },
  (table) => [index().on(table.roomId)],
);

export const roomRelations = relations(roomTable, ({ many }) => ({
  messages: many(messageTable),
}));
