# Discovery: Add Signup Screen

## 1. Feature Summary

Add an email/password signup screen at `/sign-up` that allows new users to create an account, mirroring the existing sign-in flow using better-auth's `signUp.email()`.

## 2. Architecture Snapshot

### Relevant Packages
| Package | Purpose | Key Files |
| --- | --- | --- |
| `packages/auth` | better-auth config, `emailAndPassword: { enabled: true }` | `src/index.ts` |
| `apps/web/src/features/auth/sign-in` | Sign-in mutation feature (pattern reference) | `ui/sign-in-form.tsx`, `ui/google-sign-in-button.tsx` |
| `apps/web/src/screens/sign-in` | Sign-in screen composition | `ui/sign-in-screen.tsx` |
| `apps/web/src/shared/api` | `authClient` (better-auth client) | — |

### Entry Points
- UI: `apps/web/src/app/sign-up/page.tsx` (new)
- API: better-auth built-in `signUp.email()` — no backend changes needed

## 3. Existing Patterns

### Similar Implementations
| Feature | Location | Pattern Used |
| --- | --- | --- |
| Sign-in form | `features/auth/sign-in/ui/sign-in-form.tsx` | `authClient.signIn.email()` with loading/error state |
| Sign-in screen | `screens/sign-in/ui/sign-in-screen.tsx` | Card layout, session redirect, Google social button |
| Google sign-in | `features/auth/sign-in/ui/google-sign-in-button.tsx` | `authClient.signIn.social()` |

### Reusable Utilities
- `authClient` from `@/shared/api` — has `signUp.email()` method built-in
- `safeRedirect` from `@/shared/lib` — for post-signup redirect
- shadcn Card, Input, Label, Button, Separator — all already used in sign-in

## 4. Technical Constraints
- Dependencies: None new — better-auth already supports `signUp.email()` with `emailAndPassword: { enabled: true }`
- Build Requirements: None
- Database: No schema changes — better-auth auto-creates user records

## 5. External References
- better-auth docs: `signUp.email({ email, password, name })` client API

## 6. Gap Analysis (Synthesized)
| Component | Have | Need | Gap Size |
| --- | --- | --- | --- |
| Backend API | `emailAndPassword: { enabled: true }` | `signUp.email()` endpoint | None (built-in) |
| Feature layer | `features/auth/sign-in/` | `features/auth/sign-up/` | New (mirror) |
| Screen layer | `screens/sign-in/` | `screens/sign-up/` | New (mirror) |
| App route | `app/sign-in/page.tsx` | `app/sign-up/page.tsx` | New (mirror) |
| Sign-in link | — | Link from sign-in to sign-up | Small mod |

## 7. Open Questions
- [x] Does better-auth require `name` field for signup? — Optional, but good UX to include.

### Tracks Used
- **Architecture Snapshot**: Mapped all affected layers
- **Internal Patterns**: Sign-in flow is the direct pattern to mirror
- **Skipped External Patterns**: No novel architecture, standard auth flow
- **Skipped Constraint Check**: No new dependencies
