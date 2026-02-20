# Gmail OAuth Setup Guide

This guide will help you set up Google OAuth so users can send emails from their own Gmail accounts.

## Step 1: Install Required Package

```bash
cd my-app
npm install googleapis
```

## Step 2: Update Prisma Schema

Run this command to apply the database changes:

```bash
npx prisma db push
```

This will add the Gmail OAuth fields to your User model.

## Step 3: Set Up Google Cloud Project

### 3.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Meeting Management System"
4. Click "Create"

### 3.2 Enable Gmail API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on it and click "Enable"

### 3.3 Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (unless you have Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - App name: "Meeting Management System"
   - User support email: your email
   - Developer contact: your email
5. Click "Save and Continue"
6. On "Scopes" page, click "Add or Remove Scopes"
7. Add these scopes:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/userinfo.email`
8. Click "Save and Continue"
9. On "Test users" page, add your email and any test users
10. Click "Save and Continue"

### 3.4 Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "Meeting System Web Client"
5. Under "Authorized redirect URIs", click "Add URI" and add:
   - `http://localhost:3000/api/auth/gmail/callback`
   - (Later add your production URL: `https://yourdomain.com/api/auth/gmail/callback`)
6. Click "Create"
7. Copy the "Client ID" and "Client Secret"

## Step 4: Update .env File

Add these to your `my-app/.env` file:

```env
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

## Step 5: Restart Your Development Server

```bash
npm run dev
```

## Step 6: Test the Integration

1. Go to http://localhost:3000/user
2. Click on "Profile" in the sidebar
3. Click "Connect Gmail" button
4. Authorize the app
5. Try sending an email - it will be sent from the user's Gmail account!

## How It Works

1. User clicks "Connect Gmail"
2. They're redirected to Google's authorization page
3. They grant permission to send emails
4. Google redirects back with an authorization code
5. Your app exchanges the code for access/refresh tokens
6. Tokens are stored in the database
7. When sending emails, your app uses these tokens to send via Gmail API
8. Emails are sent FROM the user's Gmail account

## Benefits

✅ No passwords stored
✅ More secure than SMTP
✅ Users just click "Allow" once
✅ Emails sent from their own Gmail
✅ Professional and user-friendly

## Troubleshooting

### "redirect_uri_mismatch" error
- Make sure the redirect URI in Google Console exactly matches: `http://localhost:3000/api/auth/gmail/callback`
- No trailing slash
- Check for typos

### "Access blocked" error
- Make sure you added your email as a test user in OAuth consent screen
- The app is in "Testing" mode, so only test users can authorize

### No refresh token received
- The code forces `prompt: 'consent'` to always get a refresh token
- If still not working, revoke access at https://myaccount.google.com/permissions and try again

## Production Deployment

When deploying to production:

1. Update `.env` with production `NEXTAUTH_URL`
2. Add production redirect URI to Google Console:
   - `https://yourdomain.com/api/auth/gmail/callback`
3. Consider publishing your OAuth app (removes "Testing" mode restrictions)
4. Update OAuth consent screen with privacy policy and terms of service URLs

## Security Notes

- Refresh tokens are stored encrypted in MongoDB
- Access tokens expire and are automatically refreshed
- Users can revoke access anytime at https://myaccount.google.com/permissions
- Your app only has permission to send emails, not read them
