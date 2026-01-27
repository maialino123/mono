import { useMutation } from "@tanstack/react-query";
import { todoQueries } from "@/entities/todo";
import { orpc, queryClient } from "@/shared";

export function useToggleTodo() {
  return useMutation(
    orpc.todo.toggle.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: todoQueries.all() });
      },
    }),
  );
}
