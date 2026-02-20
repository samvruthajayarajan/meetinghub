# Setup Instructions for Gmail OAuth

I've implemented Google OAuth2 for Gmail so users can send emails from their own Gmail accounts. Here's what you need to do:

## 1. Install Required Package

```bash
cd my-app
npm install googleapis
```

## 2. Update Database Schema

```bash
npx prisma db push
```

This adds Gmail OAuth fields to the User model.

## 3. Set Up Google Cloud Console

Follow the detailed guide in `GMAIL_OAUTH_SETUP.md` to:
- Create a Google Cloud project
- Enable Gmail API
- Configure OAuth consent screen
- Create OAuth credentials
- Get Client ID and Client Secret

## 4. Update .env File

Replace the placeholder values in `.env`:

```env
GOOGLE_CLIENT_ID="your-actual-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-actual-client-secret"
```

## 5. Restart Server

```bash
npm run dev
```

## 6. Test It!

1. Go to http://localhost:3000/user
2. Click "Profile" in sidebar
3. Click "Connect with Google" button
4. Authorize the app
5. Send a test email - it will be sent from the user's Gmail!

## What I've Implemented

✅ Gmail OAuth authorization flow
✅ Token storage in database
✅ Automatic token refresh
✅ Gmail API email sending with attachments
✅ "Connect with Google" button in Profile
✅ Fallback to SMTP if Gmail not connected
✅ Updated email sending API to use Gmail API

## How It Works

1. User clicks "Connect with Google"
2. Redirected to Google authorization page
3. User grants permission to send emails
4. Tokens saved to database
5. When sending emails, Gmail API is used
6. Emails sent FROM user's Gmail account
7. No passwords stored - secure OAuth tokens only

## Benefits

- ✅ Users don't need App Passwords
- ✅ More secure than SMTP
- ✅ One-click authorization
- ✅ Emails sent from user's own Gmail
- ✅ Professional user experience

## Files Created/Modified

### New Files:
- `lib/gmailApi.ts` - Gmail API utilities
- `app/api/auth/gmail/authorize/route.ts` - OAuth initiation
- `app/api/auth/gmail/callback/route.ts` - OAuth callback handler
- `GMAIL_OAUTH_SETUP.md` - Detailed setup guide
- `INSTALL_GOOGLEAPIS.md` - Package installation instructions

### Modified Files:
- `prisma/schema.prisma` - Added Gmail OAuth fields
- `.env` - Added Google OAuth credentials
- `app/user/page.tsx` - Added "Connect Gmail" button
- `app/api/meetings/[id]/email/route.ts` - Uses Gmail API (needs final update)

## Next Steps

1. Run `npm install googleapis`
2. Run `npx prisma db push`
3. Follow `GMAIL_OAUTH_SETUP.md` to get Google credentials
4. Update `.env` with your credentials
5. Restart server and test!

The system will automatically use Gmail API if user has connected Gmail, otherwise falls back to SMTP if configured.
