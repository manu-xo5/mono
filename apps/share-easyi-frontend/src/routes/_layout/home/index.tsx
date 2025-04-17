import { Input } from "@/components/ui/input.js";
import { Label } from "@/components/ui/label.js";
import { useUserStore } from "@/lib/user-store/index.js";
import { createFileRoute } from "@tanstack/react-router";
import { Peer } from "peerjs";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_layout/home/")({
  component: HomePage,
});

function HomePage() {
  const { peer } = useUserStore();
  const [otherPeerId, setOtherPeerId] = useState("");

  useEffect(() => {
    if (otherPeerId == "") return;
    if (peer == null) return;

    console.log("isopen", peer.open);
    const conn = peer.connect(otherPeerId);
    console.log("conn", conn);

    conn.on("open", () => {
      const data = "hi!";
      console.log("my msg:", data);
      conn.send(data);
    });

  }, [peer, otherPeerId]);

  return (
    <div className="bg-card p-3 m-6 rounded-lg w-sm inline-flex flex-col gap-3">
      <Label>Other's Peer ID</Label>

      <Input
        onKeyUp={(ev) => {
          if (ev.key !== "Enter") return;
          ev.preventDefault();
          setOtherPeerId(ev.currentTarget.value);
        }}
        placeholder="xxxx-xxxx-xxxx-xxxx"
      />
    </div>
  );
}
