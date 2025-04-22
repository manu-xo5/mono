import { useStore } from "@/store/index.js";
import { CallAction, CallSlice } from "./index.js";

function reducerCallSlice(state: CallSlice, action: CallAction): Partial<CallSlice> {
  switch (action.type) {
    case "RECEIVE_CALL": {
      const timer = window.setTimeout(() => {
        dispatchCallAction({
          type: "MISSED_CALL",
          payload: {
            callDataConn: action.payload.callDataConn
          }
        });
      });

      return {
        dataConn: action.payload.callDataConn,
        timeout: timer,
        status: "incoming-call"
      };
    }
    case "MISSED_CALL": {
      const { callDataConn } = action.payload;
      if (callDataConn !== state.dataConn) {
        console.error(new Error("dispatchUserStore: received MISSED_CALL action for conn that differ from state.callDataConn"));
      }
      callDataConn.close();

      return {
        dataConn: null,
        status: "standby"
      };
    }

    case "ACCEPT_CALL": {
      const { timeout, dataConn } = state;
      clearTimeout(timeout);
      dataConn?.send("accepted");

      return {
        status: "on-call",
        timeout: 0
      };
    }

    case "REJECT_CALL": {
      const { timeout, dataConn } = state;
      clearTimeout(timeout);
      dataConn?.send("rejected");
      dataConn?.close();

      return {
        status: "standby",
        timeout: 0
      };
    }

    default: {
      console.error(new Error(`unknown ActionType '${(action as unknown as { type: string }).type}', expected UserAction`));
      return state;
    }
  }
}

export const dispatchCallAction = (action: CallAction) => useStore.setState((state) => reducerCallSlice(state.callSlice, action));
