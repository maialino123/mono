## 1. Feature Layer — Sign-Up Form

- [ ] 1.1 Create `features/auth/sign-up/ui/sign-up-form.tsx` — form with name, email, password fields using `authClient.signUp.email()`, loading/error state (mirror `sign-in-form.tsx`)
- [ ] 1.2 Create `features/auth/sign-up/index.ts` — export `SignUpForm`

## 2. Screen Layer — Sign-Up Screen

- [ ] 2.1 Create `screens/sign-up/ui/sign-up-screen.tsx` — Card layout with `SignUpForm`, Google button, session redirect logic, link to `/sign-in` (mirror `sign-in-screen.tsx`)
- [ ] 2.2 Create `screens/sign-up/index.ts` — export `SignUpScreen`

## 3. App Route

- [ ] 3.1 Create `app/sign-up/page.tsx` — render `<SignUpScreen />`

## 4. Cross-Navigation

- [ ] 4.1 Add "Don't have an account? Sign up" link to `screens/sign-in/ui/sign-in-screen.tsx`

## 5. Verification

- [ ] 5.1 Run `bun run check-types` — no type errors
- [ ] 5.2 Manual test: signup flow with email/password, Google, error case, redirect, cross-links
