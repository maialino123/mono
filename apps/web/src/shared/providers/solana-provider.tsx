"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useMemo, useState } from "react";
import { createSolanaWallets, DEFAULT_SOLANA_NETWORK, getSolanaEndpoint } from "@/shared/lib/wallet/solana-config";
import { SolanaNetworkContext } from "@/shared/lib/wallet/solana-network-context";
import type { SolanaNetwork } from "@/shared/lib/wallet/types";

import "@solana/wallet-adapter-react-ui/styles.css";

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetwork] = useState<SolanaNetwork>(DEFAULT_SOLANA_NETWORK);
  const endpoint = useMemo(() => getSolanaEndpoint(network), [network]);
  const wallets = useMemo(() => createSolanaWallets(), []);

  const contextValue = useMemo(() => ({ network, setNetwork }), [network]);

  return (
    <SolanaNetworkContext.Provider value={contextValue}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </SolanaNetworkContext.Provider>
  );
}
