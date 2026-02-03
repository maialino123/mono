# Change: Add Profile Screen

## Why
Users need a way to view their account info and see which authentication providers (email/password, Google) are linked. This also enables linking/unlinking social providers from an existing account.

## What Changes
- Add profile page at `/profile` route
- Show user info (name, email, avatar)
- Show list of linked providers with status (credential, google)
- Allow linking Google account if not yet linked
- Allow unlinking a provider (if more than one linked)

## Impact
- Affected specs: `auth` (new profile capability)
- Affected code: `apps/web/src/app/profile/`, new `screens/profile/`, new `entities/account/`, new `features/auth/link-provider/`
