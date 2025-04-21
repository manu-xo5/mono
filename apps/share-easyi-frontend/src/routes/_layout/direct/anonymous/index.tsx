import { Button } from "@/components/ui/button.js";
import { Icons } from "@/components/ui/icons.js";
import { makeCall, useUserStore } from "@/lib/user-store/index.js";
import { getScreenCaptureStream } from "@/lib/utils.js";
import { createFileRoute, redirect } from "@tanstack/react-router";
import * as dataUrl from "@workspace/utils/data-url";
import { useEffect, useState } from "react";
import { renderToString } from "react-dom/server";

const svgUrl = dataUrl.fromSvgString(
  renderToString(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      transform="scale(0.6) rotate(40)"
      stroke="oklch(0.274 0.006 286.033)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line
        x1="12"
        x2="12"
        y1="2"
        y2="15"
      />
    </svg>
  )
);

export const Route = createFileRoute("/_layout/direct/anonymous/")({
  loader: ({ location }) => {
    const peerId = "peerId" in location.state && typeof location.state.peerId === "string" && location.state.peerId;

    if (peerId) {
      return { otherPeerId: peerId };
    }

    const isAudience = "isAudience" in location.state && typeof location.state.isAudience === "boolean" && location.state.isAudience;

    if (isAudience) {
      return { isAudience };
    }

    throw redirect({
      to: "/home/",
      replace: true
    });
  },
  component: RouteComponent
});

function RouteComponent() {
  const { otherPeerId, isAudience } = Route.useLoaderData();
  console.log("useLoader()", Route.useLoaderData());
  const peer = useUserStore((s) => s.peer);
  const call = useUserStore((s) => s.call);
  const callDataConn = useUserStore((s) => s.callDataConn);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const navigate = Route.useNavigate();

  useEffect(() => {
    if (!peer || !peer.open) return;
    if (!otherPeerId) return;

    let avDisplayStream: MediaStream | null = null;

    void (async function () {
      avDisplayStream = await getScreenCaptureStream();

      if (!avDisplayStream) return;

      setLocalStream(avDisplayStream);
      const response = await makeCall(avDisplayStream, otherPeerId);
      console.log("Component response", response);
    })();

    return () => {
      avDisplayStream?.getTracks().forEach((track) => track.stop());
    };
  }, [otherPeerId, peer]);

  useEffect(() => {
    if (!isAudience || !call) return;

    call.addListener("stream", (stream) => {
      setLocalStream(stream);
    });
  }, [isAudience, call]);

  return (
    <div
      style={{
        backgroundImage: `url("${svgUrl}")`,
        backgroundSize: "200px"
      }}
      className="h-svh grid bg-primary-foreground place-items-center "
    >
      <div className="rounded-md outline-[10px] outline-accent-foreground/50 aspect-video w-[60vw] bg-black relative grid place-items-center">
        {isAudience && "Receiver"}
        <video
          ref={(node) => {
            if (!node) return;

            if (localStream) {
              node.srcObject = localStream;
              node.play();
            } else {
              node.pause();
            }
          }}
        />
        <div className="absolute z-10 bottom-3 left-1/2 -translate-x-1/2 p-2 flex gap-3">
          <Button
            size="icon"
            variant="secondary"
            className="size-12"
          >
            <Icons.Mic />
          </Button>

          <Button
            size="icon"
            variant="destructive"
            className="size-12"
            onClick={async () => {
              // todo: change /home to /direct later
              console.log(callDataConn);
              callDataConn?.send({
                type: "call",
                action: "ended",
                meta: "end-call:" + peer?.id
              });

              call?.close();
              callDataConn?.close();
              useUserStore.setState({
                status: "standby",
                callDataConn: null
              });
            }}
          >
            <Icons.CallReject />
          </Button>
        </div>
      </div>
    </div>
  );
}
