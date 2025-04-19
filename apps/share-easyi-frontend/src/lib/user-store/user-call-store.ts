import { assert } from "@workspace/assert";
import { DataConnection, MediaConnection } from "peerjs";
import {
  assign,
  enqueueActions,
  EventObject,
  fromCallback,
  fromPromise,
  setup,
} from "xstate";
import { create } from "zustand";
import { createDataConn, createMediaConn, waitForCallReply } from "./core.js";

type UserCall = {
  status: string;
  dataConn: DataConnection | null;
  mediaConn: MediaConnection | null;
  stream: MediaStream | null;
};

export const useUserCall = create<UserCall>()(() => ({
  status: "Standby",
  dataConn: null,
  mediaConn: null,
  stream: null,
}));

type Events = { type: "makeCall"; otherPeerId: string } | { type: "endCall" };

const createDataConn__ = fromPromise(
  async ({ input }: { input: { otherPeerId: string } }) =>
    createDataConn(input.otherPeerId),
);

const waitForCallReplyActor = fromCallback<
  EventObject,
  { dataConn: DataConnection | null }
>(({ input, sendBack, receive }) => {
  const abort = new AbortController();

  const unsub = waitForCallReply({
    callback: sendBack,
    signal: abort.signal,
    dataConn: input.dataConn,
  });

  receive((event) => {
    if (event.type === "cancel") {
      abort.abort();
    }
  });

  return unsub;
});

const connectMediaConn = fromPromise(
  async ({ input }: { input: { otherPeerId: string } }) =>
    createMediaConn(input.otherPeerId),
);

const requestCallActor = setup({
  types: {
    context: {} as {
      otherPeerId: string;
      dataConn: DataConnection | null;
      mediaConn: MediaConnection | null;
    },
    input: {} as { otherPeerId: string },
    output: {} as
      | { dataConn: DataConnection; mediaConn: MediaConnection }
      | { dataConn: null; mediaConn: null },
  },
  actors: {
    createDataConn__,
    waitForCallReply: waitForCallReplyActor,
    connectMediaConn,
  },
}).createMachine({
  context: ({ input }) => ({
    otherPeerId: input.otherPeerId,
    dataConn: null,
    mediaConn: null,
  }),
  output: ({ context }) => {
    if (!context.dataConn || !context.mediaConn) {
      return {
        dataConn: null,
        mediaConn: null,
      };
    }
    return {
      dataConn: context.dataConn,
      mediaConn: context.mediaConn,
    };
  },
  initial: "connecting_data_conn",
  states: {
    connecting_data_conn: {
      invoke: {
        src: "createDataConn__",
        input: ({ context }) => ({ otherPeerId: context.otherPeerId }),
        onDone: {
          target: "waitingForReply",
          actions: assign({
            dataConn: ({ event }) => event.output,
          }),
        },
        onError: {
          target: "failed",
          actions: [
            enqueueActions(({ enqueue, context }) => {
              const dataConn = context.dataConn;

              enqueue(() => {
                if (dataConn?.open) {
                  dataConn.close();
                }
              });
            }),
          ],
        },
      },
    },
    waitingForReply: {
      invoke: {
        src: "waitForCallReply",
        input: ({ context }) => ({ dataConn: context.dataConn }),
        on: {
          accepted: "connecting_media_conn",
          rejected: "failed",
          error: "failed",
        },
      },
    },
    connecting_media_conn: {
      invoke: {
        src: "connectMediaConn",
        input: ({ context }) => ({ otherPeerId: context.otherPeerId }),
        onDone: "success",
        onError: "failed",
      },
    },
    success: {
      type: "final",
    },
    failed: {
      type: "final",
    },
  },
});

export const callMachine = setup({
  types: {
    context: {} as UserCall,
    events: {} as Events,
  },
  actors: {
    requestCallActor,
  },
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
          target: "REQUEST_CALL",
        },
      },
    },
    REQUEST_CALL: {
      invoke: {
        src: "requestCallActor",
        input: ({ event }) => {
          assert(event.type === "makeCall", "erorrr12221");
          return {
            otherPeerId: event.otherPeerId,
          };
        },
        onDone: {
          target: "ON_CALL",
          actions: ({ event }) =>
            assign({
              dataConn: event.output.dataConn,
              mediaConn: event.output.mediaConn,
            }),
        },
        onError: "STANDBY",
      },
    },

    ON_CALL: {
      entry: () => console.log("on call, busy"),
      on: {
        endCall: { target: "STANDBY" },
      },
    },
  },
});
