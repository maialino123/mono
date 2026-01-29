"use client";

import { cn } from "@/shared/lib/utils";
import { StatusIndicator } from "@/shared/ui/status-indicator";
import { WITHDRAW_STATUS_DISPLAY, type Withdraw } from "../model/types";

interface WithdrawItemProps {
  withdraw: Withdraw;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function WithdrawItem({ withdraw }: WithdrawItemProps) {
  const isReady = withdraw.status === "ready";
  const requestedDate = withdraw.requestedAt ? formatDate(withdraw.requestedAt) : "";
  const claimableDate = withdraw.claimableAt ? formatDate(withdraw.claimableAt) : "";
  const statusIndicatorColor = withdraw.status === "pending" ? "#FACC15" : "#10B981";

  return (
    <div
      className={cn("rounded-xl border border-border bg-background p-3 transition-opacity", !isReady && "opacity-50")}
    >
      <div className="space-y-[2px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[6px]">
            <StatusIndicator color={statusIndicatorColor} />
            <span
              className={cn(
                "text-center font-medium text-[14px] leading-6",
                isReady ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {WITHDRAW_STATUS_DISPLAY[withdraw.status]}
            </span>
          </div>
          <span
            className={cn(
              "text-center font-medium text-[14px] leading-6",
              isReady ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {withdraw.amount.toLocaleString()} {withdraw.token.symbol}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-nowrap font-normal text-[12px] text-muted-foreground leading-5">
            Requested: {requestedDate}
          </span>
          {withdraw.claimableAt && (
            <span className="text-nowrap font-normal text-[12px] text-muted-foreground leading-5">
              Claims in: {claimableDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
