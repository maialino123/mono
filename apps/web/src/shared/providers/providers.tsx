"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/shared/api/orpc";
import { Toaster } from "../shadcn/sonner";
import { CustomThemeProvider } from "./custom-theme-provider";
import { EvmProvider } from "./evm-provider";
import { SolanaProvider } from "./solana-provider";
import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <EvmProvider>
          <SolanaProvider>
            <CustomThemeProvider>{children}</CustomThemeProvider>
          </SolanaProvider>
        </EvmProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
