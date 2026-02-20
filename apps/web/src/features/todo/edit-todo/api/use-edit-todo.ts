import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { todoQueries } from "@/entities/todo";
import { orpc, queryClient } from "@/shared/api";

export function useEditTodo() {
  return useMutation(
    orpc.todo.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: todoQueries.all() });
        toast.success("Todo updated");
      },
    }),
  );
}
