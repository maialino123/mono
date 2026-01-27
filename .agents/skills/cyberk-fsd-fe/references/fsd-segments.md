# FSD Segments Reference

Segments group code by technical purpose within slices.

## Standard Segments

| Segment  | Purpose                                  |
| -------- | ---------------------------------------- |
| `ui/`    | React components                         |
| `api/`   | ORPC query factory, Mutation hooks       |
| `model/` | Domain types, schemas, stores            |
| `lib/`   | Slice-specific utilities                 |

---

## api/ Segment

### In Entities (ORPC Queries)

```
entities/post/api/
├── post.queries.ts       # ORPC query factory
└── index.ts
```

**post.queries.ts** - ORPC Query Factory:

```tsx
// entities/post/api/post.queries.ts
import { orpc } from "@/shared";

export const postQueries = {
  all: () => ["posts"],

  lists: () => [...postQueries.all(), "list"],
  list: (filter?: { page?: number; limit?: number }) =>
    orpc.posts.list.queryOptions({ input: filter }),

  details: () => [...postQueries.all(), "detail"],
  detail: (id: string) =>
    orpc.posts.get.queryOptions({ input: { id } }),
};
```

### In Features (ORPC Mutations)

```
features/create-post/api/
└── use-create-post.ts   # ORPC mutation hook only
```

```tsx
// features/create-post/api/use-create-post.ts
import { useMutation } from "@tanstack/react-query";
import { orpc, queryClient } from "@/shared";
import { postQueries } from "@/entities/post";

export const useCreatePost = () => {
  return useMutation(
    orpc.posts.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: postQueries.lists() });
      },
    })
  );
};
```

---

## ui/ Segment

```tsx
// entities/post/ui/post-card.tsx
interface PostCardProps {
  post: Post;
  actions?: React.ReactNode; // Slot for feature buttons
}

export function PostCard({ post, actions }: PostCardProps) {
  return (
    <Card>
      <h3>{post.title}</h3>
      {actions}
    </Card>
  );
}
```

---

## model/ Segment

**Types:**

```tsx
// entities/post/model/types.ts
// Only create if you need frontend-specific types
export interface PostWithMeta {
  id: string;
  title: string;
  content: string;
  authorId: string;
  // Frontend-only computed properties
  isBookmarked: boolean;
  formattedDate: string;
}

export interface PostsFilter {
  page?: number;
  limit?: number;
}
```

**Validation Schema:**

```tsx
// features/create-post/model/schema.ts
import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});
```

**Zustand Store:**

```tsx
// features/post-editor/model/store.ts
import { create } from "zustand";

interface EditorState {
  content: string;
  setContent: (content: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  content: "",
  setContent: (content) => set({ content }),
}));
```

---

## Public API (index.ts)

Each slice exports public API:

```tsx
// entities/post/index.ts
export { postQueries } from "./api/post.queries";
export { PostCard } from "./ui/post-card";
export type { PostWithMeta } from "./model/types";

// features/create-post/index.ts
export { useCreatePost } from "./api/use-create-post";
export { CreatePostForm } from "./ui/create-post-form";
```

---

## Naming Conventions

| Type            | Convention                | Example                  |
| --------------- | ------------------------- | ------------------------ |
| Components      | PascalCase                | `PostCard.tsx`           |
| Hooks           | camelCase, use prefix     | `use-create-post.ts`     |
| Queries factory | camelCase, Queries suffix | `post.queries.ts`        |
| Domain Types    | PascalCase                | `Post`, `PostsFilter`    |
