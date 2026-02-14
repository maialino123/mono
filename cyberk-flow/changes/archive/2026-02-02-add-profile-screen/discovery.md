# Discovery: Add Profile Screen

## 1. Feature Summary
Add a profile page showing user info and linked authentication providers (e.g., email/password, Google). Allow users to link/unlink social providers from their account.

## 2. Architecture Snapshot

### Relevant Packages
| Package | Purpose | Key Files |
| --- | --- | --- |
| `packages/auth` | better-auth config (Google + email/password) | `src/index.ts` |
| `packages/db` | Auth schema (user, account, session tables) | `src/schema/auth.ts` |
| `apps/web` | Next.js frontend (FSD architecture) | `src/app/profile/`, `src/shared/api/auth-client.ts` |

### Entry Points
- API: `authClient.user.listAccounts()` (better-auth built-in client method)
- API: `authClient.linkSocial()` / `authClient.unlinkAccount()` (better-auth built-in)
- UI: `apps/web/src/app/profile/page.tsx` (empty directory exists)

## 3. Existing Patterns

### Similar Implementations
| Feature | Location | Pattern Used |
| --- | --- | --- |
| Sign-in screen | `screens/sign-in/` | `authClient.useSession()`, Card layout, FSD screen composition |
| Google sign-in button | `features/auth/sign-in/ui/google-sign-in-button.tsx` | `authClient.signIn.social({ provider: "google" })` |
| User menu | `widgets/layout/ui/user-menu.tsx` | `authClient.useSession()`, sign-out |

### Reusable Utilities
- `authClient` from `@/shared/api` — already configured with server URL
- shadcn Card, Button, Separator, Badge components
- Session hook: `authClient.useSession()`

## 4. Technical Constraints
- Dependencies: No new dependencies needed. better-auth client already has `listAccounts`, `linkSocial`, `unlinkAccount` built-in.
- Database: `account` table already stores `providerId` (e.g., "credential", "google") per user. No schema changes needed.
- Auth config: Currently supports `emailAndPassword` + `google` social provider (conditional on env vars).

## 5. External References
- better-auth docs: [User & Accounts](https://www.better-auth.com/docs/concepts/users-accounts) — `client.user.listAccounts()`, `linkSocial()`, `unlinkAccount()`
- better-auth docs: [OAuth](https://www.better-auth.com/docs/concepts/oauth) — social provider options, `disableSignUp`

## 6. Gap Analysis
| Component | Have | Need | Gap Size |
| --- | --- | --- | --- |
| DB Schema | `account` table with `providerId` | No change | None |
| Backend API | better-auth built-in endpoints | No change | None |
| Profile route | Empty `app/profile/` directory | `page.tsx` routing shell | Small |
| Profile screen | None | `screens/profile/` with composition | New |
| Account entity | None | `entities/account/` with query for listAccounts | New |
| Link/unlink features | None | `features/auth/link-provider/` with link/unlink UI | New |

## 7. Open Questions
- [x] Can better-auth whitelist Google provider? → **Yes**, there's no "whitelist" concept, but you simply configure only the providers you want in `socialProviders`. Only configured providers can be used. Currently only Google is configured.
- [ ] Should we allow unlinking the last account (could lock out user)? → better-auth prevents this by default unless `allowUnlinkingAll: true`.
