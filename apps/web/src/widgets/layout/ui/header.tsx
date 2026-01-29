"use client";

import Link from "next/link";

import { CyberkLogoFull } from "@/shared/ui/logo";
import { HeaderNav } from "./header-nav";
import { MobileNav } from "./mobile-nav";
import { SettingsDropdown } from "./settings-dropdown";
import { ShareButton } from "./share-button";
import UserMenu from "./user-menu";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-15 items-center border-border border-b bg-background">
      <div className="flex w-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <MobileNav />
          <Link href="/" className="flex items-center">
            <CyberkLogoFull className="h-5 w-auto" />
          </Link>
          <HeaderNav />
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <SettingsDropdown />
          <ShareButton />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
