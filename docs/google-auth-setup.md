# Google OAuth Setup Guide

This guide explains how to configure Google OAuth for the CyberK Flow application.

## Prerequisites

- A Google Cloud Platform (GCP) account
- Access to the Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top and select **New Project**
3. Enter a project name and click **Create**

## Step 2: Enable OAuth APIs

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Google+ API" or "Google Identity" and enable it

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** (or **Internal** if using Google Workspace)
3. Fill in the required fields:
   - **App name**: CyberK Flow
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue**
5. Add scopes: `email`, `profile`, `openid`
6. Complete the remaining steps

## Step 4: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name**: CyberK Flow Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3001` (development)
     - Your production URL
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://your-production-domain.com/api/auth/callback/google` (production)
5. Click **Create**

## Step 5: Configure Environment Variables

Copy the **Client ID** and **Client Secret** from the credentials page and add them to your environment:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Troubleshooting

### "Access blocked: This app's request is invalid"

- Verify the redirect URI matches exactly (including trailing slashes)
- Ensure the OAuth consent screen is configured

### "Error 400: redirect_uri_mismatch"

- Check that the redirect URI in your app matches the one configured in Google Cloud Console
- The redirect URI should be: `{BETTER_AUTH_URL}/api/auth/callback/google`

## Security Notes

- Never commit your `GOOGLE_CLIENT_SECRET` to version control
- Use different OAuth credentials for development and production
- Regularly rotate your client secret
