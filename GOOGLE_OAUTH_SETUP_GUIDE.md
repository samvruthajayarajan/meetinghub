# Google OAuth Setup Guide for Email Sending

This guide will walk you through setting up Google OAuth 2.0 credentials to send emails from your application.

## Prerequisites
- A Google account (Gmail)
- Access to Google Cloud Console

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter a project name (e.g., "Meeting Hub Email")
5. Click **"Create"**
6. Wait for the project to be created and select it

---

## Step 2: Enable Gmail API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"**
3. Click on **"Gmail API"**
4. Click **"Enable"**
5. Wait for the API to be enabled

---

## Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**

2. **Choose User Type:**
   
   ### For Personal/Small Business Use:
   - Select **"External"** 
   - This allows anyone with a Google account to use your app
   - Your app will be in "Testing" mode (limited to 100 users)
   - **Recommended for most users**
   
   ### For Organizations with Google Workspace:
   - Select **"Internal"**
   - Only users in your Google Workspace organization can use the app
   - No user limit
   - Requires Google Workspace account (not free Gmail)
   - **Use this if you have a company Google Workspace domain**

3. Click **"Create"**

### Fill in the required information:
- **App name**: Meeting Hub (or your app name)
- **User support email**: Your email address
- **App logo** (optional): Upload if you have one
- **App domain** (optional): Leave blank for now
- **Authorized domains** (optional): Leave blank for now
- **Developer contact email**: Your email address
- Click **"Save and Continue"**

### Scopes (Step 2):
- Click **"Add or Remove Scopes"**
- Search and add: `https://www.googleapis.com/auth/gmail.send`
- This allows your app to send emails on your behalf
- Click **"Update"**
- Click **"Save and Continue"**

### Test Users (Step 3) - **IMPORTANT for External apps**:
- Click **"Add Users"**
- Add your Gmail address (and any other users who need access)
- **Note**: In "Testing" mode, only these users can use the app
- To add more users later, come back to this screen
- Click **"Add"**
- Click **"Save and Continue"**

### Summary (Step 4):
- Review your settings
- Click **"Back to Dashboard"**

---

## Understanding User Types

### External (Most Common)
✅ **Use when:**
- You're an individual or small business
- You use free Gmail accounts
- You want flexibility to add users
- You don't have Google Workspace

⚠️ **Limitations:**
- App stays in "Testing" mode (100 user limit)
- Need to add each user as a "Test User"
- To go to "Production" (unlimited users), you need Google verification

### Internal (Organizations Only)
✅ **Use when:**
- Your company has Google Workspace
- All users are in your organization's domain (@yourcompany.com)
- You want automatic access for all employees

❌ **Cannot use if:**
- You use free Gmail (@gmail.com)
- You need external users to access the app

---

## Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**
4. Enter a name: "Meeting Hub Web Client"

### Configure Authorized Redirect URIs:
Add these URIs (one per line):
```
http://localhost:3000
https://developers.google.com/oauthplayground
```

5. Click **"Create"**
6. A popup will show your **Client ID** and **Client Secret**
7. **IMPORTANT**: Copy both and save them securely
   - Client ID: `123456789-abc123def456.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-abc123def456ghi789`

---

## Step 5: Generate Refresh Token

### Using OAuth 2.0 Playground:

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)

2. Click the **Settings icon** (⚙️) in the top right

3. Check **"Use your own OAuth credentials"**

4. Enter your credentials:
   - **OAuth Client ID**: Paste your Client ID
   - **OAuth Client Secret**: Paste your Client Secret
   - Click **"Close"**

5. In the left panel, find **"Gmail API v1"**

6. Expand it and select:
   - ☑️ `https://www.googleapis.com/auth/gmail.send`

7. Click **"Authorize APIs"**

8. Sign in with your Google account

9. Click **"Allow"** to grant permissions

10. You'll be redirected back to the playground

11. Click **"Exchange authorization code for tokens"**

12. Copy the **"Refresh token"** from the response
    - It looks like: `1//0abc123def456ghi789...`

---

## Step 6: Configure in Your Application

1. Log in to your Meeting Hub application
2. Go to **User Dashboard** → **Email Configuration** tab
3. Fill in the form:

### Client ID
```
123456789-abc123def456.apps.googleusercontent.com
```
(Your actual Client ID from Step 4)

### Client Secret
```
GOCSPX-abc123def456ghi789
```
(Your actual Client Secret from Step 4)

### Refresh Token
```
1//0abc123def456ghi789...
```
(Your actual Refresh Token from Step 5)

### Sender Email Address
```
your-email@gmail.com
```
(The Gmail address you want to send emails from)

4. Click **"Save Configuration"**
5. Click **"Test Connection"** to verify it works

---

## Troubleshooting

### Error: "Access blocked: This app's request is invalid"
- Make sure you added your email as a test user in OAuth consent screen
- Verify the redirect URI is correct in OAuth credentials

### Error: "Invalid grant"
- Your refresh token may have expired
- Generate a new refresh token using OAuth Playground (Step 5)

### Error: "Insufficient Permission"
- Make sure you selected the correct scope: `gmail.send`
- Re-authorize in OAuth Playground with the correct scope

### Error: "Daily sending quota exceeded"
- Gmail has sending limits (500 emails/day for free accounts)
- Wait 24 hours or upgrade to Google Workspace

---

## Security Best Practices

1. **Never share your credentials**:
   - Client Secret
   - Refresh Token
   - Access Token

2. **Use environment variables** for production:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REFRESH_TOKEN=your-refresh-token
   ```

3. **Rotate credentials** if compromised:
   - Delete old OAuth client
   - Create new credentials
   - Update application

4. **Monitor usage**:
   - Check Google Cloud Console for API usage
   - Review sent emails in Gmail

---

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
- [Google Cloud Console](https://console.cloud.google.com)

---

## Quick Reference

### Required Scopes
```
https://www.googleapis.com/auth/gmail.send
```

### Authorized Redirect URIs
```
http://localhost:3000
https://developers.google.com/oauthplayground
```

### Token Endpoint
```
https://oauth2.googleapis.com/token
```

---

## Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all steps were completed correctly
3. Check the browser console for error messages
4. Review server logs for detailed error information

---

**Last Updated**: February 2026
