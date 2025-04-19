import { assert } from "@workspace/assert";
import { useUserStore } from "./index.js";
import { DataConnection } from "peerjs";
import { getScreenCaptureStream } from "../utils.js";

export const createDataConn = async (otherPeerId: string) => {
  const { peer } = useUserStore.getState();
  assert(peer != null, "TODO: Peer is null");

  const conn = peer.connect(otherPeerId);
  const { promise, reject, resolve } = Promise.withResolvers<void>();

  conn.on("open", () => resolve());
  conn.on("error", () => reject());
  conn.on("close", () => reject());

  await promise;
  return conn;
};

type WaitForCallReplyArg = {
  dataConn: DataConnection | null;
  callback(event: { type: string }): void;
  signal: AbortSignal;
};

export const waitForCallReply = ({
  dataConn,
  callback,
  signal,
}: WaitForCallReplyArg) => {
  if (!dataConn || !dataConn.open) {
    callback({ type: "error" });
    return;
  }

  function handleError() {
    callback({ type: "error" });
  }

  function cleanup() {
    dataConn?.off("error", handleError);
    dataConn?.off("data", handleData);
  }

  function handleData(data: unknown) {
    if (!data || typeof data !== "object") return;
    if (!("type" in data)) return;
    if (!("action" in data)) return;

    if (data.type === "call") {
      if (data.action === "accepted") {
        callback({ type: "accepted" });
      } else if (data.action === "rejected") {
        callback({ type: "rejected" });
      }
    }
  }

  dataConn.on("error", handleError);
  dataConn.on("data", handleData);

  dataConn.send({
    type: "call",
    action: "request",
  });

  signal.addEventListener("abort", () => {
    dataConn.send({
      type: "call",
      action: "cancel-request",
    });

    cleanup();
  });

  return cleanup;
};

export const createMediaConn = async (otherPeerId: string) => {
  const { peer } = useUserStore.getState();
  assert(peer != null && peer.open, "You are offline");

  const mediaStream = await getScreenCaptureStream();
  assert(mediaStream != null, "Could not detect Microphone");

  const call = peer.call(otherPeerId, mediaStream);

  return call;
};
