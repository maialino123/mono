# profile-screen Specification

## Purpose
TBD - created by archiving change add-profile-screen. Update Purpose after archive.
## Requirements
### Requirement: Profile Page User Info

The system SHALL display the authenticated user's name, email, and avatar on the profile page at `/profile`.

#### Scenario: Authenticated user visits profile

- **WHEN** a signed-in user navigates to `/profile`
- **THEN** the page displays user name, email, and avatar image (or fallback initials)

#### Scenario: Unauthenticated user visits profile

- **WHEN** an unauthenticated user navigates to `/profile`
- **THEN** they are redirected to `/sign-in`

### Requirement: Linked Providers List

The system SHALL display all authentication providers linked to the current user's account, showing each provider's type (credential or social) and status.

#### Scenario: User has multiple providers linked

- **WHEN** user has both email/password and Google accounts linked
- **THEN** the profile shows both providers with their respective labels and a visual indicator (e.g., icon)

### Requirement: Link Social Provider

The system SHALL allow users to link a Google account to their existing account from the profile page.

#### Scenario: User links Google account

- **WHEN** user clicks "Link Google" and completes the OAuth flow
- **THEN** the Google provider appears in the linked providers list

### Requirement: Unlink Provider

The system SHALL allow users to unlink a provider from their account, provided they have more than one linked account.

#### Scenario: User unlinks a provider

- **WHEN** user clicks "Unlink" on a provider and has at least 2 linked accounts
- **THEN** the provider is removed from the linked list

#### Scenario: User tries to unlink last provider

- **WHEN** user has only 1 linked account
- **THEN** the "Unlink" button is disabled or hidden to prevent account lockout

