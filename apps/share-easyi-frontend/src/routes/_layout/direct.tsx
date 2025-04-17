import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/direct")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <aside className="">Hello "/_layout/direct"!</aside>

      <Outlet />
    </div>
  );
}
