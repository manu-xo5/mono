import { assert } from "@workspace/assert";
import {
  filter,
  fromEvent,
  map,
  mergeMap,
  of,
  race,
  switchMap,
  take,
  tap,
  throwError,
  timeout,
} from "rxjs";
import { useUserStore } from "./index.js";
import { DataConnection } from "peerjs";

const createError = (msg: string) => throwError(() => Error(msg));

export const createDataConn$ = (otherPeerId: string, signal: AbortSignal) => {
  const { peer } = useUserStore.getState();
  assert(peer != null && peer.open, "peer is null");

  const conn = peer.connect(otherPeerId);

  const abort$ = fromEvent(signal, "abort").pipe(
    tap(() => conn.close()),
    switchMap(() => createError("Call Canceled")),
  );

  const error$ = fromEvent(conn, "error").pipe(
    switchMap(() => createError("Call Failed")),
  );

  const open$ = fromEvent(conn, "open").pipe(
    timeout(2000),
    mergeMap(() => {
      if (!conn.open) {
        return createError("Call Failed");
      } else {
        return of(conn);
      }
    }),
  );

  return race(abort$, error$, open$).pipe(take(1));
};

export const waitForCallReply$ = (
  conn: DataConnection,
  signal: AbortSignal,
) => {
  assert(conn.open, "Connection Failed");

  const abort$ = fromEvent(signal, "abort").pipe(
    switchMap(() => createError("Call Canceled")),
  );
  const data$ = fromEvent(conn, "data").pipe(
    timeout({
      each: 10_000,
      with: () => createError("Not answered"),
    }),
    filter(isCallAction),
    map((x) => x.action),
  );

  return race(abort$, data$).pipe(take(1));
};

function isCallAction(data: unknown): data is { type: "call"; action: string } {
  if (!data || typeof data !== "object") return false;
  if (!("action" in data)) return false;
  if (!("type" in data)) return false;
  if (data.type !== "call") return false;

  return true;
}
