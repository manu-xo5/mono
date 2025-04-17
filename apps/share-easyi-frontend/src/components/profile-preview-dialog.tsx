import {
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog.js";
import { cn } from "@/lib/utils.js";
import { Avatar, AvatarImage } from "@/components/ui/avatar.js";
import { Separator } from "@/components/ui/separator.js";
import { Button } from "@/components/ui/button.js";
import { Icons } from "./ui/icons.js";
import { Link } from "@tanstack/react-router";

type Props = {
  style?: React.CSSProperties;
  className?: string;
  displayName: string;
  userPeerId: string;
};

export function ProfilePreviewDialog({
  className,
  displayName,
  userPeerId,
  ...props
}: Props) {
  return (
    <DialogContent
      className={cn(className, "flex flex-col items-center gap-6 w-sm")}
      {...props}
    >
      <DialogHeader>
        <DialogTitle>User's Profile</DialogTitle>
        <DialogDescription className="sr-only"></DialogDescription>
      </DialogHeader>

      <Avatar className="size-18">
        <AvatarImage
          src={`https://ui-avatars.com/api/?name=${displayName}&size=72`}
        />
      </Avatar>

      <Separator orientation="horizontal" />

      <div className="flex gap-12">
        <Button size="icon" className="rounded-full size-12" variant="outline">
          <Icons.Call />
        </Button>

        <Button
          size="icon"
          className="rounded-full size-12"
          variant="outline"
          asChild
        >
          <Link to="/direct/$userId" params={{ userId: userPeerId }}>
            <Icons.Chat />
          </Link>
        </Button>
      </div>
    </DialogContent>
  );
}
