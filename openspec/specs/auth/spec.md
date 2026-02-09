# auth Specification

## Purpose
TBD - created by archiving change add-google-login. Update Purpose after archive.
## Requirements
### Requirement: Google OAuth Login

The system SHALL support user authentication via Google OAuth.

#### Scenario: Successful Google Login
- **WHEN** user clicks "Sign in with Google"
- **THEN** they are redirected to Google for authentication
- **AND** upon success, they are signed in to the application

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

