import { orpc } from "@/shared/api/orpc";

type ListInputType = Exclude<Parameters<typeof orpc.todo.list.queryOptions>["0"]["input"], symbol>;

export const todoQueries = {
  all: () => ["todo"] as const,
  list: (params: ListInputType = {}) =>
    orpc.todo.list.queryOptions({
      input: { page: 1, limit: 10, ...params },
      queryKey: [...todoQueries.all(), "list", params],
    }),
};
