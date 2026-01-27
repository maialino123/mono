---
name: cyberk-fsd-fe
description: Build Next.js applications using Feature Sliced Design (FSD) methodology with ORPC. Organizes code into layers (app, screens, widgets, features, entities, shared) with clear separation - entities for data fetching/search, features for mutations. Uses ORPC for type-safe API calls and React Query for caching. Use when creating Next.js apps with FSD architecture, organizing React code by business domain, or implementing scalable frontend structure.
---

# CyberK FSD Frontend (ORPC)

Next.js + Feature Sliced Design with ORPC and React Query patterns.

## When to Use This Skill

- Building Next.js applications with scalable architecture
- Organizing React code by business domain
- Implementing data fetching with ORPC + React Query
- Setting up FSD layer structure (app, screens, widgets, features, entities, shared)
- Creating reusable entity components with ORPC query patterns
- Implementing mutation features with proper cache invalidation

## Core Principles

- **Entities**: GET/SEARCH operations + ORPC Query Options
- **Features**: MUTATIONS only + ORPC Mutation Hooks
- **Import Rule**: Only import from layers below via their `index.ts` exports
- **Types**: Types come directly from ORPC client (type-safe end-to-end)
- **Note**: We use `screens/` instead of `pages/` to avoid conflict with Next.js `pages/` directory

## Project Structure

```
src/
├── app/                    # Next.js routing shell
├── screens/                # FSD page composition (named screens to avoid Next.js conflict)
├── widgets/                # Large UI blocks
├── features/               # MUTATIONS (useMutation hooks)
│   └── create-post/
│       ├── api/
│       │   └── use-create-post.ts
│       ├── ui/
│       └── index.ts
├── entities/               # GET/SEARCH (ORPC Query Options)
│   └── post/
│       ├── api/
│       │   └── post.queries.ts   # ORPC query factory
│       ├── model/
│       │   ├── types.ts          # Custom domain models (if needed)
│       │   └── store.ts          # Zustand store (optional)
│       ├── ui/
│       └── index.ts
└── shared/
    ├── api/
    │   └── orpc.ts               # ORPC client + React Query client
    ├── ui/
    └── lib/
```

## Layer Import Rules

```
app/      → screens, widgets, features, entities, shared (via index.ts)
screens/  → widgets, features, entities, shared (via index.ts)
widgets/  → features, entities, shared (via index.ts)
features/ → entities, shared (via index.ts)
entities/ → shared (via index.ts)
shared/   → (nothing)
```

**Rules:**

- Never import from same layer!
- Only import what's exported from `index.ts` of lower layers

---

## Types from ORPC

Types are inferred directly from the ORPC client - fully type-safe end-to-end:

```tsx
// Types come from ORPC router definitions
// No need for separate ApiTypes - ORPC provides full type inference

// Access input/output types if needed:
import type { InferInput, InferOutput } from "@orpc/contract";
```

Only create custom types in `entities/{name}/model/` when you need:

- Transformed/enriched domain models
- Frontend-specific computed properties
- Different structure than backend response

---

## Entity Pattern (ORPC Query Factory)

### 1. Query Factory (post.queries.ts)

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

### 2. Model Layer (Optional - only if custom types needed)

```tsx
// entities/post/model/types.ts (only when different from API)
export interface PostWithMeta {
  id: string;
  title: string;
  isBookmarked: boolean; // Frontend-only property
  formattedDate: string; // Computed property
}
```

### 3. Zustand Store (Optional)

```tsx
// entities/post/model/store.ts
import { create } from "zustand";

interface PostStore {
  selectedPostId: string | null;
  setSelectedPost: (id: string | null) => void;
}

export const usePostStore = create<PostStore>((set) => ({
  selectedPostId: null,
  setSelectedPost: (id) => set({ selectedPostId: id }),
}));
```

### 4. Usage in Components

```tsx
import { useQuery } from "@tanstack/react-query";
import { postQueries } from "@/entities/post";

const { data: posts } = useQuery(postQueries.list({ page: 1 }));
const { data: post } = useQuery(postQueries.detail(id));
```

### 5. Public API (index.ts)

```tsx
// entities/post/index.ts
export { postQueries } from "./api/post.queries";
export { PostCard } from "./ui/post-card";
export { usePostStore } from "./model/store"; // if exists
export type { PostWithMeta } from "./model/types"; // only custom types
```

---

## Feature Pattern (ORPC Mutations)

### Mutation Hook

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

### Alternative: Direct ORPC Mutation Options

```tsx
// features/toggle-todo/api/use-toggle-todo.ts
import { useMutation } from "@tanstack/react-query";
import { orpc, queryClient } from "@/shared";

export const useToggleTodo = () => {
  return useMutation(
    orpc.todo.toggle.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["todos"] });
      },
    })
  );
};
```

