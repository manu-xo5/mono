import { Action, UserStore } from "@/store/index.js";
import type { DataConnection, MediaConnection } from "peerjs";
import type { StateCreator } from "zustand";

export type CallAction =
  | Action<"RECEIVE_CALL", { callDataConn: DataConnection }>
  | Action<"ACCEPT_CALL", undefined>
  | Action<"REJECT_CALL", undefined>
  | Action<"MISSED_CALL", { callDataConn: DataConnection }>
  | Action<"MESSAGE_CONN", { conn: DataConnection }>;

export type CallSlice = {
  status: "standby" | "incoming-call" | "outgoing-call" | "call-failed" | "on-call";
  dataConn: DataConnection | null;
  mediaConn: MediaConnection | null;
  timeout: number;
};

export const createCallSlice: StateCreator<UserStore, [], [], CallSlice> = () => ({
  mediaConn: null,
  dataConn: null,
  status: "standby",
  timeout: 0
});

export { dispatchCallAction } from "./dispatcher.js";

export { handleCallDataConn } from "./module.js";
