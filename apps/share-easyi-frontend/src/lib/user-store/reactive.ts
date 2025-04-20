import { assert } from "@workspace/assert";
import { DataConnection } from "peerjs";
import {
  filter,
  fromEvent,
  map,
  race,
  switchMap,
  take,
  tap,
  throwError,
  timeout
} from "rxjs";
import { useUserStore } from "./index.js";

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
    timeout({
      each: 2000,
      with: () => createError("Call Failed"),
    }),
    map(() => conn),
  );

  return race(abort$, error$, open$).pipe(take(1));
};

export const waitForCallReply$ = (
  conn: DataConnection,
  signal: AbortSignal,
) => {
  const abort$ = fromEvent(signal, "abort").pipe(
    switchMap(() => createError("Call Cancelled")),
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
