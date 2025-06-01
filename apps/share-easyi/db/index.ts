import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { messageTable, roomRelations, roomTable } from "./schema/message.ts";

const isDev = Deno.env.get("NODE_ENV") === "development";
export const db = isDev
  ? drizzlePg(Deno.env.get("DATABASE_URL")!, {
      schema: {
        messageTable,
        roomTable,
        roomRelations,
      },
    })
  : drizzleNeon(Deno.env.get("DATABASE_URL")!, {
      schema: {
        messageTable,
        roomTable,
        roomRelations,
      },
    });
