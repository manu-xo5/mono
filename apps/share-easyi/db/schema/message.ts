import { boolean, integer, json, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth.ts";
import { sql } from "drizzle-orm";

export const message = pgTable("message", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({
    name: "messages_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
    cache: 1,
  }),

  from: text("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  to: text("receiver_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  deleted: boolean("deleted"),

  text: varchar({ length: 512 }).notNull(),
});

export const messagesPaged = pgTable("messagesPaged", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({
    name: "messages_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
    cache: 1,
  }),

  messageIds: integer("message_ids").array().notNull().default(sql`ARRAY[]::text[]`),
  nextCursor: integer("next_cursor"),
})
