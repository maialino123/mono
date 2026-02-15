## ADDED Requirements

### Requirement: SIWE Server Plugin

The system SHALL integrate the better-auth SIWE plugin (`better-auth/plugins`) with viem-based message verification and cryptographic nonce generation.

#### Scenario: Plugin configured with viem verification

- **WHEN** the auth server starts
- **THEN** the SIWE plugin is active with `anonymous: true`, using `viem.verifyMessage` for signature verification and `generateRandomString` for nonce generation

### Requirement: SIWE Client Plugin

The system SHALL add `siweClient()` to the web auth client, exposing `authClient.siwe.nonce()` and `authClient.siwe.verify()`.

#### Scenario: Client plugin available

- **WHEN** the auth client is initialized
- **THEN** `authClient.siwe.nonce()` and `authClient.siwe.verify()` are callable

### Requirement: Wallet Sign-In

The system SHALL provide a "Sign in with Wallet" button on the sign-in page that authenticates users via the SIWE flow (connect wallet → get nonce → sign message → verify).

#### Scenario: Successful wallet sign-in (new user)

- **WHEN** user clicks "Sign in with Wallet" and signs the SIWE message
- **THEN** a new user account is created, the wallet address is linked, and user is redirected to `/`

#### Scenario: Successful wallet sign-in (returning user)

- **WHEN** user signs in with a wallet that was previously linked
- **THEN** the existing user is authenticated and redirected to `/`

#### Scenario: User rejects signature

- **WHEN** user cancels the wallet signature prompt
- **THEN** the system displays an error message without navigating away

### Requirement: Wallet Sign-Up

The system SHALL provide a "Sign up with Wallet" button on the sign-up page using the same SIWE flow.

#### Scenario: Wallet sign-up flow

- **WHEN** user clicks "Sign up with Wallet" on the sign-up page
- **THEN** the SIWE flow authenticates and creates/signs-in the user, redirecting to `/`

### Requirement: Wallet Linking on Profile

The system SHALL allow authenticated users to link an Ethereum wallet to their existing account from the profile page.

#### Scenario: Link wallet to existing account

- **WHEN** authenticated user clicks "Link Wallet" on profile page and signs the SIWE message
- **THEN** the wallet address is linked to their current account

#### Scenario: Wallet already linked to another user

- **WHEN** user attempts to link a wallet that is already linked to a different account
- **THEN** the system displays an error indicating the wallet is already linked

### Requirement: Linked Wallets Display on Profile

The system SHALL display linked wallet addresses in the profile "Linked Accounts" section, showing the wallet address and chain.

#### Scenario: User has linked wallets

- **WHEN** authenticated user views profile page
- **THEN** linked wallets are displayed alongside other providers (Google, email)

#### Scenario: No linked wallets

- **WHEN** authenticated user has no linked wallet
- **THEN** a "Link Wallet" button is shown

### Requirement: Anonymous Wallet User Profile

The system SHALL handle wallet-only users (no email) gracefully in the profile UI by showing the wallet address as the primary identifier.

#### Scenario: Wallet-only user views profile

- **WHEN** a user created via wallet auth (no email) views profile
- **THEN** the wallet address is displayed as identifier; email shows "No email linked"

### Requirement: Database Migration

The system SHALL add the `walletAddress` table (id, userId, address, chainId, isPrimary, createdAt) via better-auth SIWE plugin schema generation.

#### Scenario: Schema generated

- **WHEN** `bun run db:push` is executed
- **THEN** the `walletAddress` table exists with correct columns and foreign key to `user`

### Requirement: Account Linking Configuration

The system SHALL configure `account.accountLinking` with `enabled: true`, `allowDifferentEmails: true`, and `trustedProviders: ["google"]` to allow SIWE anonymous wallet users (with synthetic emails like `0xdead@domain`) to link Google accounts.

#### Scenario: Wallet user links Google account with different email

- **WHEN** a wallet-only user (with synthetic email) links a Google account that has a different email
- **THEN** the linking succeeds because `allowDifferentEmails` is true

### Requirement: OAuth Link Error Redirect

The system SHALL pass `errorCallbackURL` when calling `linkSocial` so OAuth errors redirect back to the frontend instead of the backend default error page.

#### Scenario: OAuth link failure redirects to frontend

- **WHEN** linking fails (e.g. `account_already_linked_to_different_user`)
- **THEN** the user is redirected back to the profile page with an error query param instead of the backend error page

### Requirement: OAuth Link Error Display

The system SHALL display a user-friendly toast notification when the profile page receives an OAuth link error via URL query param `?error=...`.

#### Scenario: User returns to profile with OAuth error

- **WHEN** user is redirected to profile with `?error=account_already_linked_to_different_user`
- **THEN** a toast shows "This account is already linked to another user"
