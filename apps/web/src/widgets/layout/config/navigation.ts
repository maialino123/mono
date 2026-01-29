export type NavItem = {
  title: string;
  href: string;
  segment: string | null;
  disabled?: boolean;
};

export const navigationItems: NavItem[] = [
  { title: "Mint", href: "/mint", segment: "mint" },
  { title: "Stake", href: "/stake", segment: "stake" },
];
