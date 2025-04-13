import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import React from "react";
import { createRoot } from "react-dom/client";
import "@workspace/ui/globals.css"

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Button variant="destructive" className={cn("p-6")}>Hello ui</Button>
  </React.StrictMode>,
);
