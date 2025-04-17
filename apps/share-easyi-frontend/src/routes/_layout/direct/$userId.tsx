import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/direct/$userId")({
  component: DirectUserPage,
});

function DirectUserPage() {
  return <div></div>;
}
