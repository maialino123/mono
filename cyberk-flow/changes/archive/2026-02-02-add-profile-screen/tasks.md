## 1. Entity: Account Query

- [x] 1.1 Create `entities/account/api/account.queries.ts` with a query hook wrapping `authClient.listAccounts()`
- [x] 1.2 Create `entities/account/index.ts` barrel export

## 2. Feature: Link/Unlink Provider

- [x] 2.1 Create `features/auth/link-provider/ui/link-google-button.tsx` — calls `authClient.linkSocial({ provider: "google" })`
- [x] 2.2 Create `features/auth/link-provider/ui/unlink-provider-button.tsx` — calls `authClient.unlinkAccount({ providerId })`, disabled when only 1 account
- [x] 2.3 Create `features/auth/link-provider/index.ts` barrel export

## 3. Screen: Profile

- [x] 3.1 Create `screens/profile/ui/profile-screen.tsx` — compose user info card + linked providers list using entities/features above
- [x] 3.2 Create `screens/profile/index.ts` barrel export

## 4. Route: Profile Page

- [x] 4.1 Create `app/profile/page.tsx` — render `<ProfileScreen />`

## 5. Verification

- [x] 5.1 Run `bun run check-types` — no new type errors
- [ ] 5.2 Manual test: visit `/profile` while signed in, verify user info and providers display
- [ ] 5.3 Manual test: link/unlink Google account from profile
