import { DataConnection, MediaConnection, Peer } from "peerjs";
import { create } from "zustand";
import { assert } from "@workspace/assert";

export type UserStore = {
  peer: Peer | null;
  conn: DataConnection | null;
  call: MediaConnection | null;
  displayName: string;
} & (
  | {
      callDataConn: DataConnection;
      status: "incoming-call" | "outgoing-call" | "on-call";
    }
  | {
      callDataConn: null;
      status: "standby";
    }
);

export const useUserStore = create<UserStore>()(() => ({
  peer: null,
  conn: null,
  callDataConn: null,
  call: null,
  displayName: "",
  status: "standby",
}));

let initPromise: Promise<void> | undefined = undefined;
export const initUser = async (displayName: string) => {
  if (initPromise) return initPromise;
  const peer = new Peer();
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  initPromise = promise;

  peer.addListener("open", () => resolve());
  peer.addListener("error", () => reject());
  peer.addListener("disconnected", () => peer.reconnect());
  peer.addListener("call", (call) => {
    call.addListener("close", () => {
      useUserStore.setState({ call: null });
    });
    useUserStore.setState({ call });
    call.answer();
  });
  peer.addListener("connection", handleMessage);

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

// todo: handle error gracefully
export const makeCall = async (
  avDisplayStream: MediaStream,
  otherPeerId: string,
) => {
  const { peer, status } = useUserStore.getState();
  if (status !== "standby") return;

  assert(!!peer && peer.open, "peer is null");

  const dataConn = peer.connect(otherPeerId);

  const { promise, resolve } = Promise.withResolvers<
    "failed" | "accepted" | "rejected"
  >();

  dataConn.addListener("close", async () => {
    useUserStore.setState({
      call: null,
      callDataConn: null,
      status: "standby",
    });
    resolve("failed");
  });

  function handleCallAnswer(data: unknown) {
    if (
      data &&
      typeof data === "object" &&
      "type" in data &&
      data.type === "call" &&
      "action" in data
    ) {
      if (data.action === "accepted") {
        assert(!!peer && peer.open, "peer is null");
        const call = peer.call(otherPeerId, avDisplayStream);

        useUserStore.setState({
          call,
          status: "outgoing-call",
          callDataConn: dataConn,
        });
        resolve("accepted");
      } else {
        resolve("rejected");
      }
    }
  }
  dataConn.addListener("data", handleCallAnswer);

  dataConn.addListener("open", async () => {
    dataConn.send({
      type: "call",
      action: "request",
    });
    setTimeout(() => {
      dataConn.removeListener("data", handleCallAnswer);
    }, 1000);
  });

  return promise;
};

export const answerCall = async () => {
  const { callDataConn } = useUserStore.getState();

  if (callDataConn && callDataConn.open) {
    callDataConn.send({
      type: "call",
      action: "accepted",
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
      action: "ended",
    });

    useUserStore.setState({ status: "standby", callDataConn: null });
  }
};

const handleMessage = (conn: DataConnection) => {
  console.log("opened");
  conn.addListener("data", (data) => {
    console.log("data", data);

    if (
      data &&
      typeof data === "object" &&
      "type" in data &&
      data.type === "call" &&
      "action" in data
    ) {
      if (data.action === "request") {
        useUserStore.setState({ status: "incoming-call", callDataConn: conn });
      }
    }
  });
};
