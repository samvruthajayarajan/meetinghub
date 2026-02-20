# Quick Start - Gmail OAuth Setup

## ✅ Completed Steps

1. ✅ Installed `googleapis` package
2. ✅ Updated database schema with Gmail OAuth fields
3. ✅ Created OAuth API routes
4. ✅ Updated Profile UI with "Connect Gmail" button

## 🔧 What You Need to Do Now

### Step 1: Get Google OAuth Credentials (5-10 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable Gmail API:
   - Go to "APIs & Services" → "Library"
   - Search "Gmail API" → Enable it
4. Configure OAuth Consent Screen:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" → Create
   - Fill in app name and your email
   - Add scopes: `gmail.send` and `userinfo.email`
   - Add test users (your email)
5. Create Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Type: "Web application"
   - Add redirect URI: `http://localhost:3000/api/auth/gmail/callback`
   - Copy the Client ID and Client Secret

### Step 2: Update .env File

Open `my-app/.env` and replace these lines:

```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

With your actual credentials from Google Cloud Console.

### Step 3: Restart Development Server

```bash
npm run dev
```

### Step 4: Test It!

1. Open http://localhost:3000
2. Sign in to your app
3. Go to "Profile" section
4. Click "Connect with Google" button
5. Authorize the app
6. Try sending an email - it will be sent from YOUR Gmail!

## 🎉 How It Works

- User clicks "Connect Gmail"
- Google asks for permission to send emails
- User authorizes
- Tokens saved to database
- When sending emails, Gmail API is used
- Emails sent FROM user's Gmail account
- Recipients see user's email as sender

## 📝 Important Notes

- The app is in "Testing" mode, so only test users can authorize
- You can add more test users in Google Cloud Console
- No passwords are stored - only secure OAuth tokens
- Users can revoke access anytime at https://myaccount.google.com/permissions

## 🆘 Troubleshooting

### "redirect_uri_mismatch" error
- Check the redirect URI in Google Console matches exactly: `http://localhost:3000/api/auth/gmail/callback`

### "Access blocked" error
- Add your email as a test user in OAuth consent screen

### Build errors
- Already fixed! The `googleapis` package is installed

## 📚 More Details

See `GMAIL_OAUTH_SETUP.md` for complete step-by-step instructions with screenshots.
