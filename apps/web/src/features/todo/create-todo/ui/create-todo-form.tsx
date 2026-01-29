"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/shadcn/button";
import { Input } from "@/shared/shadcn/input";

import { useCreateTodo } from "../api/use-create-todo";

export interface CreateTodoFormProps {
  onSuccess?: () => void;
}

export function CreateTodoForm({ onSuccess }: CreateTodoFormProps) {
  const [text, setText] = useState("");
  const { mutate, isPending } = useCreateTodo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      mutate(
        { text },
        {
          onSuccess: () => {
            setText("");
            onSuccess?.();
          },
        },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex items-center space-x-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new task..."
        disabled={isPending}
      />
      <Button type="submit" disabled={isPending || !text.trim()}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
      </Button>
    </form>
  );
}
