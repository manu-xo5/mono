import { IncomingCallDialog } from "@/components/incoming-call-dialog.js";
import { PageNavbar } from "@/components/page-header.js";
import { Dialog } from "@/components/ui/dialog.js";
import { ensureUser, useStore } from "@/store/index.js";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getPeerIdFromStorage } from "./welcome/-index-module.js";
import { dispatchCallAction } from "@/store/call-slice/index.js";

export const Route = createFileRoute("/_layout")({
  beforeLoad: async () => {
    console.log("hello before load");
    const peerId = getPeerIdFromStorage();
    if (!peerId) {
      throw redirect({
        to: "/welcome/"
      });
    }

    await ensureUser(peerId);
  },
  component: IndexLayout
});

function IndexLayout() {
  const callStatus = useStore((s) => s.callSlice.status);
  //const navigate = Route.useNavigate();

  return (
    <>
      <PageNavbar title="Home" />
      <Outlet />

      <Dialog open={callStatus === "incoming-call"}>
        <IncomingCallDialog
          onAnswer={() => {
            dispatchCallAction({ type: "ACCEPT_CALL" });
          }}
          onReject={() => dispatchCallAction({ type: "REJECT_CALL" })}
        />
      </Dialog>
    </>
  );
}
