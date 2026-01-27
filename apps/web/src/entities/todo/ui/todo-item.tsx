import { Trash2 } from "lucide-react";

import { Button, Checkbox } from "@/shared";

export interface TodoItemProps {
  id: number;
  text: string;
  completed: boolean;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

export function TodoItem({ id, text, completed, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className="flex items-center justify-between rounded-md border p-2">
      <div className="flex items-center space-x-2">
        <Checkbox checked={completed} onCheckedChange={() => onToggle(id, completed)} id={`todo-${id}`} />
        <label htmlFor={`todo-${id}`} className={`${completed ? "text-muted-foreground line-through" : ""}`}>
          {text}
        </label>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onDelete(id)} aria-label="Delete todo">
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}
