import { PageContainer } from "@/components/page-container.js";
import { Avatar, AvatarImage } from "@/components/ui/avatar.js";
import { Button } from "@/components/ui/button.js";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog.js";
import { Icons } from "@/components/ui/icons.js";
import { Input } from "@/components/ui/input.js";
import { makeCall, UserStore, useUserStore } from "@/lib/user-store/index.js";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { delay, of, take, tap, timer } from "rxjs";
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

const callFail$ = of(null).pipe(
  tap(() => useCall.setState({ value: "call-failed", abort: undefined })),
  delay(2000),
  tap(() => useCall.setState({ value: "idle", abort: undefined })),
);

// TODO: can add more verbose states like: user-busy, user-offline, user-not-answered
const callEnded$ = of(null).pipe(
  tap(() => useCall.setState({ abort: undefined, value: "call-ended" })),
  delay(500),
  tap(() => useCall.setState({ value: "idle", abort: undefined })),
);

const endCall = () => {
  const { abort, value } = useCall.getState();

  if (value === "on_call") {
  } else if (value !== "idle") {
    abort();
  }
};

function RouteComponent() {
  const { status } = useUserStore();
  const [state, setState] = useState({
    value: "idle" as string,
    abort: undefined,
  });

  return (
    <>
      <PageContainer>
        <div className="p-3">
          <Input
            defaultValue={localStorage.getItem("abc") ?? ""}
            onKeyUp={(ev) => {
              if (ev.key !== "Enter") return;
              const value = ev.currentTarget.value;
              const x = makeCall(undefined, value);

              x?.subscribe({
                next: () => {
                  console.log("should be idle");
                },
                error: (err) => {
                  console.log(err.message);
                  useUserStore.setState({ status: "call-faild" });

                  timer(2000)
                    .pipe(take(1))
                    .subscribe(() => {
                      useUserStore.setState({
                        status: "standby",
                      });
                    });
                },
              });
            }}
            onChange={(ev) => {
              localStorage.setItem("abc", ev.currentTarget.value);
            }}
          />
        </div>
        <p>{String(status)}</p>
      </PageContainer>

      <Dialog open={["call-failed", "waiting-for-answer", "on_call", "call-ended"].includes(state.value)}>
        <OutgoingCallDialog
          status={status}
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
  status: UserStore["status"];
};
function OutgoingCallDialog({ onEndCall, status }: Props2) {
  const title = (() => {
    const stateToTitle = {
      "outgoing-call": "Ringing...",
      "on-call": "00:27",
      "call-faild": "Call Failed",
      standby: "",
      "incoming-call": "",
    } satisfies Record<typeof status, string>;

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
          <AvatarImage src={`https://ui-avatars.com/api/?name=${"Unknown"}&size=72`} />
        </Avatar>
      </div>

      <div className="flex justify-center">
        <Button disabled={status === "call-faild"} className="rounded-full size-12" size="icon" variant="destructive" onClick={onEndCall}>
          <Icons.CallReject className="scale-x-[-1]" />
        </Button>
      </div>
    </DialogContent>
  );
}
