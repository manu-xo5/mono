import { pgTimestamp, SECOND } from "../time.utils.ts";
import { action, race, sleep } from "@effection/effection";
import { Manager } from "./index.ts";
import { safeJsonParse, tryCatch } from "../utils.ts";
import { storeMessage } from "../db/helpers/messsage.ts";

type TextMsgEvent = {
  id: string;
  type: "text";
  body: {
    updatedAt: string;
    to: string;
    from: string;
    text: string;
  };
};

type GenericEvent = {
  id: string;
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

function createRoomId(user1: string, user2: string) {
  return [user1, user2].sort().join("-");
}

async function handleTextMessage(
  m: Manager,
  userId: string,
  event: TextMsgEvent,
) {
  await new Promise((res) => setTimeout(res, 5 * 1000));
  const body = event.body;

  const roomId = createRoomId(body.from, body.to);
  console.log({ roomId });
  // zod validation
  const otherUserSocket = m.clients.get(body.to);

  otherUserSocket?.send(
    JSON.stringify({
      type: "message-receive",
      roomId: roomId,
      body: {
        id: event.id,
        type: "text",
        from: body.from,
        to: body.to,
        body: body.text,
        updatedAt: body.updatedAt,
      },
    }),
  );

  const [error, message] = await tryCatch(
    storeMessage(roomId, {
      id: event.id,
      type: "text",
      from: body.from,
      to: body.to,
      body: body.text,
      updatedAt: body.updatedAt,
    }),
  );

  const socket = m.clients.get(userId);
  if (!socket) return;

  if (error) {
    socket.send(
      JSON.stringify({
        type: "message-delivery",
        status: "fail",
        body: {
          id: event.id,
          error: String(error),
        },
      }),
    );
    return;
  }

  socket.send(
    JSON.stringify({
      type: "message-delivery",
      status: "ok",
      body: message,
    }),
  );
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
        handleTextMessage(m, userId, msg);
        break;

      case "file":
        handleFileTransferReq(msg);
        break;

      case "call":
        handleCallRequest(msg);
        break;

      default:
        console.error(
          `Unknown event type "${String(
            (msg as Record<string, unknown>)?.type,
          )}"`,
        );
    }
  };

  socket.onmessage = handleMessage;
}
