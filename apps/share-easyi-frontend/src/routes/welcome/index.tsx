import { Button } from "@/components/ui/button.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.js";
import { Input } from "@/components/ui/input.js";
import { Label } from "@/components/ui/label.js";
import { cn } from "@/lib/utils.js";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getNameFromStorage } from "./-index-module.js";

export const Route = createFileRoute("/welcome/")({
  component: WelcomePage,
});

function WelcomePage({ className, ...props }: React.ComponentProps<"div">) {
  const [name, setName] = useState(() => getNameFromStorage());
  const navigate = useNavigate();

  return (
    <main className="h-svh flex items-center justify-center bg-muted">
      <div
        className={cn("flex flex-col items-center gap-6", className)}
        {...props}
      >
        <Card className="max-w-sm w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(ev) => {
                ev.preventDefault();
                navigate({
                  to: "/home",
                  replace: true,
                });
                localStorage.setItem("share-easyi:display-name", name);
              }}
            >
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Choose display name</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="m@example.com"
                    value={name}
                    onChange={(ev) => setName(ev.currentTarget.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          Placeholder Note: By clicking continue, you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </main>
  );
}
