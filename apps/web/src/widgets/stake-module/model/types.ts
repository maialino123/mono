export type { Token } from "@/shared/types/token";

export type WithdrawStatus = "pending" | "ready" | "completed" | "failed";

export const WITHDRAW_STATUS_DISPLAY: Record<WithdrawStatus, string> = {
  pending: "Pending",
  ready: "Ready to Withdraw",
  completed: "Completed",
  failed: "Failed",
};

export interface Withdraw {
  id: string;
  status: WithdrawStatus;
  claimedAt?: string;
  requestedAt?: string;
  claimableAt: string;
  amount: number;
  token: import("@/shared/types/token").Token;
}
