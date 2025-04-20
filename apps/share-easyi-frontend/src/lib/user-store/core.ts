import { assert } from "@workspace/assert";
import { useUserStore } from "./index.js";
import { DataConnection } from "peerjs";
import { getScreenCaptureStream } from "../utils.js";

type CreateDataConnArg = {
  otherPeerId: string;
  signal: AbortSignal;
};

export const createDataConn = async ({
  otherPeerId,
  signal,
}: CreateDataConnArg) => {
  const { peer } = useUserStore.getState();
  assert(peer != null, "TODO: Peer is null");

  const conn = peer.connect(otherPeerId);
  const { promise, reject, resolve } = Promise.withResolvers<void>();

  const handleResolve = () => resolve();
  const handleReject = () => reject();

  conn.on("open", handleResolve);
  conn.on("error", handleReject);
  conn.on("close", handleReject);
  signal.addEventListener("abort", handleReject);

  const id = setTimeout(() => reject(), 2000);

  await promise.finally(() => {
    signal.removeEventListener("abort", handleReject);
    conn.off("error", handleReject);
    conn.off("close", handleReject);

    clearTimeout(id);
  });

  return conn;
};

type WaitForCallReplyArg = {
  conn: DataConnection | null;
  signal: AbortSignal;
};

export const waitForCallReply = async ({
  conn,
  signal,
}: WaitForCallReplyArg) => {
  assert(conn != null && conn.open, "Peer not connected");

  const { promise, resolve, reject } = Promise.withResolvers<string>();

  const handleError = () => reject();
  const handleData = (data: unknown) => {
    if (!isCallAction(data)) return;
    if (!["accepted", "rejected"].includes(data.action)) return;

    resolve(data.action);
  };

  const handleCancel = () => {
    if (conn.open) {
      conn.send({ type: "call", action: "cancel-request" });
      resolve("cancelled");
    }
  };

  conn.once("error", handleError);
  conn.on("data", handleData);
  signal.addEventListener("abort", handleCancel);

  conn.send({
    type: "call",
    action: "request",
  });

  return await promise.finally(() => {
    conn?.off("error", handleError);
    conn?.off("data", handleData);
    signal.removeEventListener("abort", handleError);
  });
};

export const createMediaConn = async (otherPeerId: string) => {
  const { peer } = useUserStore.getState();
  assert(peer != null && peer.open, "You are offline");

  const mediaStream = await getScreenCaptureStream();
  assert(mediaStream != null, "Could not detect Microphone");

  const call = peer.call(otherPeerId, mediaStream);

  return call;
};

function isCallAction(data: unknown): data is { type: "call"; action: string } {
  if (!data || typeof data !== "object") return false;
  if (!("action" in data)) return false;
  if (!("type" in data)) return false;
  if (data.type !== "call") return false;

  return true;
}
