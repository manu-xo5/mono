import { PageContainer } from "@/components/page-container.js";
import { Avatar, AvatarImage } from "@/components/ui/avatar.js";
import { Button } from "@/components/ui/button.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog.js";
import { Icons } from "@/components/ui/icons.js";
import { Input } from "@/components/ui/input.js";
import {
  createDataConn$,
  waitForCallReply$,
} from "@/lib/user-store/reactive.js";
import { createFileRoute } from "@tanstack/react-router";
import { catchError, delay, of, switchMap, tap } from "rxjs";
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
    }
  | {
      value: "call-ended";
      abort(): void;
    }
  | {
      value: "call-failed";
      abort(): void;
    };

const useCall = create<State>()(() => ({
  value: "idle",
}));
const setStateCallIdle = () =>
  useCall.setState({
    value: "idle",
    abort: undefined,
  });
const setStateCallError = () =>
  useCall.setState({
    value: "call-failed",
    abort: undefined,
  });
const setStateCallWaiting = (abort: AbortController) =>
  useCall.setState({
    value: "waiting-for-answer",
    abort: () => abort.abort(),
  });

const makeCall = (otherPeerId: string) => {
  const { value } = useCall.getState();
  if (value !== "idle") return;

  const abort = new AbortController();
  useCall.setState({
    value: "creating-connection",
    abort: () => abort.abort(),
  });

  const callFail$ = of(null).pipe(
    tap(() => setStateCallError()),
    delay(2000),
    tap(() => setStateCallIdle()),
  );
  const callEnded$ = of(null).pipe(
    tap(() => useCall.setState({ abort: undefined, value: "call-ended" })),
    delay(500),
    tap(() => setStateCallIdle()),
  );

  of(null)
    .pipe(
      switchMap(() => createDataConn$(otherPeerId, abort.signal)),
      tap((conn) => conn.send({ type: "call", action: "request" })),
      tap(() => setStateCallWaiting(abort)),

      switchMap((conn) => waitForCallReply$(conn, abort.signal)),
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
      catchError((err) => {
        if ("message" in err && err.message === "Call Cancelled") {
          return callEnded$;
        } else {
          return callFail$;
        }
      }),
    )
    .subscribe();
};

const endCall = () => {
  const { abort, value } = useCall.getState();

  if (value === "on_call") {
  } else if (value !== "idle") {
    abort();
  }
};

function RouteComponent() {
  const state = useCall();

  return (
    <>
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
      </PageContainer>

      <Dialog
        open={[
          "creating-connection",
          "call-failed",
          "waiting-for-answer",
          "on_call",
          "call-ended",
        ].includes(state.value)}
      >
        <OutgoingCallDialog
          status={state.value}
          onEndCall={() => {
            endCall();
          }}
        />
      </Dialog>
    </>
  );
}

type Props2 = {
  onEndCall?(): void;
  status: State["value"];
};
function OutgoingCallDialog({ onEndCall, status }: Props2) {
  const title = (() => {
    const stateToTitle = {
      "creating-connection": "Connecting...",
      "waiting-for-answer": "Ringing...",
      on_call: "00:27",
      "call-failed": "Call Failed",
      idle: "",
      "call-ended": "Call Ended",
    } satisfies Record<State["value"], string>;

    return stateToTitle[status];
  })();

  return (
    <DialogContent className="w-sm flex flex-col gap-6 items-center">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="sr-only" />
      </DialogHeader>

      <div className="pt-3 pb-9">
        <Avatar className="size-18">
          <AvatarImage
            src={`https://ui-avatars.com/api/?name=${"Unknown"}&size=72`}
          />
        </Avatar>
      </div>

      <div className="flex justify-center">
        <Button
          disabled={status === "call-failed"}
          className="rounded-full size-12"
          size="icon"
          variant="destructive"
          onClick={onEndCall}
        >
          <Icons.CallReject className="scale-x-[-1]" />
        </Button>
      </div>
    </DialogContent>
  );
}
