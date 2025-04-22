import { DataConnection, MediaConnection, Peer } from "peerjs";
import { Subject } from "rxjs";

import { create } from "zustand";
import { getDisplayNameFromPeerId } from "../utils.js";
import { makeCall as makeCallImpl } from "./call.js";

type Action<Type extends string, Payload extends Record<string, unknown> | undefined> =
  Payload extends undefined ?
    {
      type: Type;
    }
  : {
      type: Type;
      payload: Payload;
    };

export function isCallAction(data: unknown): data is { type: "call"; action: string } {
  if (!data || typeof data !== "object") return false;
  if (!("action" in data)) return false;
  if (!("type" in data)) return false;
  if (data.type !== "call") return false;

  return true;
}
export const makeCall = (_: unknown, otherPeerId: string) => makeCallImpl(otherPeerId);

export type UserStore = {
  status: "standby" | "incoming-call" | "outgoing-call" | "on-call" | "call-failed" | "call-rejected";
  peer: Peer | null;
  displayName: string;
  conns: Map<string, DataConnection>;
  callMediaConn: MediaConnection | null;
  callDataConn: DataConnection | null;
  callTimeout: NodeJS.Timeout;
};

export const useUserStore = create<UserStore>()(() => ({
  status: "standby",
  peer: null,
  displayName: "",
  conns: new Map(),
  callDataConn: null,
  callMediaConn: null,
  callTimeout: 0 as unknown as NodeJS.Timeout
}));

type UserAction =
  | Action<"RECEIVE_CALL", { callDataConn: DataConnection; callTimeout: NodeJS.Timeout }>
  | Action<"ACCEPT_CALL", undefined>
  | Action<"REJECT_CALL", undefined>
  | Action<"MISSED_CALL", { callDataConn: DataConnection }>
  | Action<"MESSAGE_CONN", { conn: DataConnection }>;

export function dispatchUserStore(action: UserAction) {
  // iife make returning possible inside switch case that will be caught in VAR `newState`
  // that then passed to useUserStore.setState(newState)
  const newState = (function reducer(): Partial<UserStore> {
    const state = useUserStore.getState();

    switch (action.type) {
      case "RECEIVE_CALL": {
        return {
          callDataConn: action.payload.callDataConn,
          status: "incoming-call"
        };
      }
      case "MISSED_CALL": {
        const { callDataConn } = action.payload;
        if (callDataConn !== state.callDataConn) {
          console.error(new Error("dispatchUserStore: received MISSED_CALL action for conn that differ from state.callDataConn"));
        }
        callDataConn.close();

        return {
          callDataConn: null,
          status: "standby"
        };
      }

      case "MESSAGE_CONN": {
        const { conn } = action.payload;
        const conns = new Map(state.conns);
        conns.set(conn.peer, conn);

        return {
          conns: conns
        };
      }

      case "ACCEPT_CALL": {
        const { callTimeout, callDataConn } = useUserStore.getState();
        clearTimeout(callTimeout);
        callDataConn?.send("accepted");

        return {
          status: "on-call",
          callTimeout: 0 as unknown as NodeJS.Timeout
        };
      }

      case "REJECT_CALL": {
        const { callTimeout, callDataConn } = useUserStore.getState();
        clearTimeout(callTimeout);
        callDataConn?.send("rejected");
        callDataConn?.close();

        return {
          status: "standby",
          callTimeout: 0 as unknown as NodeJS.Timeout
        };
      }

      default: {
        console.error(new Error(`unknown ActionType '${(action as unknown as { type: string }).type}', expected UserAction`));
        return state;
      }
    }
  })();

  useUserStore.setState(newState);
}

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
  peer.addListener("connection", handleConnection);

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

const handleConnection = (conn: DataConnection) => {
  conn.on("close", () => console.log("closed"));

  if (conn.metadata.type === "call") {
    handleCallDataConn(conn);
  } else {
    handleMessageDataConn(conn);
  }
};

function handleCallDataConn(conn: DataConnection) {
  const state = useUserStore.getState();
  if (state.status === "incoming-call") {
    console.log("incoming-call during existing call", state.status);
    conn.once("open", () => {
      conn.send("rejected");
      conn.close();
    });
  } else {
    conn.once("open", () => {
      const timerId = setTimeout(() => {
        dispatchUserStore({
          type: "MISSED_CALL",
          payload: {
            callDataConn: conn
          }
        });
      }, 2000);

      dispatchUserStore({
        type: "RECEIVE_CALL",
        payload: {
          callDataConn: conn,
          callTimeout: timerId
        }
      });
    });
  }
}

function handleMessageDataConn(conn: DataConnection) {
  console.log("messaging conn added");
  dispatchUserStore({
    type: "MESSAGE_CONN",
    payload: { conn }
  });
}
