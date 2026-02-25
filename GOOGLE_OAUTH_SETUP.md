# Google OAuth Setup Guide for Gmail Integration

## Complete Step-by-Step Configuration (100% FREE)

### Part 1: Create Google Cloud Project & OAuth Credentials

#### Step 1: Create/Select Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: "MeetingHub" (or any name)
5. Click "CREATE"
6. Wait for project creation, then select it

#### Step 2: Enable Gmail API
1. In the left sidebar, click "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on "Gmail API"
4. Click "ENABLE"

#### Step 3: Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type
3. Click "CREATE"

**Fill in the form:**
- **App name**: MeetingHub
- **User support email**: Your email address
- **App logo**: (Optional - skip for now)
- **Application home page**: `https://meetinghub-git-main-samvrutha-jayarajans-projects.vercel.app`
- **Application privacy policy link**: `https://meetinghub-git-main-samvrutha-jayarajans-projects.vercel.app`
- **Application terms of service link**: `https://meetinghub-git-main-samvrutha-jayarajans-projects.vercel.app`
- **Authorized domains**: Add `vercel.app`
- **Developer contact information**: Your email address

4. Click "SAVE AND CONTINUE"

#### Step 4: Add Scopes
1. Click "ADD OR REMOVE SCOPES"
2. Filter/search for these scopes and select them:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/userinfo.email`
3. Click "UPDATE"
4. Click "SAVE AND CONTINUE"

#### Step 5: Skip Test Users (We'll publish instead)
1. Click "SAVE AND CONTINUE" (don't add test users)
2. Review the summary and click "BACK TO DASHBOARD"

#### Step 6: PUBLISH THE APP (FREE - IMPORTANT!)
1. On the OAuth consent screen page, you'll see "Publishing status: Testing"
2. Click the "PUBLISH APP" button
3. A popup will appear - Click "CONFIRM"
4. Status will change to "In production"
5. **Done! Now ANY user can connect their Gmail (unlimited users)**

#### Step 7: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" at the top
3. Select "OAuth client ID"
4. Application type: "Web application"
5. Name: "MeetingHub Web Client"

**Authorized JavaScript origins:**
- `http://localhost:3000`
- `https://meetinghub-git-main-samvrutha-jayarajans-projects.vercel.app`

**Authorized redirect URIs:**
- `http://localhost:3000/api/auth/gmail/callback`
- `https://meetinghub-git-main-samvrutha-jayarajans-projects.vercel.app/api/auth/gmail/callback`

6. Click "CREATE"
7. **COPY the Client ID and Client Secret** - you'll need these!

---

### Part 2: Configure Your Application

#### Step 8: Update Local Environment Variables

Edit your `.env` file:

```env
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/gmail/callback"
```

#### Step 9: Update Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add/Update these variables:

| Name | Value |
|------|-------|
| `NEXTAUTH_URL` | `https://meetinghub-git-main-samvrutha-jayarajans-projects.vercel.app` |
| `GOOGLE_CLIENT_ID` | Your Client ID from Step 6 |
| `GOOGLE_CLIENT_SECRET` | Your Client Secret from Step 6 |

5. Click "Save"
6. Go to "Deployments" tab
7. Click "..." on the latest deployment
8. Click "Redeploy"

---

### Part 3: Testing

#### Step 10: Test Gmail Authorization

1. Go to your deployed app: `https://meetinghub-git-main-samvrutha-jayarajans-projects.vercel.app`
2. Login to your account
3. Look for "Connect Gmail" or Gmail authorization button
4. Click it
5. You'll see Google's warning screen: "Google hasn't verified this app"
6. **This is normal!** Click "Advanced" (bottom left)
7. Click "Go to MeetingHub (unsafe)"
8. Click "Continue" to grant permissions
9. You should be redirected back to your app with success message

**Note:** Every user will see this warning screen. It's safe - they just need to click "Advanced" → "Go to MeetingHub (unsafe)" → "Continue"

---

## Troubleshooting

### Error 400: invalid_request
- **Cause**: Redirect URI mismatch
- **Fix**: Make sure the redirect URI in your code exactly matches what's in Google Cloud Console

### Error 403: access_denied  
- **Cause**: App is still in "Testing" mode
- **Fix**: Click "PUBLISH APP" in OAuth consent screen (Step 6)

### Error: redirect_uri_mismatch
- **Cause**: The redirect URI doesn't match
- **Fix**: Check that `NEXTAUTH_URL` in Vercel matches your deployment URL exactly (no trailing slash)

### Users see "This app isn't verified" warning
- **This is normal!** Your app is published but not verified
- Users can still connect by clicking: "Advanced" → "Go to MeetingHub (unsafe)" → "Continue"
- To remove this warning, you need Google verification (costs $15-$75 and takes 1-2 weeks)
- Most apps run fine with this warning - users just need to click through it

---

## Quick Checklist

- [ ] Google Cloud Project created
- [ ] Gmail API enabled
- [ ] OAuth consent screen configured (External)
- [ ] Scopes added (gmail.send, userinfo.email)
- [ ] **APP PUBLISHED** (Click "PUBLISH APP" button - FREE!)
- [ ] OAuth credentials created
- [ ] Redirect URIs added (both localhost and production)
- [ ] `GOOGLE_CLIENT_ID` set in Vercel
- [ ] `GOOGLE_CLIENT_SECRET` set in Vercel
- [ ] `NEXTAUTH_URL` set correctly in Vercel
- [ ] Redeployed after environment variable changes
- [ ] Tested authorization flow

---

## Important Notes

1. **Publishing is FREE**: Clicking "PUBLISH APP" costs nothing and allows unlimited users
2. **Unverified Warning**: Users will see a warning screen but can easily bypass it (2 clicks)
3. **Token Expiry**: Access tokens expire after 1 hour, but refresh tokens are used to get new ones automatically
4. **Verification (Optional)**: To remove the warning screen, submit for Google verification (costs $15-$75, takes 1-2 weeks)
5. **Scopes**: Only request the minimum scopes you need (gmail.send for sending emails)

---

## Need Help?

If you're still having issues:
1. Check the browser console for errors
2. Check Vercel deployment logs
3. Verify all environment variables are set correctly
4. Make sure you're using the email that's added as a test user
