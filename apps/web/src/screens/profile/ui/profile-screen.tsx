"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { accountQueries } from "@/entities/account";
import { LinkGoogleButton, LinkWalletButton, UnlinkProviderButton } from "@/features/auth/link-provider";
import { authClient } from "@/shared/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/shadcn/card";
import { Separator } from "@/shared/shadcn/separator";
import { Skeleton } from "@/shared/shadcn/skeleton";
import Loader from "@/shared/ui/loader";

const LINK_ERROR_MESSAGES: Record<string, string> = {
  account_already_linked_to_different_user: "This account is already linked to another user",
  "email_doesn't_match": "Email doesn't match your account",
  unable_to_link_account: "Unable to link account",
};

const PROVIDER_LABELS: Record<string, string> = {
  credential: "Email & Password",
  google: "Google",
  siwe: "Ethereum Wallet",
};

function ProviderIcon({ providerId }: { providerId: string }) {
  if (providerId === "google") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" role="img" aria-label="Google">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.07l3.66-2.98z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    );
  }
  if (providerId === "siwe") {
    return (
      <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" role="img" aria-label="Wallet">
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <circle cx="17" cy="14" r="1.5" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" role="img" aria-label="Email">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: accounts, isPending: accountsPending } = useQuery(accountQueries.list());

  const shownErrorRef = useRef<string | null>(null);
  useEffect(() => {
    const error = searchParams.get("error");
    if (error && shownErrorRef.current !== error) {
      shownErrorRef.current = error;
      const message = LINK_ERROR_MESSAGES[error] ?? `Failed to link account: ${error}`;
      toast.error(message);
      router.replace("/profile");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!sessionPending && !session) {
      router.replace("/sign-in");
    }
  }, [sessionPending, session, router]);

  if (sessionPending) {
    return <Loader />;
  }

  if (!session) {
    return <Loader />;
  }

  const user = session.user;
  const hasGoogle = accounts?.some((a) => a.providerId === "google");
  const hasSiwe = accounts?.some((a) => a.providerId === "siwe");
  const canUnlink = (accounts?.length ?? 0) > 1;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          {user.image ? (
            <Image src={user.image} alt={user.name} width={64} height={64} className="h-16 w-16 rounded-full" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted font-medium text-xl">
              {user.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <p className="font-medium text-lg">{user.name || "Wallet User"}</p>
            <p className="text-muted-foreground text-sm">{user.email || "No email linked"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linked Accounts</CardTitle>
          <CardDescription>Authentication providers connected to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {accountsPending ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              {accounts?.map((account) => (
                <div key={account.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <ProviderIcon providerId={account.providerId} />
                    <span className="font-medium">{PROVIDER_LABELS[account.providerId] ?? account.providerId}</span>
                  </div>
                  {account.providerId !== "credential" && (
                    <UnlinkProviderButton providerId={account.providerId} disabled={!canUnlink} />
                  )}
                </div>
              ))}

              {!hasGoogle && (
                <>
                  <Separator />
                  <LinkGoogleButton />
                </>
              )}

              {!hasSiwe && (
                <>
                  <Separator />
                  <LinkWalletButton />
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
