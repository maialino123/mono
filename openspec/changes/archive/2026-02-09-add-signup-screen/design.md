# Design: Add Signup Screen

## Goals / Non-Goals
- **Goals**: Provide email/password + Google signup, consistent with sign-in UX
- **Non-Goals**: Email verification, password strength meter, CAPTCHA (future work)

## Architecture

Mirrors the sign-in flow exactly across FSD layers:

```
app/sign-up/page.tsx → screens/sign-up/ → features/auth/sign-up/ → shared/api (authClient)
```

## Gap Analysis

| Component | Have | Need | Gap |
| --- | --- | --- | --- |
| Backend | `emailAndPassword: { enabled: true }` | `signUp.email()` | None |
| Feature | `features/auth/sign-in/` | `features/auth/sign-up/` | New (mirror) |
| Screen | `screens/sign-in/` | `screens/sign-up/` | New (mirror) |
| Route | `app/sign-in/` | `app/sign-up/` | New (mirror) |
| Cross-links | None | Links between sign-in/sign-up | Small mod |

## Decisions

### Mirror Sign-In Pattern
The sign-up screen will follow the exact same FSD structure and UI layout as sign-in. The form adds a `name` field and uses `authClient.signUp.email()` instead of `signIn.email()`.

### Reuse Google Button
The `GoogleSignInButton` from `features/auth/sign-in` works for both sign-in and sign-up (Google OAuth handles both). It will be re-exported or imported directly.

## Risk Map

| Component | Risk Level | Reason | Verification |
| --- | --- | --- | --- |
| SignUpForm | LOW | Mirrors SignInForm, uses built-in better-auth API | Manual test |
| Screen composition | LOW | Identical pattern to sign-in screen | Visual check |
| Cross-navigation links | LOW | Simple anchor/Link additions | Visual check |

## Open Questions
- None — straightforward mirror of existing pattern
