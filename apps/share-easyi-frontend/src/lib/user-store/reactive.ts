import { assert } from "@workspace/assert";
import { DataConnection } from "peerjs";
import { from, fromEvent, of, throwError } from "rxjs";
import {
  filter,
  map,
  switchMap,
  raceWith,
  take,
  tap,
  timeout,
} from "rxjs/operators";
import { useUserStore } from "./index.js";
import { getScreenCaptureStream } from "../utils.js";
import { isCallAction } from "./core.js";

const createError = (msg: string) => throwError(() => Error(msg));

export const createDataConn$ = (otherPeerId: string, signal: AbortSignal) => {
  const { peer } = useUserStore.getState();
  assert(peer != null && peer.open, "peer is null");

  const conn = peer.connect(otherPeerId);

  const abort$ = fromEvent(signal, "abort").pipe(
    tap(() => conn.close()),
    switchMap(() => createError("Call Cancelled")),
  );

  const error$ = fromEvent(conn, "error").pipe(
    switchMap(() => createError("Call Failed")),
  );

  const open$ = fromEvent(conn, "open").pipe(
    raceWith(abort$, error$),
    timeout({
      each: 2000,
      with: () => createError("Call Failed"),
    }),
    map(() => conn),
    take(1),
  );

  return open$;
};

export const waitForCallReply$ = (
  conn: DataConnection,
  signal: AbortSignal,
) => {
  const abort$ = fromEvent(signal, "abort").pipe(
    switchMap(() => createError("Call Cancelled")),
  );
  const data$ = fromEvent(conn, "data").pipe(
    raceWith(abort$),
    timeout({
      each: 10_000,
      with: () => createError("Not answered"),
    }),
    filter(isCallAction),
    map((x) => x.action),
    take(1),
  );

  return data$;
};

export function createMediaConn(otherPeerId: string) {
  const { peer } = useUserStore.getState();
  assert(peer != null, "Peer is null");

  return from(getScreenCaptureStream()).pipe(
    filter((x) => x != null),
    switchMap((stream) => of(peer.call(otherPeerId, stream))),
  );
}
