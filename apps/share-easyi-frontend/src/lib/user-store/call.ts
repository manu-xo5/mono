import { assert } from "@workspace/assert";
import { catchError, defer, delay, exhaustMap, filter, from, of, raceWith, share, switchMap, takeUntil, takeWhile, tap, throwError, timer } from "rxjs";
import { getScreenCaptureStream } from "../utils.js";
import { dispatchCallStatus, useUserStore } from "./index.js";
import { createDataConn, waitForCallReply$ } from "./reactive.js";

export const makeCall = (otherPeerId: string) => {
  const { peer, status } = useUserStore.getState();
  assert(!!peer && peer.open, "peer is null");

  if (status === "standby") {
    const conn = peer.connect(otherPeerId);

    dispatchCallStatus("outgoing-call");

    const callResponse$ = createDataConn(conn).pipe(
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
      share()
    );

    const endCall$ = callResponse$.pipe(filter((reply) => reply === "ended"));

    const busy$ = callResponse$.pipe(
      filter((reply) => reply === "rejected"),
      tap(() => dispatchCallStatus("call-rejected")),
      delay(1500),
      tap(() => dispatchCallStatus("standby"))
    );

    // add timeout when other peer doesn't answer
    const accepted$ = callResponse$.pipe(
      filter((reply) => reply === "accepted"),
      exhaustMap(() => from(getScreenCaptureStream())),
      exhaustMap((mediaStream) => (mediaStream == null ? throwError(() => Error("Call failed")) : of(mediaStream))),
      tap(() => dispatchCallStatus("on-call")),

      catchError((err) => {
        console.debug(err);
        dispatchCallStatus("call-failed");
        return timer(1000).pipe(tap(() => dispatchCallStatus("standby")));
      })
    );

    // maybe race with instead of mergeWith, to cancel the other listener i.e. busy event
    const observable = accepted$.pipe(raceWith(busy$), takeUntil(endCall$));

    return observable;
    //useUserStore.setState({ endCall: () => sub.unsubcribe() });
  } else {
  }
};
