"use client";

import type { WalletOptions, WalletState } from "./types";
import { useEvmWallet } from "./use-evm-wallet";
import { useSolanaWallet } from "./use-solana-wallet";

export function useWalletConnection(options: WalletOptions): WalletState {
  const evmWallet = useEvmWallet(options.type === "evm" ? options.chainId : undefined);
  const solanaWallet = useSolanaWallet(options.type === "solana" ? options.network : undefined);

  return options.type === "evm" ? evmWallet : solanaWallet;
}
