# Discovery: Add Sign-In Screen

## 1. Feature Summary

Create a dedicated sign-in screen with email/password and Google login, integrated into the existing header's "Sign In" button, with automatic redirect after successful authentication.

## 2. Architecture Snapshot

### Relevant Packages
| Package | Purpose | Key Files |
| --- | --- | --- |
| `packages/auth` | better-auth server config (email+password, Google social) | `src/index.ts` |
| `apps/web/src/shared/api` | Auth client (better-auth/react) | `auth-client.ts` |
| `apps/web/src/widgets/layout` | Header with Sign In button | `ui/header.tsx`, `ui/user-menu.tsx` |
| `apps/web/src/features/auth` | Existing auth features (link-google, sign-out) — mostly empty | `link-google/`, `sign-out/` |

### Entry Points
- **Auth Server**: `packages/auth/src/index.ts` — `emailAndPassword: { enabled: true }`, Google social provider configured
- **Auth Client**: `apps/web/src/shared/api/auth-client.ts` — `createAuthClient` from `better-auth/react`
- **Header UI**: `apps/web/src/widgets/layout/ui/user-menu.tsx` — "Sign In" button links to `/` (needs change)
- **App Router**: `apps/web/src/app/` — no `/sign-in` route exists yet

## 3. Existing Patterns

### Similar Implementations
| Feature | Location | Pattern Used |
| --- | --- | --- |
| Sign Out | `features/auth/sign-out/` | Feature slice (empty, but scaffolded) |
| Link Google | `features/auth/link-google/` | Feature slice (empty, but scaffolded) |
| User Session | `widgets/layout/ui/user-menu.tsx` | `authClient.useSession()` for session check |
| Todo CRUD | `features/todo/` | Mutation hooks + UI pattern |

### Reusable Utilities
- `authClient` from `@/shared/api` — provides `signIn.email()`, `signIn.social()`, `useSession()`
- shadcn components: `Button`, `Input`, `Card`, `Label` — available for form UI
- `cn()` from `@/shared/lib` — class merging utility

## 4. Technical Constraints
- **Dependencies**: `better-auth/react` already installed, provides `authClient.signIn.email()` and `authClient.signIn.social()`
- **Backend**: Email/password and Google social providers already configured in `packages/auth`
- **No sign-up yet**: Scope is sign-in only (sign-up can be added later)
- **FSD Rules**: Sign-in is a mutation → belongs in `features/auth/sign-in/`

## 5. External References
- better-auth docs: email/password sign-in, social sign-in (Google)
- Next.js App Router: route groups, `useRouter` for navigation

## 6. Gap Analysis (Synthesized)
| Component | Have | Need | Gap Size |
| --- | --- | --- | --- |
| Auth Backend | Email+password + Google configured | Nothing | None |
| Auth Client | `authClient` with signIn methods | Nothing | None |
| Sign-In Screen | Nothing | `screens/sign-in/` with form UI | New |
| Sign-In Feature | Empty `features/auth/` scaffolds | `features/auth/sign-in/` with form + hooks | New |
| App Route | No `/sign-in` route | `app/sign-in/page.tsx` | New |
| Header Integration | "Sign In" links to `/` | Link to `/sign-in` | Small |
| Post-Login Redirect | None | Navigate to `/` (or previous page) after login | Small |

## 7. Open Questions
- [x] Sign-up included? → No, sign-in only for now
- [x] Redirect destination after login? → Default to `/` (home)
