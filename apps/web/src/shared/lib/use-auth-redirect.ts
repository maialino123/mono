"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { authClient } from "@/shared/api";
import { safeRedirect } from "./safe-redirect";

export function useAuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  const redirectTo = useMemo(() => safeRedirect(searchParams.get("next")), [searchParams]);

  useEffect(() => {
    if (!isPending && session) {
      router.replace(redirectTo);
    }
  }, [isPending, session, router, redirectTo]);

  return { session, isPending, redirectTo };
}
