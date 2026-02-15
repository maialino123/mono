"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { createSiweMessage } from "viem/siwe";
import { useConnection, useSignMessage } from "wagmi";
import { authClient } from "@/shared/api";
import { Button } from "@/shared/shadcn/button";

interface WalletSignInButtonProps {
  redirectTo?: string;
}

export function WalletSignInButton({ redirectTo = "/" }: WalletSignInButtonProps) {
  const { address, isConnected, chain } = useConnection();
  const { mutateAsync: signMessageAsync } = useSignMessage();
  const { openConnectModal } = useConnectModal();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!isConnected || !address || !chain) {
      openConnectModal?.();
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      const nonceRes = await authClient.siwe.nonce({
        walletAddress: address,
        chainId: chain.id,
      });

      if (nonceRes.error || !nonceRes.data) {
        setError("Failed to get nonce");
        return;
      }

      const nonce = nonceRes.data.nonce;

      const message = createSiweMessage({
        address,
        chainId: chain.id,
        domain: window.location.host,
        nonce,
        uri: window.location.origin,
        version: "1",
        statement: "Sign in with Ethereum",
      });

      const signature = await signMessageAsync({ message });

      const verifyRes = await authClient.siwe.verify({
        message,
        signature,
        walletAddress: address,
        chainId: chain.id,
      });

      if (verifyRes.error) {
        setError(verifyRes.error.message ?? "Verification failed");
        return;
      }

      window.location.href = redirectTo;
    } catch (err) {
      if (err instanceof Error && err.message.includes("User rejected")) {
        setError("Signature rejected");
      } else {
        setError("Failed to sign in with wallet");
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        className="w-full"
        onClick={isConnected ? handleSignIn : () => openConnectModal?.()}
        disabled={isPending}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" role="img" aria-label="Wallet">
          <rect x="2" y="6" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
          <circle cx="17" cy="14" r="1.5" />
        </svg>
        {isPending ? "Signing in..." : isConnected ? "Sign in with Wallet" : "Connect Wallet"}
      </Button>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
