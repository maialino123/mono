# FSD Layers Reference

## Layer Hierarchy

```
┌─────────────────────────────────────────────────┐
│  app/       Next.js routing shell, providers    │ ← No slices!
├─────────────────────────────────────────────────┤
│  screens/   FSD page composition                │ ← Named screens/ to avoid Next.js conflict
├─────────────────────────────────────────────────┤
│  widgets/   Large reusable UI blocks            │
├─────────────────────────────────────────────────┤
│  features/  User actions (MUTATIONS)            │
├─────────────────────────────────────────────────┤
│  entities/  Business data (GET/SEARCH + Queries)│
├─────────────────────────────────────────────────┤
│  shared/    UI kit, utilities, ORPC client      │ ← No slices!
└─────────────────────────────────────────────────┘
```

## Key Principles

1. **App & Shared have NO slices** - directly contain segments
2. **Not everything needs to be a feature** - only create feature if reused on multiple pages
3. **Entity relationships** - business logic of entity interactions goes in higher layers (Features, Screens)
4. **Widgets are optional** - only create if UI block is reused OR page has multiple large independent blocks
5. **screens/ instead of pages/** - to avoid conflict with Next.js `pages/` directory

---

## app/ Layer

**Purpose:** Next.js routing shell, delegates to FSD screens.

```tsx
// app/dashboard/page.tsx
import { DashboardPage } from "@/screens/dashboard";

export const metadata = { title: "Dashboard" };

export default function Page() {
  return <DashboardPage />;
}

// app/posts/[id]/page.tsx
import { PostDetailPage } from "@/screens/post-detail";

export default function Page({ params }: { params: { id: string } }) {
  return <PostDetailPage postId={params.id} />;
}
```

---

## screens/ Layer

**Purpose:** Page composition - combines widgets, features, entities.

### Structure

```
screens/dashboard/
├── ui/
│   └── dashboard-page.tsx
└── index.ts
```

```tsx
// screens/dashboard/ui/dashboard-page.tsx
"use client";
import { Header } from "@/widgets/header";
import { PostList } from "@/entities/post";
import { CreatePostButton } from "@/features/create-post";

export function DashboardPage() {
  return (
    <main>
      <Header />
      <CreatePostButton />
      <PostList />
    </main>
  );
}

// screens/dashboard/index.ts
export { DashboardPage } from "./ui/dashboard-page";
```

---

## entities/ Layer

**Purpose:** Business data with GET/SEARCH operations using ORPC Query Factory pattern.

### Structure

```
entities/post/
├── api/
│   └── post.queries.ts     # ORPC query factory
├── model/
│   ├── types.ts            # Custom domain types (optional)
│   └── store.ts            # Zustand store (optional)
├── ui/
│   ├── post-card.tsx
│   └── post-list.tsx
└── index.ts
```

### Query Factory (post.queries.ts)

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

### Model Layer (Optional)

```tsx
// entities/post/model/types.ts
// Only create if you need frontend-specific transformations
export interface PostWithMeta {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  // Frontend-only properties
  isBookmarked: boolean;
  formattedDate: string;
}
```

### Public API (index.ts)

```tsx
// entities/post/index.ts
export { postQueries } from "./api/post.queries";
export { PostCard } from "./ui/post-card";
export type { PostWithMeta } from "./model/types";
```

---

## features/ Layer

**Purpose:** User actions that MUTATE data.

### ⚠️ Important: Not everything needs to be a feature!

Create a feature slice only when:

- The interaction is **reused on multiple pages**
- It represents a **significant product capability**

If an action is only used on one page, keep it in that page slice.

### Structure

```
features/create-post/
├── api/
│   └── use-create-post.ts   # ORPC mutation hook
├── ui/
│   └── create-post-form.tsx
├── model/
│   └── schema.ts            # Zod validation
└── index.ts
```

### Mutation Hook with ORPC

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

### Feature UI

```tsx
// features/create-post/ui/create-post-form.tsx
"use client";
import { useCreatePost } from "../api/use-create-post";

export function CreatePostForm({ onSuccess }: { onSuccess?: () => void }) {
  const { mutateAsync, isPending } = useCreatePost();

  const handleSubmit = async (data: FormData) => {
    await mutateAsync({ title: data.get("title") as string });
    onSuccess?.();
  };

  return (
    <form action={handleSubmit}>
      <input name="title" required />
      <button disabled={isPending}>Create</button>
    </form>
  );
}
```

---

## widgets/ Layer

**Purpose:** Large self-contained UI blocks composing features/entities.

### ⚠️ When to create a widget:

- UI block is **reused across multiple pages**, OR
- Page has **multiple large independent blocks**

If a UI block makes up most of a page and is never reused, keep it **inside the page slice**.

```tsx
// widgets/header/ui/header.tsx
import { Logo } from "@/shared/ui";
import { UserMenu } from "@/entities/user";
import { SearchBar } from "@/features/search";

export function Header() {
  return (
    <header>
      <Logo />
      <SearchBar />
      <UserMenu />
    </header>
  );
}
```

---

## shared/ Layer

**Purpose:** Reusable code with no business logic.

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
export { client, orpc, queryClient, link } from "./api/orpc";
```

---

## app/ Layer

**Purpose:** Next.js routing shell, delegates to FSD pages.

```tsx
// app/dashboard/page.tsx
import { DashboardPage } from "@/screens/dashboard";

export const metadata = { title: "Dashboard" };

export default function Page() {
  return <DashboardPage />;
}
```
