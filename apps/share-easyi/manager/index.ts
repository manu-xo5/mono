import { messageHandler, pinger } from "./handler.ts";
import { all, run, spawn } from "@effection/effection";

export type WS = WebSocket;

export type Manager = {
  clients: Map<string, WS>;
  addClient(ws: WS): void;
  removeClient(clientId: string): void;
};

export function createManager(): Manager {
  const m: Manager = {
    clients: new Map(),

    addClient(ws) {
      const clientId = crypto.randomUUID();
      m.clients.set(clientId, ws);

      // setup pingpong
      run(function* () {
        const pingerProc = yield* spawn(() => pinger(m, clientId));
        const messageHandlerProc = yield* spawn(() => messageHandler(m, clientId));

        yield* all([pingerProc, messageHandlerProc]);
      });
    },

    removeClient(clientId) {
      const ws = m.clients.get(clientId);
      if (ws != null) {
        ws.close(1006, "Server Closed");
      }
      m.clients.delete(clientId);
    },
  };

  return m;
}
