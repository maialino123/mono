import { Loader2 } from "lucide-react";

import { TodoItem } from "./todo-item";

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export interface TodoListProps {
  todos: Todo[] | undefined;
  isLoading: boolean;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

export function TodoList({ todos, isLoading, onToggle, onDelete }: TodoListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!todos?.length) {
    return <p className="py-4 text-center">No todos yet. Add one above!</p>;
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          id={todo.id}
          text={todo.text}
          completed={todo.completed}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
