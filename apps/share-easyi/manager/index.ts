import type { WSContext } from "hono/ws";
import { messageHandler, pingPongHandler } from "./handler.ts";
import { run, spawn } from "@effection/effection";

export type WS = WSContext<WebSocket>;

export type Manager = {
  clients: Map<string, WS>;
  addClient(ws: WS): void;
};

export function removeClient(m: Manager, clientId: string) {
  const ws = m.clients.get(clientId);
  if (ws != null) {
    ws.close(1006, "Server Closed");
  }
  m.clients.delete(clientId);
}

export function createManager(): Manager {
  const m: Manager = {
    clients: new Map(),

    addClient(ws) {
      const clientId = crypto.randomUUID();
      m.clients.set(clientId, ws);

      // setup pingpong
      run(function* () {
        yield* spawn(() => pingPongHandler(m, clientId));
        yield* spawn(() => messageHandler(m, clientId));
      });
    },
  };

  return m;
}
