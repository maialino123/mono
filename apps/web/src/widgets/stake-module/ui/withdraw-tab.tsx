"use client";

import { useMemo } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/shadcn/button";
import type { Withdraw } from "../model/types";
import { WithdrawItem } from "./withdraw-item";

const MOCK_WITHDRAWS: Withdraw[] = [
  {
    id: "1",
    status: "pending",
    requestedAt: "2026-01-06",
    claimableAt: "2026-01-13",
    amount: 115788.12,
    token: { symbol: "USDT" },
  },
  {
    id: "2",
    status: "ready",
    requestedAt: "2026-01-06",
    claimableAt: "2026-01-13",
    amount: 115788.12,
    token: { symbol: "USDT" },
  },
  {
    id: "3",
    status: "ready",
    requestedAt: "2026-01-06",
    claimableAt: "2026-01-13",
    amount: 115788.12,
    token: { symbol: "USDT" },
  },
];

export function WithdrawTab() {
  const activeWithdraws = useMemo(
    () => MOCK_WITHDRAWS.filter((w) => w.status === "pending" || w.status === "ready"),
    [],
  );
  const readyWithdraws = useMemo(() => activeWithdraws.filter((w) => w.status === "ready"), [activeWithdraws]);
  const isEmpty = activeWithdraws.length === 0;

  return (
    <div className={cn("space-y-4")}>
      {!isEmpty && (
        <div className="flex items-center justify-center">
          <span className="text-center font-medium text-[14px] text-foreground leading-6">
            Withdraw Requests ({activeWithdraws.length})
          </span>
        </div>
      )}

      <div className="space-y-3">
        {isEmpty ? (
          <div className="flex h-[184px] flex-col items-center justify-center gap-2">
            <span className="text-center font-semibold text-[18px] text-foreground leading-7">
              No withdrawal requests
            </span>
            <span className="text-center font-normal text-[16px] text-muted-foreground leading-6">
              You haven&apos;t requested withdrawals yet.
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {activeWithdraws.map((withdraw) => (
              <WithdrawItem key={withdraw.id} withdraw={withdraw} />
            ))}
          </div>
        )}
      </div>

      <Button className="h-10 w-full cursor-pointer rounded-md" disabled={readyWithdraws.length === 0} size="lg">
        Withdraw All
      </Button>
    </div>
  );
}
