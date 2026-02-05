"use client";

import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { evmConfig } from "@/shared/lib/wallet/evm-config";

import "@rainbow-me/rainbowkit/styles.css";

export function EvmProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={evmConfig}>
      <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
    </WagmiProvider>
  );
}
