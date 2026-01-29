"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/shared/api";
import { Button } from "@/shared/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/shadcn/dropdown-menu";
import { Skeleton } from "@/shared/shadcn/skeleton";

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-8 w-24 rounded-md" />;
  }

  if (!session) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm" className="rounded-md">
          Sign In
        </Button>
      </Link>
    );
  }

  const displayName = session.user.name ?? session.user.email ?? "User";
  const truncatedName = displayName.length > 12 ? `${displayName.slice(0, 12)}...` : displayName;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" className="rounded-md border-border bg-muted/50 font-normal" />}
      >
        {truncatedName}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{session.user.email}</DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push("/");
                  },
                },
              });
            }}
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
