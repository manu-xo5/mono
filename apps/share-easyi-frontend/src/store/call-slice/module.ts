import { DataConnection } from "peerjs";
import { useStore } from "@/store/index.js";
import { dispatchCallAction } from "./index.js";

export function handleCallDataConn(conn: DataConnection) {
  const callSlice = useStore.getState().callSlice;

  if (callSlice.status === "incoming-call") {
    console.log("incoming-call during existing call", callSlice.status);
    conn.once("open", () => {
      conn.send("rejected");
      conn.close();
    });
  } else {
    conn.once("open", () => {
      dispatchCallAction({
        type: "RECEIVE_CALL",
        payload: { callDataConn: conn }
      });
    });
  }
}
