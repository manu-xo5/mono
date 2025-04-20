import { PageContainer } from "@/components/page-container.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import {
  createDataConn$,
  waitForCallReply$,
} from "@/lib/user-store/reactive.js";
import { createFileRoute } from "@tanstack/react-router";
import { catchError, EMPTY, switchMap, tap } from "rxjs";
import { create } from "zustand";

export const Route = createFileRoute("/_layout/test-call/")({
  component: RouteComponent,
});

type State =
  | {
      value: "idle";
      abort?: undefined;
    }
  | {
      value: "creating-connection";
      abort(): void;
    }
  | {
      value: "waiting-for-answer";
      abort(): void;
    }
  | {
      value: "on_call";
      abort?: undefined;
    };

const useCall = create<State>()(() => ({
  value: "idle",
}));

const makeCall = (otherPeerId: string) => {
  const { value } = useCall.getState();
  if (value !== "idle") return;

  const abort = new AbortController();
  const state: State = {
    value: "creating-connection",
    abort: () => abort.abort(),
  };
  useCall.setState(state);

  createDataConn$(otherPeerId, abort.signal)
    .pipe(
      catchError((err) => (console.log(err), EMPTY)),
      tap((conn) => {
        conn.send({
          type: "call",
          action: "request",
        });
        useCall.setState({
          value: "waiting-for-answer",
          abort: () => abort.abort(),
        });
      }),

      switchMap((conn) => waitForCallReply$(conn, abort.signal)),
      catchError((err) => (console.log(err), EMPTY)),
      tap((conn) => {
        if (conn === "accepted") {
          useCall.setState({
            value: "on_call",
            abort: undefined,
          });
        } else {
          useCall.setState({
            value: "idle",
            abort: undefined,
          });
        }
      }),
    )
    .subscribe();
};

const endCall = () => {
  const { abort, value } = useCall.getState();
  if (value === "idle") return;

  abort();
  const state: State = {
    value: "idle",
    abort: undefined,
  };
  useCall.setState(state);
};

function RouteComponent() {
  const state = useCall();

  return (
    <PageContainer>
      <div className="p-3">
        <Input
          defaultValue={localStorage.getItem("abc") ?? ""}
          onKeyUp={(ev) => {
            if (ev.key !== "Enter") return;
            const value = ev.currentTarget.value;
            makeCall(value);
          }}
          onChange={(ev) => {
            localStorage.setItem("abc", ev.currentTarget.value);
          }}
        />
      </div>
      <p>{String(state.value)}</p>

      <Button
        disabled={state.value === "idle"}
        variant="destructive"
        onClick={() => endCall()}
      >
        End
      </Button>
    </PageContainer>
  );
}
