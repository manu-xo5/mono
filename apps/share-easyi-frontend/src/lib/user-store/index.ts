import { DataConnection, Peer } from "peerjs";
import { useState } from "react";
import { create } from "zustand";

export type UserStore = {
  peer: Peer | null;
  conn: DataConnection | null;
  displayName: string;
};

export const useUserStore = create<UserStore>()(() => ({
  peer: null,
  conn: null,
  displayName: "",
}));

let initPromise: Promise<void> | undefined = undefined;
export const initUser = async (displayName: string) => {
  const peer = new Peer();
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  initPromise = promise;

  peer.addListener("open", () => resolve());
  peer.addListener("error", () => reject());
  peer.addListener("disconnected", () => peer.reconnect());

  // todo: remove later
  peer.on("connection", (conn) => {
    conn.on("data", (data) => {
      console.log("other's msg:", data);
    });
  });

  await initPromise;
  useUserStore.setState({ displayName, peer });
  initPromise = undefined;
};

export const ensureUser = async (displayName: string) => {
  if (useUserStore.getState().peer != null) return;

  await initUser(displayName);
};

//let ensurePeerOpenPromise: Promise<void> | undefined = undefined;
//export const ensurePeerOpen = async () => {
//  if (ensurePeerOpenPromise) return ensurePeerOpenPromise;
//
//  ensurePeerOpenPromise = undefined;
//};
