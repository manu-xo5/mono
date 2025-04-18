import { PageContainer } from "@/components/page-container.js";
import { Input } from "@/components/ui/input.js";
import { Label } from "@/components/ui/label.js";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/home/")({
  component: HomePage,
});

function HomePage() {
  const navigate = Route.useNavigate();

  return (
    <PageContainer>
      <div className="bg-card p-3 m-6 rounded-lg w-sm inline-flex flex-col gap-3">
        <Label>Other's Peer ID</Label>

        <Input
          onKeyUp={(ev) => {
            if (ev.key !== "Enter") return;
            ev.preventDefault();
            const peerId = ev.currentTarget.value;
            navigate({
              to: "/direct/anonymous",
              state: { peerId },
            });
          }}
          placeholder="xxxx-xxxx-xxxx-xxxx"
        />
      </div>
    </PageContainer>
  );
}
