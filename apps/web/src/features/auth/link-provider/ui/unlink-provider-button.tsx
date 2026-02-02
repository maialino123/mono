"use client";

import { useState } from "react";
import { toast } from "sonner";
import { accountQueries } from "@/entities/account";
import { authClient, queryClient } from "@/shared/api";
import { Button } from "@/shared/shadcn/button";

interface UnlinkProviderButtonProps {
  providerId: string;
  disabled?: boolean;
}

export function UnlinkProviderButton({ providerId, disabled }: UnlinkProviderButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    try {
      await authClient.unlinkAccount({ providerId });
      queryClient.invalidateQueries({ queryKey: accountQueries.all() });
      toast.success("Account unlinked");
    } catch {
      toast.error("Failed to unlink account");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button variant="destructive" size="sm" disabled={disabled || isPending} onClick={handleClick}>
      {isPending ? "Unlinking..." : "Unlink"}
    </Button>
  );
}
