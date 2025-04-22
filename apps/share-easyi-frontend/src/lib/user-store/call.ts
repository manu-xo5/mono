import { assert } from "@workspace/assert";
import { DataConnection } from "peerjs";
import { BehaviorSubject, catchError, defer, delay, EMPTY, exhaustMap, filter, finalize, from, of, raceWith, share, Subject, switchMap, tap, throwError, timeout, timer } from "rxjs";
import { getScreenCaptureStream, ofType } from "../utils.js";
import { useUserStore } from "./index.js";
import { createDataConn as waitForDataConn, waitForCallReply$ } from "./reactive.js";

function dispatchCallStatus(status: "standby" | "on-call" | "incoming-call" | "outgoing-call" | "call-failed" | "call-rejected") {
  useUserStore.setState({
    status
  });
}

export const callStatus$ = new BehaviorSubject<"standby" | "incoming-call" | "outgoing-call" | "on-call" | "call-rejected" | "call-failed">("standby");

let conn: DataConnection | null = null;
conn = null;

export const makeCall$ = new Subject<string>();

makeCall$
  .pipe(
    filter(() => useUserStore.getState().status === "standby"),
    filter(() => useUserStore.getState().peer != null),
    switchMap((otherPeerId) => of(useUserStore.getState().peer!.connect(otherPeerId))),

    tap(() => callStatus$.next("outgoing-call")),
    switchMap((conn) => waitForDataConn(conn)),
    tap((x) => (conn = x)),
    switchMap((conn) =>
      defer(() => {
        const $ = waitForCallReply$(conn);
        conn.send({
          type: "call",
          action: "request"
        });

        return $.pipe(
          timeout({
            each: 5_000,
            with: () => of("rejected")
          })
        );
      })
    ),
    catchError((err) => {
      console.log(err.message ?? err);
      return of("call-failed");
    }),
    tap((reply) => {
      if (reply === "accepted") {
        callStatus$.next("on-call");
      } else if (reply === "rejected") {
        callStatus$.next("call-rejected");
      } else {
        callStatus$.next("call-failed");
      }
    }),
    filter((reply) => reply !== "accepted"),
    delay(1000),
    tap(() => {
      callStatus$.next("standby");
      conn = null;
    })
  )
  // TODO: move near to zustand store
  .subscribe();

//switchMap(() => from(getScreenCaptureStream())),
//switchMap((mediaStream) => (mediaStream == null ? throwError(() => Error("Call Failed")) : of(mediaStream))),
//catchError(() => {
//  dispatchCallStatus("call-failed");
//  return EMPTY;
//})
export const makeCall = (otherPeerId: string) => {
  const { peer, status } = useUserStore.getState();
  assert(!!peer && peer.open, "peer is null");

  if (status === "standby") {
    const conn = peer.connect(otherPeerId);

    const callResponse$ = of(null).pipe(
      exhaustMap(() => waitForDataConn(conn)),
      tap(() => dispatchCallStatus("outgoing-call")),
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

    const timeout$ = timer(5000).pipe(
      tap(() => dispatchCallStatus("call-rejected")),
      delay(1500),
      tap(() => dispatchCallStatus("standby"))
    );

    const busy$ = callResponse$.pipe(
      ofType("rejected"),
      tap(() => dispatchCallStatus("call-rejected")),
      delay(1500),
      tap(() => dispatchCallStatus("standby"))
    );

    const accepted$ = callResponse$.pipe(
      ofType("accepted"),
      exhaustMap(() => from(getScreenCaptureStream())),
      exhaustMap((mediaStream) => (mediaStream == null ? throwError(() => Error("Call failed")) : of(mediaStream))),
      tap(() => dispatchCallStatus("on-call")),
      catchError(() => {
        dispatchCallStatus("call-failed");
        return EMPTY;
      })
    );

    return accepted$.pipe(raceWith(timeout$, busy$));
    //useUserStore.setState({ endCall: () => sub.unsubcribe() });
  } else {
  }
};
