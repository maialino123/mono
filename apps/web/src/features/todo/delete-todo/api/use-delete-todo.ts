import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { todoQueries } from "@/entities/todo";
import { orpc, queryClient } from "@/shared/api";

export function useDeleteTodo() {
  return useMutation(
    orpc.todo.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: todoQueries.all() });
        toast.success("Todo deleted");
      },
    }),
  );
}
