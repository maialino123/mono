# Change: Add Signup Screen

## Why

Users currently have no way to create a new account through the web app. A signup screen is needed to complement the existing sign-in flow.

## What Changes

- Add email/password signup form feature at `features/auth/sign-up/`
- Add signup screen at `screens/sign-up/` with Card layout matching sign-in
- Add Next.js route at `app/sign-up/page.tsx`
- Add navigation links between sign-in and sign-up pages
- Reuse Google sign-in button on signup screen for social registration

## Impact

- Affected specs: `auth/spec.md` (new signup requirements)
- Affected code:
  - `apps/web/src/features/auth/sign-up/` (new)
  - `apps/web/src/screens/sign-up/` (new)
  - `apps/web/src/app/sign-up/page.tsx` (new)
  - `apps/web/src/screens/sign-in/ui/sign-in-screen.tsx` (add link to sign-up)
