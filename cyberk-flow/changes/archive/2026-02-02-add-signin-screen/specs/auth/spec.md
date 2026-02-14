## ADDED Requirements

### Requirement: Email/Password Sign-In

The system SHALL provide an email/password sign-in form at `/sign-in` that authenticates users via better-auth's `signIn.email()`.

#### Scenario: Successful email sign-in

- **WHEN** user enters valid email and password and submits the form
- **THEN** the system authenticates the user and redirects to `/`

#### Scenario: Failed email sign-in

- **WHEN** user enters invalid credentials and submits
- **THEN** the system displays an error message from better-auth without navigating away

### Requirement: Google Social Sign-In

The system SHALL provide a "Sign in with Google" button that authenticates users via better-auth's `signIn.social({ provider: "google" })`.

#### Scenario: Google sign-in flow

- **WHEN** user clicks "Sign in with Google"
- **THEN** the system initiates the Google OAuth flow and redirects to `/` on success

### Requirement: Post-Login Redirect

The system SHALL automatically redirect authenticated users from `/sign-in` to `/` (home page).

#### Scenario: Already authenticated user visits sign-in

- **WHEN** an authenticated user navigates to `/sign-in`
- **THEN** the system redirects them to `/`

### Requirement: Header Sign-In Button

The header "Sign In" button SHALL link to `/sign-in`.

#### Scenario: Unauthenticated user clicks Sign In

- **WHEN** unauthenticated user clicks "Sign In" in the header
- **THEN** the browser navigates to `/sign-in`
