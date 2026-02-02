# Change: Add Sign-In Screen

## Why

The app has no dedicated sign-in page — the "Sign In" button on the header links to `/` with no login form. Users need a proper sign-in screen with email/password and Google login to authenticate.

## What Changes

- **New** sign-in screen at `/sign-in` with email/password form and Google login button
- **New** `features/auth/sign-in/` feature slice with sign-in form UI
- **Modified** header "Sign In" button to link to `/sign-in`
- **New** auto-redirect to home (`/`) after successful login

## Impact

- Affected specs: `auth`
- Affected code:
  - `apps/web/src/app/sign-in/page.tsx` (new route)
  - `apps/web/src/screens/sign-in/` (new screen)
  - `apps/web/src/features/auth/sign-in/` (new feature)
  - `apps/web/src/widgets/layout/ui/user-menu.tsx` (modify Sign In link)
