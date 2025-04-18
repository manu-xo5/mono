import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/direct")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid grid-cols-[auto_1fr] bg-primary-foreground">
      <aside className=""></aside>

      <Outlet />
    </div>
  );
}
