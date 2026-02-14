## 1. Feature: Sign-In Form

- [x] 1.1 Create `features/auth/sign-in/ui/sign-in-form.tsx` — client component with email/password form using shadcn `Input`, `Button`, `Label`, `Card`. Call `authClient.signIn.email()` on submit. Show error on failure. Redirect to `/` on success via `useRouter().push("/")`.
- [x] 1.2 Create `features/auth/sign-in/ui/google-sign-in-button.tsx` — client component with "Sign in with Google" button. Call `authClient.signIn.social({ provider: "google", callbackURL: "/" })`.
- [x] 1.3 Create `features/auth/sign-in/index.ts` — barrel export for `SignInForm` and `GoogleSignInButton`.

## 2. Screen: Sign-In Page

- [x] 2.1 Create `screens/sign-in/ui/sign-in-screen.tsx` — compose `SignInForm` and `GoogleSignInButton` in a centered card layout with divider ("or continue with").
- [x] 2.2 Create `screens/sign-in/index.ts` — barrel export for `SignInScreen`.

## 3. App Route

- [x] 3.1 Create `app/sign-in/page.tsx` — import and render `SignInScreen`. Redirect to `/` if user is already authenticated (check session client-side).

## 4. Header Integration

- [x] 4.1 Update `widgets/layout/ui/user-menu.tsx` — change "Sign In" `<Link href="/">` to `<Link href="/sign-in">`.

## 5. Verification

- [x] 5.1 Run `bun run check-types` — ensure no type errors.
- [x] 5.2 Run `bun run check` — ensure lint/format passes.
