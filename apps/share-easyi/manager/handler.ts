import { SECOND } from "../time.utils.ts";
import { action, race, sleep, suspend } from "@effection/effection";
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

export function* pinger(m: Manager, clientId: string) {
  const PONG_INTERVAL = 2 * SECOND;
  const PING_INTERVAL = PONG_INTERVAL * 0.9;

  const socket = m.clients.get(clientId);

  if (socket == null) {
    return;
  }

  try {
    console.log("started ping pong");
    while (true) {
      yield* sleep(PONG_INTERVAL);

      // setup handler before send"ping"
      const waitForMessage = listenPong(socket);
      socket.send("ping");
      const msg = yield* race([waitForMessage, sleep(PING_INTERVAL)]);

      if (msg == null) {
        m.removeClient(clientId);
        break;
      }
    }
  } finally {
    console.log("stopping ping pong");
  }
}

function handleCallRequest(msg: EventType) {
  void msg;
}

function handleFileTransferReq(msg: EventType) {
  void msg;
}

export function messageHandler(m: Manager, clientId: string) {
  const socket = m.clients.get(clientId);
  if (socket == null) return;

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
    socket.addEventListener("message", handleMessage);
  } finally {
    socket.removeEventListener("message", handleMessage);
  }
}
