import { SECOND } from "../time.utils.ts";
import { action, race, sleep } from "@effection/effection";
import { Manager } from "./index.ts";
import { safeJsonParse, todo } from "../utils.ts";
import { storeMessage } from "../db/helpers/messsage.ts";

type TextMsgEvent = {
  type: "text";
  body: {
    to: string;
    from: string;
    text: string;
  };
};

type GenericEvent = {
  type: "file" | "call";
  body: object;
};

type EventType = TextMsgEvent | GenericEvent;

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

async function handleTextMessage(msg: TextMsgEvent, userId: string) {
  await storeMessage(msg.body, userId);
}

function handleCallRequest(msg: GenericEvent) {
  void msg;
}

function handleFileTransferReq(msg: GenericEvent) {
  void msg;
}

export function messageHandler(m: Manager, userId: string) {
  const socket = m.clients.get(userId);
  if (socket == null) return;

  const handleMessage = (rawMsg: MessageEvent) => {
    const msg = safeJsonParse<EventType>(String(rawMsg.data));
    if (!msg) return;

    switch (msg.type) {
      case "text":
        msg.type;
        handleTextMessage(msg, userId);
        break;

      case "file":
        handleFileTransferReq(msg);
        break;

      case "call":
        handleCallRequest(msg);
        break;

      default:
        console.error(
          `Unknown event type "${
            String(
              (msg as Record<string, unknown>)?.type,
            )
          }"`,
        );
    }
  };

  socket.onmessage = handleMessage;
}
