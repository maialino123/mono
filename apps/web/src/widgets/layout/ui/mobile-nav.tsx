"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { useState } from "react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/shadcn/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/shadcn/sheet";
import { CyberkLogoFull } from "@/shared/ui/logo";

import type { NavItem } from "../config/navigation";
import { navigationItems } from "../config/navigation";
import { SettingsDropdown } from "./settings-dropdown";
import { ShareButton } from "./share-button";
import UserMenu from "./user-menu";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const segment = useSelectedLayoutSegment();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>
            <CyberkLogoFull />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 p-4">
          {navigationItems.map((item: NavItem) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-9 items-center px-4 font-medium text-sm leading-5 transition-colors",
                segment === item.segment ? "text-primary" : "text-secondary-foreground hover:text-primary",
                item.disabled && "cursor-not-allowed opacity-50",
              )}
              aria-disabled={item.disabled}
              tabIndex={item.disabled ? -1 : undefined}
              onClick={() => !item.disabled && setOpen(false)}
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 p-4">
          <ShareButton />
          <SettingsDropdown />
          <UserMenu />
        </div>
      </SheetContent>
    </Sheet>
  );
}
