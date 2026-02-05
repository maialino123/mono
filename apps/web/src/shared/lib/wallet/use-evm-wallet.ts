"use client";

import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useCallback } from "react";
import { useConnection, useConnectionEffect, useDisconnect, useSwitchChain } from "wagmi";
import type { WalletState } from "./types";

export function useEvmWallet(chainId?: number): WalletState {
  const { address, isConnected, chain } = useConnection();
  const switchChain = useSwitchChain();
  const disconnect = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();

  useConnectionEffect({
    onDisconnect() {
      disconnect.mutate();
    },
  });

  const isCorrectChain = !chainId || chain?.id === chainId;

  const handleOpenConnectModal = useCallback(() => {
    openConnectModal?.();
  }, [openConnectModal]);

  const handleSwitchChain = useCallback(() => {
    if (chainId) {
      switchChain.mutate({ chainId });
    } else {
      openChainModal?.();
    }
  }, [chainId, switchChain, openChainModal]);

  return {
    isConnected,
    address: address ?? null,
    isCorrectChain,
    chainName: chain?.name ?? null,
    openConnectModal: handleOpenConnectModal,
    switchChain: isConnected && !isCorrectChain ? handleSwitchChain : null,
  };
}
