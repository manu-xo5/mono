import { PageContainer } from "@/components/page-container.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { callMachine } from "@/lib/user-store/user-call-store.js";
import { createFileRoute } from "@tanstack/react-router";
import { useMachine } from "@xstate/react";

export const Route = createFileRoute("/_layout/test-call/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [state, send] = useMachine(callMachine);

  return (
    <PageContainer>
      <div className="p-3">
        <Input
          onKeyUp={(ev) => {
            if (ev.key !== "Enter") return;
            send({
              type: "makeCall",
              otherPeerId: ev.currentTarget.value,
            });
          }}
        />
      </div>
      <p>{String(state.value)}</p>
      <Button
        disabled={state.value !== "ON_CALL"}
        variant="destructive"
        onClick={() => send({ type: "endCall" })}
      >
        End
      </Button>
    </PageContainer>
  );
}
