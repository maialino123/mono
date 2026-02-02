"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GoogleSignInButton, SignInForm } from "@/features/auth/sign-in";
import { authClient } from "@/shared/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/shadcn/card";
import { Separator } from "@/shared/shadcn/separator";

export function SignInScreen() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/");
    }
  }, [isPending, session, router]);

  if (isPending || session) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SignInForm />
          <div className="relative flex items-center">
            <Separator className="flex-1" />
            <span className="px-3 text-muted-foreground text-sm">or</span>
            <Separator className="flex-1" />
          </div>
          <GoogleSignInButton />
        </CardContent>
      </Card>
    </div>
  );
}
