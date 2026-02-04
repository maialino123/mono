"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { GoogleSignInButton, SignInForm } from "@/features/auth/sign-in";
import { authClient } from "@/shared/api";
import { safeRedirect } from "@/shared/lib";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/shadcn/card";
import { Separator } from "@/shared/shadcn/separator";
import Loader from "@/shared/ui/loader";

export function SignInScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  const redirectTo = useMemo(() => safeRedirect(searchParams.get("next")), [searchParams]);

  useEffect(() => {
    if (!isPending && session) {
      router.replace(redirectTo as never);
    }
  }, [isPending, session, router, redirectTo]);

  if (isPending) {
    return <Loader />;
  }

  if (session) {
    return <Loader />;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SignInForm redirectTo={redirectTo} />
          <div className="relative flex items-center">
            <Separator className="flex-1" />
            <span className="px-3 text-muted-foreground text-sm">or</span>
            <Separator className="flex-1" />
          </div>
          <GoogleSignInButton redirectTo={redirectTo} />
        </CardContent>
      </Card>
    </div>
  );
}
