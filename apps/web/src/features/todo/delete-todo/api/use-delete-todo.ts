import { useMutation } from "@tanstack/react-query";
import { todoQueries } from "@/entities/todo";
import { orpc, queryClient } from "@/shared";

export function useDeleteTodo() {
  return useMutation(
    orpc.todo.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(todoQueries.list());
      },
    }),
  );
}
