import { assert } from "@workspace/assert";
import { of, tap, switchMap, defer, throwError, from, catchError, timer } from "rxjs";
import { getScreenCaptureStream } from "../utils.js";
import { createDataConn } from "./reactive.js";
import { dispatchCallStatus, useUserStore } from "./index.js";
import { waitForCallReply$ } from "./reactive.js";

export const makeCall = (otherPeerId: string) => {
  const { peer, status } = useUserStore.getState();
  assert(!!peer && peer.open, "peer is null");

  if (status === "standby") {
    const conn = peer.connect(otherPeerId);

    dispatchCallStatus("outgoing-call");
    const observable = createDataConn(conn).pipe(
      switchMap(() =>
        defer(() => {
          const $ = waitForCallReply$(conn);
          conn.send({
            type: "call",
            action: "request"
          });
          return $;
        })
      ),

      switchMap((reply) => {
        return (
          reply === "accepted" ? of("accepted")
          : reply === "timeout" ? throwError(() => "The Person is not answering")
          : reply === "timeout" ? throwError(() => "The Person is busy")
          : throwError(() => "The Person is busy")
        );
      }),
      switchMap(() => from(getScreenCaptureStream())),
      switchMap((stream) => {
        if (stream == null) {
          return throwError(() => Error("Call Failed"));
        } else {
          return of(peer.call(otherPeerId, stream));
        }
      }),
      tap(() => dispatchCallStatus("on-call")),
      catchError((err) => {
        console.error(err);

        dispatchCallStatus("call-failed");
        return timer(3000).pipe(tap(() => dispatchCallStatus("standby")));
      })
    );

    return observable;
    //useUserStore.setState({ endCall: () => sub.unsubcribe() });
  } else {
  }
};