### Feature UI

```tsx
// features/create-post/ui/create-post-form.tsx
"use client";
import { useCreatePost } from "../api/use-create-post";

export function CreatePostForm({ onSuccess }: { onSuccess?: () => void }) {
  const { mutateAsync, isPending } = useCreatePost();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await mutateAsync({ title: formData.get("title") as string });
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" required />
      <button disabled={isPending}>Create</button>
    </form>
  );
}
```

---

## Shared Layer

### ORPC Client

```tsx
// shared/api/orpc.ts
import type { AppRouterClient } from "@cyberk-flow/api/routers/index";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const link = new RPCLink({
  url: `${env.NEXT_PUBLIC_SERVER_URL}/rpc`,
  fetch(url, options) {
    return fetch(url, { ...options, credentials: "include" });
  },
});

export const client: AppRouterClient = createORPCClient(link);
export const orpc = createTanstackQueryUtils(client);
```

### Public Export

```tsx
// shared/index.ts
export { client, orpc, queryClient } from "./api/orpc";
```

---

## Cross-Slice UI (Slots Pattern)

```tsx
// entities/post/ui/post-card.tsx
interface PostCardProps {
  post: Post;
  authorSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
}

export function PostCard({ post, authorSlot, actionsSlot }: PostCardProps) {
  return (
    <Card>
      {authorSlot}
      <h3>{post.title}</h3>
      {actionsSlot}
    </Card>
  );
}

// Usage in screens/
<PostCard
  post={post}
  authorSlot={<UserAvatar userId={post.authorId} />}
  actionsSlot={<LikeButton postId={post.id} />}
/>;
```

---

## Decision Guide

**"Where should I put this code?"**

| Scenario                        | Layer                         | Reason                              |
| ------------------------------- | ----------------------------- | ----------------------------------- |
| ORPC client, query client       | `shared/api/`                 | Infrastructure, no business logic   |
| Reusable Button, Input          | `shared/ui/`                  | Generic UI kit                      |
| User, Post, Product data        | `entities/{name}/`            | Business domain entity              |
| GET/Search data + Query factory | `entities/{name}/api/`        | Read operations belong to entities  |
| Create/Update/Delete action     | `features/{action}-{entity}/` | Mutations are features              |
| Action used on ONE page only    | `screens/{page}/`             | No need for feature if not reused   |
| Large reused UI block           | `widgets/{name}/`             | Reused across pages                 |
| UI block for ONE page only      | `screens/{page}/ui/`          | Keep in page, not widget            |
| Page composition                | `screens/{name}/`             | Combine widgets, features, entities |
| Route definition                | `app/`                        | Next.js routing shell               |

**"Should I create a feature?"**

- ✅ YES if: Reused on 2+ pages
- ❌ NO if: Only used on 1 page → keep in page slice

**"Should I create a widget?"**

- ✅ YES if: Reused on 2+ pages OR page has multiple independent large blocks
- ❌ NO if: Only used on 1 page → keep in page slice

**"Entity A needs Entity B data?"**

- Prefer: Pass data via props from higher layer
- If must: Use `@x` notation (`entities/A/@x/B.ts`)

---

## Quick Checklist

**New Entity:**

- [ ] Create `api/{entity}.queries.ts` with ORPC query factory
- [ ] Create `model/types.ts` ONLY if custom domain models needed
- [ ] Create `model/store.ts` for Zustand store (optional)
- [ ] Export via `index.ts`

**New Feature:**

- [ ] Create `api/use-{action}-{entity}.ts` mutation hook with ORPC
- [ ] Import `orpc`, `queryClient` from `@/shared`
- [ ] Import query keys from entity's `index.ts` for invalidation
- [ ] Invalidate queries on success
- [ ] Create UI components

---

## Reference Navigation

**FSD Architecture:**

- [FSD Layers](./references/fsd-layers.md) - Layer hierarchy and patterns
- [FSD Segments](./references/fsd-segments.md) - Segment organization (api/, ui/, model/)
- [FSD Import Rules](./references/fsd-import-rules.md) - Dependency management

**Next.js Integration:**

- [App Router Architecture](./references/nextjs-app-router.md) - Routing, layouts, pages
- [Server Components](./references/nextjs-server-components.md) - RSC patterns, streaming
- [Optimization](./references/nextjs-optimization.md) - Images, fonts, bundles

**UI Components:**

- [RemixIcon Integration](./references/remix-icon-integration.md) - Icons usage

## Resources

- Feature Sliced Design: https://feature-sliced.design
- Next.js App Router: https://nextjs.org/docs
- ORPC: https://orpc.dev
- React Query: https://tanstack.com/query
- Zustand: https://zustand-demo.pmnd.rs
