# Code Patterns & Segments

## Query Pattern (Entities)
Location: `entities/{name}/api/{name}.queries.ts`

```typescript
import { orpc } from "@/shared/api";

type ListInputType = Exclude<Parameters<typeof orpc.posts.list.queryOptions>["0"]["input"], symbol>;

export const postQueries = {
  all: () => ["posts"] as const,

  // Standard: Explicit queryKey hierarchy with helpers
  lists: () => [...postQueries.all(), "list"] as const,
  list: (filter: ListInputType) => orpc.posts.list.queryOptions({ 
    input: filter,
    queryKey: [...postQueries.lists(), filter] 
  }),

  details: () => [...postQueries.all(), "detail"] as const,
  detail: (id: string) => orpc.posts.get.queryOptions({ 
    input: { id },
    queryKey: [...postQueries.details(), id]
  }),
};
```

## Mutation Pattern (Features)
Location: `features/{action}/api/use-{action}.ts`

```typescript
import { useMutation } from "@tanstack/react-query";
import { orpc, queryClient } from "@/shared/api";
import { postQueries } from "@/entities/post"; 

export function useCreatePost() {
  return useMutation(
    orpc.posts.create.mutationOptions({
      onSuccess: () => {
        // Invalidate ONLY lists, keeping cache for existing details if safe
        queryClient.invalidateQueries({ 
          queryKey: postQueries.lists() 
        });
      },
    })
  );
}
```

## Non-ORPC Mutation Pattern (e.g., better-auth)

When the API client is not ORPC (e.g., `authClient` from better-auth), wrap calls in `useMutation` manually.
Important: non-ORPC clients may return `{ data, error }` instead of throwing — always check and throw on error.

Location: `features/{slice}/api/use-{action}.ts`

```typescript
import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/shared/api";

// See: apps/web/src/features/auth/sign-in/api/use-sign-in.ts
export function useSignIn() {
  return useMutation({
    mutationFn: async (vars: { email: string; pass: string }) => {
      const res = await authClient.signIn.email(vars);
      if (res.error) throw new Error(res.error.message ?? "Sign in failed");
      return res.data;
    },
  });
}
```

## Critical Rule: No Direct API Calls in UI

**NEVER** call API clients (`authClient`, `orpc`, `fetch`, etc.) directly inside UI components.
Always wrap them in `useQuery` (for reads) or `useMutation` (for writes) hooks in the `api/` segment.

```
BAD:  ui/sign-in-form.tsx → authClient.signIn.email(...)
GOOD: ui/sign-in-form.tsx → useSignIn() → api/use-sign-in.ts → authClient.signIn.email(...)
```

## File Segments
| Segment | Purpose | Example |
|---------|---------|---------|
| `ui/` | React Components (NO direct API calls) | `ui/post-card.tsx` |
| `api/` | Data Fetching (useQuery, useMutation) | `api/post.queries.ts`, `api/use-create-post.ts` |
| `model/` | Types, Stores, Schemas | `model/types.ts` |
| `lib/` | Helpers | `lib/post-utils.ts` |
