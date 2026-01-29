import { orpc } from "@/shared/api";

export const userQueries = {
  all: () => ["user"] as const,
  current: () => orpc.privateData.queryOptions(),
};
