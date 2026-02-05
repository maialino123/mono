import type { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

export interface EvmWalletOptions {
  type: "evm";
  chainId: number;
}

export interface SolanaWalletOptions {
  type: "solana";
  network: WalletAdapterNetwork;
}

export type WalletOptions = EvmWalletOptions | SolanaWalletOptions;

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  isCorrectChain: boolean;
  chainName: string | null;
  openConnectModal: () => void;
  switchChain: (() => void) | null;
}
