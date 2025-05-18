import { router as room } from "./room.ts";
import { router as message } from "./message.ts";
import { hr } from "./_router.ts";

export const router = hr.router({
  room,
  message,
});
