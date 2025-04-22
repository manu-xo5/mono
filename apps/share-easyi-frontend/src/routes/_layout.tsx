import { IncomingCallDialog } from "@/components/incoming-call-dialog.js";
import { PageNavbar } from "@/components/page-header.js";
import { Dialog } from "@/components/ui/dialog.js";
import { dispatchUserStore, ensureUser, handleCallRequest$, useUserStore } from "@/lib/user-store/index.js";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getPeerIdFromStorage } from "./welcome/-index-module.js";

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
  const { peer, displayName, ...user } = useUserStore();
  //const navigate = Route.useNavigate();

  return (
    <>
      <PageNavbar
        title="Home"
        user={{
          displayName,
          peerId: peer ? peer.id : ""
        }}
      />
      <Outlet />

      <Dialog open={user.status === "incoming-call"}>
        <IncomingCallDialog
          onAnswer={() => {
            dispatchUserStore({ type: "ACCEPT_CALL" });
          }}
          onReject={() => dispatchUserStore({ type: "REJECT_CALL" })}
        />
      </Dialog>
    </>
  );
}
