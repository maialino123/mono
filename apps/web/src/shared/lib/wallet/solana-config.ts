import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import type { SolanaNetwork } from "./types";

interface SolanaNetworkConfig {
  endpoint: string;
  label: string;
}

export const SOLANA_NETWORKS: Record<SolanaNetwork, SolanaNetworkConfig> = {
  devnet: {
    endpoint: "https://api.devnet.solana.com",
    label: "Devnet",
  },
  testnet: {
    endpoint: "https://api.testnet.solana.com",
    label: "Testnet",
  },
  "mainnet-beta": {
    endpoint: "https://api.mainnet-beta.solana.com",
    label: "Mainnet",
  },
};

export const DEFAULT_SOLANA_NETWORK: SolanaNetwork = "devnet";

export function getSolanaEndpoint(network: SolanaNetwork): string {
  return SOLANA_NETWORKS[network].endpoint;
}

export function createSolanaWallets() {
  return [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
}
