import { orpc } from "@/shared/api/orpc";

export const userQueries = {
  all: () => ["user"] as const,
  current: () => orpc.privateData.queryOptions(),
};
