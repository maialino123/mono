"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useCallback } from "react";
import { SOLANA_NETWORKS } from "./solana-config";
import { useSolanaNetwork } from "./solana-network-context";
import type { SolanaNetwork, WalletState } from "./types";

export function useSolanaWallet(targetNetwork?: SolanaNetwork): WalletState {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { network, setNetwork } = useSolanaNetwork();

  const isCorrectChain = !targetNetwork || network === targetNetwork;

  const openConnectModal = useCallback(() => {
    if (targetNetwork && network !== targetNetwork) {
      setNetwork(targetNetwork);
    }
    setVisible(true);
  }, [setVisible, targetNetwork, network, setNetwork]);

  const switchChain = useCallback(() => {
    if (targetNetwork) {
      setNetwork(targetNetwork);
    }
  }, [targetNetwork, setNetwork]);

  const label = SOLANA_NETWORKS[network].label;

  return {
    isConnected: connected,
    address: publicKey?.toBase58() ?? null,
    isCorrectChain,
    chainName: `Solana ${label}`,
    openConnectModal,
    switchChain: !isCorrectChain ? switchChain : null,
  };
}
