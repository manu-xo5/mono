import { create } from "zustand";
import { Peer, DataConnection, MediaConnection } from "peerjs";
import { assign, createMachine, fromPromise, setup, spawnChild } from "xstate";
import { useUserStore } from "./index.js";
import { assert } from "@workspace/assert";

type UserCall = {
  status: string;
  dataConn: DataConnection | null;
  mediaConn: MediaConnection | null;
  stream: MediaStream | null;
};

type Events = { type: "makeCall"; otherPeerId: string };

export const useUserCall = create<UserCall>()(() => ({
  status: "Standby",
  dataConn: null,
  mediaConn: null,
  stream: null,
}));

const createDataConn = fromPromise(
  async ({ input }: { input: { otherPeerId: string } }) => {
    console.log("createDataConn", input.otherPeerId);
    return new Promise((res) => setTimeout(res, 500));
    //const { peer } = useUserStore.getState();
    //assert(peer != null, "TODO: Peer is null");
    //
    //const conn = peer.connect(input.otherPeerId);
    //const { promise, reject, resolve } = Promise.withResolvers<void>();
    //
    //conn.on("open", () => resolve());
    //conn.on("error", () => reject());
    //conn.on("close", () => reject());
    //
    //await promise;
    //return conn;
  },
);

export const callMachine = setup({
  types: {
    context: {} as UserCall,
    events: {} as Events,
  },
  actors: { createDataConn },
}).createMachine({
  context: {
    dataConn: null,
    mediaConn: null,
    stream: null,
  } as UserCall,
  initial: "STANDBY",
  states: {
    STANDBY: {
      on: {
        makeCall: {
          actions: ({ event }) =>
            spawnChild(createDataConn, {
              input: { otherPeerId: event.otherPeerId },
            }),
        },
      },
    },
  },
});

/*
 *  id: "(call_machine)",
  context: {
    dataConn: null,
    mediaConn: null,
    stream: null,
  } as UserCall,
  initial: "Standby",
  states: {
    Standby: {
      on: {
        makeCall: {
          target: "WaitForCallReply",
        },
        gettingCall: {
          target: "IncomingCall",
        },
      },
    },
    WaitForCallReply: {
      invoke: {
        src: "createDataConn",
        input: (x) => (),
      },
      on: {
        // the receiver failed or timedout
        failed: {
          target: "Standby",
        },
        cancel: {
          target: "Standby",
        },
        rejected: {
          target: "Standby",
        },
        accepted: {
          target: "OnCall",
        },
      },
    },
    IncomingCall: {
      on: {
        timedout: {
          target: "Standby",
        },
        reject: {
          target: "Standby",
        },
        canceled: {
          target: "Standby",
        },
        accept: {
          target: "WaitForCallStream",
        },
      },
    },
    WaitForCallStream: {
      on: {
        // the caller failed or timedout
        failed: {
          target: "Standby",
        },
        stream: {
          target: "OnCall",
        },
      },
    },
    OnCall: {
      on: {
        end: {
          target: "Standby",
        },
        failed: {
          target: "Standby",
        },
      },
    },
  },

 *
 */
