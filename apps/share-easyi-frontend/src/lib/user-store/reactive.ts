import { DataConnection } from "peerjs";
import { fromEvent, of, throwError } from "rxjs";
import {
  filter,
  map,
  raceWith,
  switchMap,
  take,
  timeout
} from "rxjs/operators";
import { isCallAction } from "./index.js";

export const createDataConn = (conn: DataConnection) => {
  const error$ = fromEvent(conn, "error").pipe(
    switchMap(() => throwError(() => "Call Failed")),
  );

  const open$ = fromEvent(conn, "open").pipe(
    raceWith(error$),
    timeout(3000),
    map(() => conn),
    take(1),
  );

  return open$;
};

export const waitForCallReply$ = (
  conn: DataConnection,
  signal?: AbortSignal,
) => {
  void signal;

  const data$ = fromEvent(conn, "data").pipe(
    filter(isCallAction),
    map((x) => x.action),
    timeout({
      each: 10_000,
      with: () => of("timeout"),
    }),
    take(1),
  );

  return data$;
};
