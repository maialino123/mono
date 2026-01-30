import type { Route } from "next";

export type NavItem = {
  title: string;
  href: Route;
  segment: string | null;
  disabled?: boolean;
};

export const navigationItems: NavItem[] = [
  { title: "Mint", href: "/mint", segment: "mint" },
  { title: "Stake", href: "/stake", segment: "stake" },
];
