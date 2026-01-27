# FSD Import Rules

## Core Rule

**Import only from layers strictly below. Never import from same layer.**

```
app/      → screens, widgets, features, entities, shared
screens/  → widgets, features, entities, shared
widgets/  → features, entities, shared
features/ → entities, shared
entities/ → shared
shared/   → (nothing)
```

## ❌ Violations

```tsx
// entities/post/ui/post-card.tsx
import { UserAvatar } from "@/entities/user"; // ❌ Same layer!

// features/create-post/ui/form.tsx
import { useAuth } from "@/features/auth"; // ❌ Same layer!

// shared/ui/button.tsx
import { UserCard } from "@/entities/user"; // ❌ Higher layer!
```

## ✅ Correct Examples

```tsx
// app/dashboard/page.tsx
import { DashboardPage } from "@/screens/dashboard"; // ✅

// screens/dashboard/ui/dashboard-page.tsx
import { Header } from "@/widgets/header"; // ✅
import { CreatePostButton } from "@/features/post"; // ✅
import { PostList } from "@/entities/post"; // ✅

// features/create-post/api/use-create-post.ts
import { postQueries } from "@/entities/post"; // ✅
import { orpc, queryClient } from "@/shared"; // ✅

// entities/post/api/post.queries.ts
import { orpc } from "@/shared"; // ✅
```

## Cross-Slice Patterns

### Pattern 0: @x Notation (Entity Cross-Imports)

**Only use on Entities layer** when entities reference each other:

```
entities/
├── artist/
│   ├── @x/
│   │   └── song.ts    # Special public API for song entity
│   └── index.ts
└── song/
    └── index.ts
```

```tsx
// entities/artist/@x/song.ts
export { artistQueries } from "../api/artist.queries";
export type { Artist } from "../model/types";

// entities/song/model/types.ts
import type { Artist } from "@/entities/artist/@x/song";

export interface Song {
  id: string;
  title: string;
  artist: Artist; // Cross-reference
}
```

**Note:** Minimize cross-imports. Prefer keeping entity relationships in higher layers.

### Pattern 1: Slots/Render Props

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

// app/feed/page.tsx - Compose in higher layer
<PostCard
  post={post}
  authorSlot={<UserAvatar userId={post.authorId} />}
  actionsSlot={<LikeButton postId={post.id} />}
/>;
```

### Pattern 2: Props Passing

```tsx
// ❌ Entity fetching other entity
export function PostCard({ post }) {
  const { data: author } = useUser(post.authorId); // Violation!
}

// ✅ Accept data as prop
export function PostCard({ post, author }: PostCardProps) {
  return <span>{author?.name}</span>;
}
```

## Quick Reference

| From      | Can Import                                   |
| --------- | -------------------------------------------- |
| app/      | screens, widgets, features, entities, shared |
| screens/  | widgets, features, entities, shared          |
| widgets/  | features, entities, shared                   |
| features/ | entities, shared                             |
| entities/ | shared                                       |
| shared/   | (nothing)                                    |

**Type imports allowed across boundaries.**
