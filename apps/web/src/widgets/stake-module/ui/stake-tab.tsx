"use client";

import { useMemo, useState } from "react";
import { sepolia } from "wagmi/chains";
import { cn } from "@/shared/lib/utils";
import type { WalletOptions } from "@/shared/lib/wallet/types";
import { useWalletConnection } from "@/shared/lib/wallet/use-wallet-connection";
import { Button } from "@/shared/shadcn/button";
import { ConnectWallet } from "@/shared/ui/connect-wallet";
import { TokenAmountInput } from "@/shared/ui/token-amount-input";
import type { Token } from "../model/types";
import { CusdIcon } from "./cusd-icon";

export function StakeTab() {
  const walletOptions: WalletOptions = { type: "evm", chainId: sepolia.id };
  const { isConnected, isCorrectChain } = useWalletConnection(walletOptions);
  const walletReady = isConnected && isCorrectChain;

  const sendToken: Token = { symbol: "CUSD" };
  const receiveToken: Token = { symbol: "stCUSD" };
  const exchangeRate = "1 CUSD = 1 stCUSD";
  const maxTransactionCost = "$0.03";
  const rewardFee = "10%";

  const [amount, setAmount] = useState("0.0");

  const fiatValue = useMemo(() => {
    const numValue = Number.parseFloat(amount) || 0;
    return `$${numValue.toFixed(2)}`;
  }, [amount]);

  const isValidAmount = useMemo(() => {
    const trimmedAmount = amount.trim();
    if (!trimmedAmount || trimmedAmount === "0" || trimmedAmount === "0.0" || trimmedAmount === "0.") {
      return false;
    }
    const numValue = Number.parseFloat(trimmedAmount);
    return !Number.isNaN(numValue) && numValue > 0;
  }, [amount]);

  const isSufficientBalance = useMemo(() => Number(amount.trim()) <= 1, [amount]);

  return (
    <>
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="font-medium text-[12px] text-foreground leading-5">You will send</div>
        <div className="flex min-w-0 items-center gap-3 pt-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="relative w-full overflow-hidden pr-[101.5px]">
              <TokenAmountInput
                style={{ fontSize: 24 }}
                placeholder="0.0"
                value={amount}
                onChange={setAmount}
                disabled={!walletReady}
                error={!isSufficientBalance}
              />
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <div className="flex h-full items-center gap-1.5 rounded-full border border-border px-1.5">
                  <CusdIcon className="size-5 shrink-0" />
                  <span className="font-medium text-[16px] text-primary leading-6">{sendToken.symbol}</span>
                </div>
              </span>
            </div>
            <span className="font-medium text-[14px] text-muted-foreground leading-5">{fiatValue}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 flex h-10 items-center justify-between rounded-lg border border-border bg-background p-3">
        <span className="text-nowrap font-medium text-[12px] text-muted-foreground leading-5">You will receive</span>
        <span className="font-medium text-[16px] text-foreground leading-6">
          {fiatValue} {receiveToken.symbol}
        </span>
      </div>

      <ConnectWallet options={walletOptions} className="mt-4 h-10 w-full cursor-pointer rounded-md">
        <Button
          className="mt-4 h-10 w-full cursor-pointer rounded-md"
          disabled={!isValidAmount || !isSufficientBalance}
          size="lg"
        >
          {isSufficientBalance ? "Stake" : "Insufficient balance"}
        </Button>
      </ConnectWallet>

      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="font-normal text-[14px] text-muted-foreground">Exchange rate</span>
        <span className="font-normal text-[14px] text-foreground">{exchangeRate}</span>
      </div>

      <div
        className={cn(
          "flex items-center justify-between gap-3 transition-all duration-300 ease-in-out",
          isValidAmount
            ? "mt-3 max-h-20 translate-y-0 opacity-100"
            : "mt-0 max-h-0 -translate-y-2 overflow-hidden opacity-0",
        )}
      >
        <span className="font-normal text-[14px] text-muted-foreground">Max transaction cost</span>
        <span className="font-normal text-[14px] text-foreground">{maxTransactionCost}</span>
      </div>

      <div
        className={cn(
          "flex items-center justify-between gap-3 transition-all duration-300 ease-in-out",
          isValidAmount
            ? "mt-3 max-h-20 translate-y-0 opacity-100"
            : "mt-0 max-h-0 -translate-y-2 overflow-hidden opacity-0",
        )}
      >
        <span className="font-normal text-[14px] text-muted-foreground">Reward fee</span>
        <span className="font-normal text-[14px] text-foreground">{rewardFee}</span>
      </div>
    </>
  );
}
