import { orpc } from "@/shared/api/orpc";

export interface TodoListParams {
  page?: number;
  limit?: number;
  completed?: boolean;
  text?: string;
  sortBy?: "createdAt" | "text";
  sortOrder?: "asc" | "desc";
}

export const todoQueries = {
  all: () => ["todo"] as const,
  list: (params: TodoListParams = {}) =>
    orpc.todo.list.queryOptions({
      input: { page: 1, limit: 10, ...params },
      queryKey: [...todoQueries.all(), "list", params],
    }),
};
