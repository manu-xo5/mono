import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: () =>
    redirect({
      to: "/home",
    }),
  component: Index,
});

function Index() {
  return <div>Hello "/"!</div>;
}
