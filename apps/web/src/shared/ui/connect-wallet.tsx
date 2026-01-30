"use client";

import type { ReactNode } from "react";
import type { WalletOptions } from "@/shared/lib/wallet/types";
import { useWalletConnection } from "@/shared/lib/wallet/use-wallet-connection";
import { Button } from "@/shared/shadcn/button";

interface ConnectWalletProps {
  options: WalletOptions;
  children: ReactNode;
  className?: string;
}

export function ConnectWallet({ options, children, className }: ConnectWalletProps) {
  const { isConnected, isCorrectChain, openConnectModal, switchChain } = useWalletConnection(options);

  if (!isConnected) {
    return (
      <Button className={className} size="lg" onClick={openConnectModal}>
        Connect Wallet
      </Button>
    );
  }

  if (!isCorrectChain && switchChain) {
    return (
      <Button className={className} size="lg" variant="destructive" onClick={switchChain}>
        Switch Network
      </Button>
    );
  }

  if (!isCorrectChain) {
    return (
      <Button className={className} size="lg" variant="destructive" disabled>
        Unsupported Network
      </Button>
    );
  }

  return <>{children}</>;
}
