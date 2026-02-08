"use client";

import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import type { Config } from "wagmi";
import { WagmiProvider } from "wagmi";

import "@rainbow-me/rainbowkit/styles.css";

export function EvmProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    import("@/shared/lib/wallet/evm-config").then(({ evmConfig }) => {
      setConfig(evmConfig);
    });
  }, []);

  if (!config) return null;

  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
    </WagmiProvider>
  );
}
