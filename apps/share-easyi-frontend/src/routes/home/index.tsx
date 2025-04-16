import { createFileRoute, redirect } from "@tanstack/react-router";
import { getNameFromStorage } from "../welcome/-index-module.js";
import { PageHeader } from "@/components/page-header.js";
import { useEffect, useState } from "react";
import { Peer } from "peerjs";

export const Route = createFileRoute("/home/")({
  loader: () => {
    if (!getNameFromStorage()) {
      redirect({
        to: "/",
        replace: true,
      });
    }
  },
  component: HomePage,
});

function HomePage() {
  const [localPeerId, setLocalPeerId] = useState<string>("");

  useEffect(() => {
    const peer = new Peer();

    peer.on("open", () => {
      setLocalPeerId(peer.id);
    });

    return () => {
      setPeer()
    }
  }, []);

  return (
    <>
      <PageHeader title="Home" />
      <main>Hello _home_!</main>
    </>
  );
}
