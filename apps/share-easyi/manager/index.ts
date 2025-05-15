import { messageHandler } from "./handler.ts";

export type WS = WebSocket;

export type Manager = {
  clients: Map<string, WS>;
  addClient(ws: WS): void;
  removeClient(clientId: string): void;
};

export function createManager(): Manager {
  const m: Manager = {
    clients: new Map(),
    addClient: addClient,

    removeClient: removeClient,
  };

  function addClient(ws: WS) {
    const clientId = crypto.randomUUID();
    m.clients.set(clientId, ws);

    // attach messageHandler
    messageHandler(m, clientId);
    // setup pingpong
    //run(function* () {
    //  yield* pinger(m, clientId);
    //});
  }

  function removeClient(clientId: string) {
    const ws = m.clients.get(clientId);
    if (ws != null) {
      ws.close(1006, "Server Closed");
    }
    m.clients.delete(clientId);
  }

  return m;
}
