import { ProfilePreviewDialog } from "@/components/profile-preview-dialog.js";
import { Dialog, DialogTrigger } from "@/components/ui/dialog.js";
import { useUserStore } from "@/lib/user-store/index.js";
import { Avatar, AvatarImage } from "@/components/ui/avatar.js";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import * as random from "@workspace/utils/random";
import { useEffect } from "react";

export const Route = createFileRoute("/_layout/discover/")({
  loader: () =>
    fetch("http://localhost:5000")
      .then((res) => res.json())
      .then((res) => res.ids),
  component: WelcomePage,
});

const DELTA = 32;

function WelcomePage() {
  const allOnlineUsers: {
    displayName: string;
    peerId: string;
  }[] = Route.useLoaderData();

  const userPeerId = useUserStore((s) => s.peer?.id ?? "");
  const router = useRouter();

  const randomCoords = allOnlineUsers
    .map((user) => ({
      ...user,
      color: random.hsl(),
      coords: [
        random.between(-DELTA, DELTA),
        random.between(-DELTA, DELTA),
      ] as [number, number],
    }))
    .filter((other) => other.peerId !== userPeerId);

  useEffect(() => {
    const id = setInterval(() => {
      router.invalidate();
    }, 2000);

    return () => clearInterval(id);
  }, []);

  return (
    <main className="p-6 h-[80svh] grid place-items-center">
      <div className="flex flex-wrap gap-6 aspect-square w-[50vmin] items-center justify-center">
        {randomCoords.map(({ coords, color, ...user }) => (
          <div key={user.peerId} style={{ padding: DELTA / 2 + "px" }}>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  style={{
                    transform: `translate(${coords[0]}px, ${coords[1]}px)`,
                    backgroundColor: color,
                  }}
                  className="rounded-full bg-amber-500 size-14 flex items-center justify-center font-black transform transition-transform hover:scale-125 origin-center border-background border-4"
                >
                  <Avatar>
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?name=${user.displayName}&size=72`}
                    />
                  </Avatar>
                </button>
              </DialogTrigger>

              <ProfilePreviewDialog
                displayName={user.displayName}
                userPeerId={user.peerId}
              />
            </Dialog>
          </div>
        ))}
      </div>
    </main>
  );
}
