import { DataConnection, MediaConnection, Peer } from "peerjs";
import { filter, fromEvent, tap } from "rxjs";
import { create } from "zustand";
import { makeCall as makeCallImpl } from "./call.js";
import { createPeerId, getDisplayNameFromPeerId } from "../utils.js";

export function isCallAction(data: unknown): data is { type: "call"; action: string } {
  if (!data || typeof data !== "object") return false;
  if (!("action" in data)) return false;
  if (!("type" in data)) return false;
  if (data.type !== "call") return false;

  return true;
}

export type UserStore = {
  peer: Peer | null;
  conn: DataConnection | null;
  call: MediaConnection | null;
  displayName: string;
  callDataConn?: DataConnection | null;
  status: "standby" | "incoming-call" | "outgoing-call" | "on-call" | "call-failed" | "call-rejected";
};

export const useUserStore = create<UserStore>()(() => ({
  peer: null,
  conn: null,
  callDataConn: null,
  call: null,
  displayName: "",
  status: "standby"
}));

let initPromise: Promise<void> | undefined = undefined;
export const initUser = async (peerId: string) => {
  if (initPromise) return initPromise;
  const peer = new Peer(peerId);
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  initPromise = promise;

  // handle maybe loggedin somewhere
  // peer.addListener("close", () => console.log("lund"));

  peer.addListener("open", () => resolve());
  peer.addListener("error", () => reject());
  peer.addListener("disconnected", () => peer.reconnect());
  peer.addListener("call", (call) => call.answer());
  peer.addListener("connection", handleMessage);

  // todo: remove later
  peer.on("connection", (conn) => {
    conn.on("data", (data) => {
      console.log("other's msg:", data);
    });
  });

  await initPromise;
  useUserStore.setState({ displayName: getDisplayNameFromPeerId(peerId), peer });
  initPromise = undefined;
};

export const ensureUser = async (peerId: string) => {
  if (useUserStore.getState().peer != null) return;

  await initUser(peerId);
};

// todo: handle error gracefully
export const answerCall = async () => {
  const { callDataConn } = useUserStore.getState();

  if (callDataConn && callDataConn.open) {
    callDataConn.send({
      type: "call",
      action: "accepted"
    });

    useUserStore.setState({ status: "on-call" });
  } else {
    //todo: show notification to user
  }
};

export const endCall = async () => {
  const { call, callDataConn } = useUserStore.getState();
  if (call) {
    call.close();
  }
  if (callDataConn) {
    callDataConn.send({
      type: "call",
      action: "rejected"
    });

    useUserStore.setState({ status: "standby", callDataConn: null });
  }
};

const handleMessage = (conn: DataConnection) => {
  console.log("opened");
  conn.addListener("close", () => console.log("closed"));

  fromEvent(conn, "data")
    .pipe(
      tap((data) => console.log("data in:", data, "\n")),
      filter(isCallAction),
      tap((action) => {
        useUserStore.setState({ callDataConn: conn });
        if (action.action === "request") {
          useUserStore.setState({
            status: "incoming-call",
            callDataConn: conn
          });
        } else if (action.action === "cancel-request") {
          useUserStore.setState({
            status: "standby"
          });
        }
      })
    )
    .subscribe();
};

export function dispatchCallStatus(status: "standby" | "on-call" | "incoming-call" | "outgoing-call" | "call-failed" | "call-rejected") {
  useUserStore.setState({
    status
  });
}

export const makeCall = (_: unknown, otherPeerId: string) => makeCallImpl(otherPeerId);
