import { orpc } from "@/shared/api/orpc";

export const todoQueries = {
  all: () => ["todo"] as const,
  list: () =>
    orpc.todo.getAll.queryOptions({
      queryKey: [...todoQueries.all(), "list"],
    }),
};
