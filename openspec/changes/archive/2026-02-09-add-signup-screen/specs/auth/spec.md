## ADDED Requirements

### Requirement: Email/Password Sign-Up

The system SHALL provide an email/password sign-up form at `/sign-up` that creates a new user account via better-auth's `signUp.email()`.

#### Scenario: Successful email sign-up

- **WHEN** user enters name, email, and password and submits the form
- **THEN** the system creates the account and redirects to `/`

#### Scenario: Failed email sign-up

- **WHEN** user submits with an already-registered email or invalid data
- **THEN** the system displays the error message from better-auth without navigating away

### Requirement: Google Social Sign-Up

The system SHALL provide a "Sign up with Google" button on the sign-up page that creates/authenticates users via the same `signIn.social({ provider: "google" })` flow.

#### Scenario: Google sign-up flow

- **WHEN** user clicks "Sign up with Google"
- **THEN** the system initiates Google OAuth and redirects to `/` on success

### Requirement: Post-Signup Redirect

The system SHALL automatically redirect authenticated users from `/sign-up` to `/`.

#### Scenario: Already authenticated user visits sign-up

- **WHEN** an authenticated user navigates to `/sign-up`
- **THEN** the system redirects them to `/`

### Requirement: Navigation Between Sign-In and Sign-Up

The sign-in page SHALL include a link to `/sign-up`, and the sign-up page SHALL include a link to `/sign-in`.

#### Scenario: Cross-navigation

- **WHEN** unauthenticated user is on sign-in page
- **THEN** a "Don't have an account? Sign up" link navigates to `/sign-up`
- **AND** vice versa on the sign-up page with "Already have an account? Sign in"
