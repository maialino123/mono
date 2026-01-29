"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { TodoList, todoQueries } from "@/entities/todo";
import { CreateTodoForm, useDeleteTodo, useToggleTodo } from "@/features/todo";
import { Button } from "@/shared/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/shadcn/card";

export function TodosScreen() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery(todoQueries.list({ page }));
  const toggleMutation = useToggleTodo();
  const deleteMutation = useDeleteTodo();

  const handleToggle = (id: number, completed: boolean) => {
    toggleMutation.mutate({ id, completed: !completed });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Todo List</CardTitle>
          <CardDescription>
            Manage your tasks efficiently
            {data && ` • ${data.total} total`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CreateTodoForm />
          <TodoList todos={data?.items} isLoading={isLoading} onToggle={handleToggle} onDelete={handleDelete} />
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
                Previous
              </Button>
              <span className="text-muted-foreground text-sm">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
