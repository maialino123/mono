import { Pencil, Trash2 } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/shared/shadcn/button";
import { Checkbox } from "@/shared/shadcn/checkbox";
import { Input } from "@/shared/shadcn/input";

export interface TodoItemProps {
  id: number;
  text: string;
  completed: boolean;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, text: string) => void;
}

export function TodoItem({ id, text, completed, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);
  const ignoreBlurRef = useRef(false);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = draftText.trim();
    if (trimmed && trimmed !== text) {
      onEdit(id, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftText(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      ignoreBlurRef.current = true;
      handleSave();
    } else if (e.key === "Escape") {
      ignoreBlurRef.current = true;
      handleCancel();
    }
  };

  const handleBlur = () => {
    if (ignoreBlurRef.current) {
      ignoreBlurRef.current = false;
      return;
    }
    handleSave();
  };

  const enterEditMode = () => {
    ignoreBlurRef.current = false;
    setDraftText(text);
    setIsEditing(true);
  };

  return (
    <li className="flex items-center justify-between rounded-md border p-2">
      <div className="flex min-w-0 flex-1 items-center space-x-2">
        <Checkbox checked={completed} onCheckedChange={() => onToggle(id, completed)} id={`todo-${id}`} />
        {isEditing ? (
          <Input
            ref={inputRef}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            maxLength={500}
            className="h-7 flex-1"
          />
        ) : (
          // biome-ignore lint/a11y/noStaticElementInteractions: double-click is supplementary; edit button provides keyboard access
          <span
            onDoubleClick={enterEditMode}
            className={`cursor-default ${completed ? "text-muted-foreground line-through" : ""}`}
          >
            {text}
          </span>
        )}
      </div>
      {!isEditing && (
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={enterEditMode} aria-label="Edit todo">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(id)} aria-label="Delete todo">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </li>
  );
}
