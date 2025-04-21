import { DataConnection } from "peerjs";
import { fromEvent } from "rxjs";
import { filter, map, take, tap, timeout } from "rxjs/operators";
import { isCallAction } from "./index.js";

export const createDataConn = (conn: DataConnection) => {
  return fromEvent(conn, "open").pipe(
    timeout({
      first: 3000
    }),
    map(() => conn),
    take(1)
  );
};

export const waitForCallReply$ = (conn: DataConnection) => {
  const data$ = fromEvent(conn, "data").pipe(
    filter(isCallAction),
    map((x) => x.action),
    take(1),
    tap((reply) => console.log({ reply }))
  );

  return data$;
};
