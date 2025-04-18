import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.js";
import { Avatar, AvatarImage } from "@/components/ui/avatar.js";
import { Button } from "@/components/ui/button.js";
import { Icons } from "./ui/icons.js";

type Props = {
  onAnswer(): void;
  onReject(): void;
};

export function IncomingCallDialog({ onAnswer, onReject }: Props) {
  const displayName = "UN";

  return (
    <DialogContent className="flex flex-col items-center gap-6 w-sm">
      <DialogHeader>
        <DialogTitle>Incoming Call</DialogTitle>
        <DialogDescription className="sr-only" />
      </DialogHeader>

      <div className="pt-3 pb-9">
        <Avatar className="size-18">
          <AvatarImage
            src={`https://ui-avatars.com/api/?name=${displayName}&size=72`}
          />
        </Avatar>
      </div>

      <DialogFooter className="flex gap-9">
        <Button
          className="rounded-full size-12"
          size="icon"
          variant="outline"
          onClick={onAnswer}
        >
          <Icons.Call />
        </Button>

        <Button
          className="rounded-full size-12"
          size="icon"
          variant="destructive"
          onClick={onReject}
        >
          <Icons.CallReject className="scale-x-[-1]" />
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
