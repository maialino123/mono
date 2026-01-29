"use client";

import { Share2 } from "lucide-react";

import { Button } from "@/shared/shadcn/button";

export function ShareButton() {
  return (
    <Button variant="default" size="sm" className="rounded-md" onClick={() => console.log("Share modal TBD")}>
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );
}
