"use client";

import type { Route } from "next";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import { cn } from "@/shared/lib/utils";

import type { NavItem } from "../config/navigation";
import { navigationItems } from "../config/navigation";

export function HeaderNav() {
  const segment = useSelectedLayoutSegment();

  return (
    <nav className="hidden items-center gap-2 md:flex">
      {navigationItems.map((item: NavItem) => (
        <Link
          key={item.href}
          href={item.href as Route}
          className={cn(
            "flex h-9 items-center px-4 font-medium text-sm leading-5 transition-colors",
            segment === item.segment ? "text-primary" : "text-muted-foreground hover:text-primary",
            item.disabled && "cursor-not-allowed opacity-50",
          )}
          aria-disabled={item.disabled}
          tabIndex={item.disabled ? -1 : undefined}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
