import { PageContainer } from "@/components/page-container.js";
import { Avatar, AvatarImage } from "@/components/ui/avatar.js";
import { Button } from "@/components/ui/button.js";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog.js";
import { Icons } from "@/components/ui/icons.js";
import { Input } from "@/components/ui/input.js";
import { useObservable } from "@/lib/rxjs-react/use-observable.js";
import { callStatus$, makeCall$ } from "@/lib/user-store/call.js";
import { dispatchCallStatus, makeCall, UserStore, useUserStore } from "@/lib/user-store/index.js";
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";

export const Route = createFileRoute("/_layout/test-call/")({
  component: RouteComponent
});

function RouteComponent() {
  const { status } = useUserStore();
  const endCallRef = useRef(() => {});

  return (
    <>
      <PageContainer>
        <div className="p-3">
          <Input
            defaultValue={localStorage.getItem("abc") ?? ""}
            onKeyUp={(ev) => {
              if (ev.key !== "Enter") return;
              const value = ev.currentTarget.value;
              makeCall$.next(value);
              //const call$ = makeCall(undefined, value);
              //
              //const sub = call$?.subscribe({
              //  complete: () => {
              //    console.log("call settled, should be idle");
              //  }
              //});
              //endCallRef.current = () => sub?.unsubscribe();
            }}
            onChange={(ev) => {
              localStorage.setItem("abc", ev.currentTarget.value);
            }}
          />
        </div>
        <p>{String(status)}</p>
        <Button
          variant="destructive"
          onClick={() => console.error("noop")}
        >
          End
        </Button>
      </PageContainer>

      <OutgoingCallDialog
        onEndCall={() => {
          console.log("todo: not implemented");
        }}
      />
    </>
  );
}

type Props2 = {
  onEndCall?(): void;
};
function OutgoingCallDialog({ onEndCall }: Props2) {
  const callStatus = useObservable(callStatus$, "standby");

  const title = (() => {
    const stateToTitle = {
      "outgoing-call": "Ringing...",
      "on-call": "00:27",
      "call-rejected": "Busy",
      "call-failed": "Call Failed",
      standby: "",
      "incoming-call": ""
    } satisfies Record<typeof callStatus, string>;

    return stateToTitle[callStatus];
  })();

  return (
    <Dialog open={["outgoing-call", "on-call", "call-failed", "call-rejected", "incoming-call"].includes(callStatus)}>
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
          <Button
            disabled={callStatus === "call-failed"}
            className="rounded-full size-12"
            size="icon"
            variant="destructive"
            onClick={onEndCall}
          >
            <Icons.CallReject className="scale-x-[-1]" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
