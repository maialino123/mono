"use client";

import { ArrowDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/shared/shadcn/button";
import type { Token } from "@/shared/types/token";
import { TokenAmountInput } from "@/shared/ui/token-amount-input";
import { CusdIcon } from "./cusd-icon";

export function MintTab() {
  const isConnected = false;

  const receiveToken: Token = { symbol: "CUSD" };
  const exchangeRate = "1 CUSD = 1.0000 USD";
  const fee = "Fee: 0.00 ETH";

  const [amount, setAmount] = useState("0.0");

  const isValidAmount = useMemo(() => {
    const trimmedAmount = amount.trim();
    if (
      !trimmedAmount ||
      trimmedAmount === "0" ||
      trimmedAmount === "0.0" ||
      trimmedAmount === "0."
    ) {
      return false;
    }
    const numValue = Number.parseFloat(trimmedAmount);
    return !Number.isNaN(numValue) && numValue > 0;
  }, [amount]);

  const isSufficientBalance = useMemo(
    () => Number(amount.trim()) <= 1,
    [amount],
  );

  return (
    <>
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="font-medium text-[12px] text-muted-foreground leading-5">
          Pay
        </div>
        <div className="flex min-w-0 items-center gap-3 pt-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="relative w-full overflow-hidden pr-[140px]">
              <TokenAmountInput
                style={{ fontSize: 24 }}
                placeholder="0.00"
                value={amount}
                onChange={setAmount}
                disabled={!isConnected}
                error={!isSufficientBalance}
              />
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <div className="flex h-full items-center gap-1.5 rounded-full border border-border px-3 py-1">
                  <span className="font-medium text-[14px] text-muted-foreground leading-5">
                    Select Token
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="text-muted-foreground"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 4.5L6 7.5L9 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </span>
            </div>
            <span className="font-medium text-[14px] text-muted-foreground leading-5">
              Balance: 0.00
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-2">
        <div className="flex size-8 items-center justify-center rounded-full border border-border bg-muted">
          <ArrowDown className="size-4 text-muted-foreground" />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-3">
        <div className="font-medium text-[12px] text-muted-foreground leading-5">
          Receive
        </div>
        <div className="flex min-w-0 items-center gap-3 pt-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="relative w-full overflow-hidden pr-[110px]">
              <span className="block h-8 font-semibold text-[24px] text-foreground leading-8">
                {(Number.parseFloat(amount) || 0).toFixed(2)}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <div className="flex h-full items-center gap-1.5 rounded-full border border-border px-1.5">
                  <CusdIcon className="size-5 shrink-0" />
                  <span className="font-medium text-[16px] text-primary leading-6">
                    {receiveToken.symbol}
                  </span>
                </div>
              </span>
            </div>
            <span className="font-medium text-[14px] text-muted-foreground leading-5">
              Balance: 0.00
            </span>
          </div>
        </div>
      </div>

      <Button
        className="mt-4 h-10 w-full cursor-pointer rounded-md"
        disabled={!isConnected || !isValidAmount || !isSufficientBalance}
        size="lg"
      >
        {isConnected
          ? isSufficientBalance
            ? "Mint"
            : "Insufficient balance"
          : "Connect Wallet"}
      </Button>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="font-normal text-[14px] text-muted-foreground">
          {exchangeRate}
        </span>
        <span className="font-normal text-[14px] text-muted-foreground">
          {fee}
        </span>
      </div>
    </>
  );
}
