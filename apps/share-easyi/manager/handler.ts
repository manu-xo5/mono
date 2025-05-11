import { SECOND } from "../time.utils.ts";
import { action, once, race, sleep } from "@effection/effection";
import { Manager } from "./index.ts";
import { safeJsonParse } from "../utils.ts";

type EventType = {
  type: string;
  body: object;
};

function listenPong(ws: WebSocket) {
  const op = action<MessageEvent>((k) => {
    const handle = (msg: MessageEvent) => {
      if (String(msg.data) === "pong") {
        k(msg);
      }
    };

    ws.addEventListener("message", handle);
    return () => ws.removeEventListener("message", handle);
  });

  return op;
}

export function* pingPongHandler(m: Manager, clientId: string) {
  const PONG_INTERVAL = 5 * SECOND;
  const PING_INTERVAL = PONG_INTERVAL * 0.9;

  while (true) {
    yield* sleep(PONG_INTERVAL);

    const ws = m.clients.get(clientId);
    if (ws == null) return;

    if (ws.raw == null) {
      ws.close(1006, "Killed");
      return;
    }

    // setup handler before send"ping"
    const waitForMessage = listenPong(ws.raw);
    ws.send("ping");
    const msg = yield* race([waitForMessage, sleep(PING_INTERVAL)]);

    if (msg == null) {
      m.removeClient(clientId);
      break;
    }
  }
}

function handleCallRequest(msg: EventType) {
  void msg;
}

function handleFileTransferReq(msg: EventType) {
  void msg;
}

export function* messageHandler(m: Manager, clientId: string) {
  const ws_ = m.clients.get(clientId);
  if (ws_?.raw == null) return;
  const ws = ws_.raw;

  const handleMessage = (rawMsg: MessageEvent) => {
    const msg = safeJsonParse<EventType>(String(rawMsg));
    if (!msg) return;

    switch (msg.type) {
      case "file":
        handleFileTransferReq(msg);
        break;

      case "call":
        handleCallRequest(msg);
        break;

      default:
        console.log(`Unknown event type "${msg.type}"`);
    }
  };

  try {
    ws.addEventListener("message", handleMessage);
    yield* race([once(ws, "close"), once(ws, "error")]);
  } finally {
    ws.removeEventListener("message", handleMessage);
  }
}
