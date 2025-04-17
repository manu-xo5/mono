import { DataConnection, Peer } from "peerjs";
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
  if (initPromise) return initPromise;
  const prevState = useUserStore.getState();
  if (prevState.peer != null) return;

  const peer = new Peer();
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  initPromise = promise;
  peer.on("open", () => resolve());
  peer.on("error", () => reject());

  await promise;
  await fetch("//localhost:5000", {
    method: "POST",
    body: JSON.stringify({ displayName, peerId: peer.id }),
  });
  useUserStore.setState({
    peer,
    displayName,
  });
};
