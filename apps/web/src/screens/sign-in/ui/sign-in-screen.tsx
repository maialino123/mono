"use client";

import Link from "next/link";
import { GoogleSignInButton, SignInForm, WalletSignInButton } from "@/features/auth/sign-in";
import { useAuthRedirect } from "@/shared/lib";
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
  const { session, isPending, redirectTo } = useAuthRedirect();

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
          <SignInForm />
          <div className="relative flex items-center">
            <Separator className="flex-1" />
            <span className="px-3 text-muted-foreground text-sm">or</span>
            <Separator className="flex-1" />
          </div>
          <GoogleSignInButton redirectTo={redirectTo} />
          <WalletSignInButton redirectTo={redirectTo} />
        </CardContent>
        <p className="pb-6 text-center text-muted-foreground text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
