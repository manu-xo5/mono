import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: () =>
    redirect({
      to: "/welcome",
    }),
  component: Index,
});

function Index() {
  return <div>Hello "/"!</div>;
}
