import { queryOptions } from "@tanstack/react-query";
import { authClient } from "@/shared/api";

export const accountQueries = {
  all: () => ["account"] as const,
  list: () =>
    queryOptions({
      queryKey: [...accountQueries.all(), "list"] as const,
      queryFn: async () => {
        const res = await authClient.listAccounts();
        return res.data;
      },
    }),
};
