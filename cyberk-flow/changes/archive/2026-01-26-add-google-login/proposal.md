# Change: Add Google Login

## Why

To provide a seamless and popular alternative to email/password authentication, improving user onboarding and experience.

## What Changes

-   **Auth Config**: Enable Google OAuth provider in `better-auth` configuration.
-   **Environment**: Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` validations.
-   **UI**: Add "Sign in with Google" button to login and signup forms in `apps/web`.
-   **Documentation**: Add a guide for setting up Google OAuth credentials.

## Impact

-   **Affected Specs**: `auth`
-   **Affected Code**:
    -   `packages/auth/src/index.ts`
    -   `packages/env/src/server.ts`
    -   `apps/web/src/components/sign-in-form.tsx`
    -   `apps/web/src/components/sign-up-form.tsx`
