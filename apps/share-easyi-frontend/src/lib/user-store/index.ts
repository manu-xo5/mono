import { DataConnection, MediaConnection, Peer } from "peerjs";
import { filter, fromEvent, map, merge, mergeWith, Subject, takeUntil, tap, timer } from "rxjs";

import { create } from "zustand";
import { getDisplayNameFromPeerId, ofType } from "../utils.js";
import { makeCall as makeCallImpl } from "./call.js";

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

export const handleCallRequest$ = new Subject<string>();

handleCallRequest$.subscribe(callRequestReducer);
function callRequestReducer(action: string) {
  console.log("handleCallRequest");
  const { callDataConn: conn } = useUserStore.getState();

  switch (action) {
    case "accept": {
      conn?.send({
        type: "call",
        action: "accepted"
      });
      break;
    }
    case "reject": {
      useUserStore.setState({
        callDataConn: null,
        status: "standby"
      });

      conn?.send({
        type: "call",
        action: "rejected"
      });

      conn?.close();
      break;
    }
    case "miss": {
      conn?.close();
      console.log("miss call case;");
      useUserStore.setState({
        status: "standby",
        callDataConn: null
      });
      break;
    }
  }
}

const handleMessage = (conn: DataConnection) => {
  fromEvent(conn, "close")
    .pipe(tap(() => console.log("closed")))
    .subscribe();

  const callMessage$ = fromEvent(conn, "data").pipe(
    tap((data) => console.log("data in:", data, "\n")),
    filter(isCallAction),
    map((action) => action.action)
  );

  const cancelRequest$ = callMessage$.pipe(
    ofType("cancel-request"),
    takeUntil(handleCallRequest$),
    tap(() => handleCallRequest$.next("miss"))
  );

  const timeout$ = timer(5_000).pipe(
    takeUntil(handleCallRequest$),
    tap(() => handleCallRequest$.next("miss"))
  );

  const callRequest$ = callMessage$.pipe(
    ofType("request"),
    tap(() => {
      useUserStore.setState({
        status: "incoming-call",
        callDataConn: conn
      });
    }),

    takeUntil(handleCallRequest$.pipe(mergeWith(cancelRequest$, timeout$)))
  );

  callRequest$.subscribe({
    complete: () => {
      console.log("incoming-call-request: settled");
    }
  });
};

export function dispatchCallStatus(status: "standby" | "on-call" | "incoming-call" | "outgoing-call" | "call-failed" | "call-rejected") {
  useUserStore.setState({
    status
  });
}

export const makeCall = (_: unknown, otherPeerId: string) => makeCallImpl(otherPeerId);
