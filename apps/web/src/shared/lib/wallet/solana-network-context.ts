"use client";

import type { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { createContext, useContext } from "react";
import { DEFAULT_SOLANA_NETWORK } from "./solana-config";

export interface SolanaNetworkState {
  network: WalletAdapterNetwork;
  setNetwork: (network: WalletAdapterNetwork) => void;
}

export const SolanaNetworkContext = createContext<SolanaNetworkState>({
  network: DEFAULT_SOLANA_NETWORK,
  setNetwork: () => {},
});

export function useSolanaNetwork() {
  return useContext(SolanaNetworkContext);
}
