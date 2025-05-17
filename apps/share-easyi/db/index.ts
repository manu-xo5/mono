import { drizzle } from "drizzle-orm/neon-http";
import { messageTable, roomRelations, roomTable } from "./schema/message.ts";

export const db = drizzle(Deno.env.get("DATABASE_URL")!, {
  schema: {
    messageTable,
    roomTable,
    roomRelations,
  },
});
