import { PageNavbar } from "@/components/page-header.js";
import { initUser, useUserStore } from "@/lib/user-store/index.js";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getNameFromStorage } from "./welcome/-index-module.js";

export const Route = createFileRoute("/_layout")({
  beforeLoad: async () => {
    console.log("hello before load");
    const displayName = getNameFromStorage();
    if (!displayName) {
      throw redirect({
        to: "/welcome/",
      });
    }

    await initUser(displayName);
  },
  component: IndexLayout,
});

function IndexLayout() {
  const { peer, displayName } = useUserStore();

  return (
    <>
      <PageNavbar
        title="Home"
        user={{
          displayName,
          peerId: peer ? peer.id : "",
        }}
      />
      <Outlet />
    </>
  );
}
