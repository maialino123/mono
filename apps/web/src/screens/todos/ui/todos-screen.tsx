"use client";

import { useQuery } from "@tanstack/react-query";

import { TodoList, todoQueries } from "@/entities/todo";
import { CreateTodoForm, useDeleteTodo, useToggleTodo } from "@/features/todo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared";

export function TodosScreen() {
  const { data: todos, isLoading } = useQuery(todoQueries.list());
  const toggleMutation = useToggleTodo();
  const deleteMutation = useDeleteTodo();

  const handleToggle = (id: number, completed: boolean) => {
    toggleMutation.mutate({ id, completed: !completed });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Todo List</CardTitle>
          <CardDescription>Manage your tasks efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTodoForm />
          <TodoList todos={todos} isLoading={isLoading} onToggle={handleToggle} onDelete={handleDelete} />
        </CardContent>
      </Card>
    </div>
  );
}
