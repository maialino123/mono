import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { todoQueries } from "@/entities/todo";
import { orpc, queryClient } from "@/shared";

export function useCreateTodo() {
  return useMutation(
    orpc.todo.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: todoQueries.all() });
        toast.success("Todo created");
      },
    }),
  );
}
