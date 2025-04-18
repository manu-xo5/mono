import { Separator } from "@/components/ui/separator.js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.js";
import { ShareIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu.js";
import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button.js";

type Props = {
  title: string;
  user: {
    peerId: string;
    displayName: string;
  };
};
export function PageNavbar({ title, user }: Props) {
  return (
    <header className="flex h-nav fixed z-10 top-0 w-full shrink-0 items-center gap-2 border-b bg-muted">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <ShareIcon className="size-4" />
        <Link to="/home/">
          <h1 className="ml-2 text-base font-medium">{title}</h1>
        </Link>

        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <Button asChild variant="ghost">
          <Link className="text-base font-medium" to="/discover/">
            Discover People
          </Link>
        </Button>

        <Button asChild variant="ghost">
          <Link className="text-base font-medium" to="/test-call/">
            Test Call
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="ml-auto">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>{user.displayName}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" sideOffset={10}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs"
              onClick={() => {
                navigator.clipboard.writeText(user.peerId);
              }}
            >
              Peer ID: {user.peerId.substring(0, 10).concat("...")}
            </DropdownMenuItem>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
