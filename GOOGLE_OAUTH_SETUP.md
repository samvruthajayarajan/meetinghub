# Google OAuth Setup Guide for Gmail Integration

## Complete Step-by-Step Configuration

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

#### Step 5: Add Test Users
1. Click "+ ADD USERS"
2. Enter the email address you use to login to MeetingHub
3. Click "ADD"
4. Click "SAVE AND CONTINUE"
5. Review the summary and click "BACK TO DASHBOARD"

#### Step 6: Create OAuth Credentials
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

#### Step 7: Update Local Environment Variables

Edit your `.env` file:

```env
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/gmail/callback"
```

#### Step 8: Update Vercel Environment Variables

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

#### Step 9: Test Gmail Authorization

1. Go to your deployed app: `https://meetinghub-git-main-samvrutha-jayarajans-projects.vercel.app`
2. Login to your account
3. Look for "Connect Gmail" or Gmail authorization button
4. Click it
5. You should see Google's consent screen
6. Click "Continue" (you may see a warning that the app is unverified - this is normal)
7. Click "Advanced" → "Go to MeetingHub (unsafe)"
8. Grant permissions
9. You should be redirected back to your app with success message

---

## Troubleshooting

### Error 400: invalid_request
- **Cause**: Redirect URI mismatch
- **Fix**: Make sure the redirect URI in your code exactly matches what's in Google Cloud Console

### Error 403: access_denied
- **Cause**: Email not added as test user
- **Fix**: Add your email to test users in OAuth consent screen (Step 5)

### Error: redirect_uri_mismatch
- **Cause**: The redirect URI doesn't match
- **Fix**: Check that `NEXTAUTH_URL` in Vercel matches your deployment URL exactly (no trailing slash)

### Still in Testing Mode?
- Your app will stay in "Testing" mode until you submit for verification
- In testing mode, only test users can authorize
- To add more users, go to OAuth consent screen → Test users → Add users
- For production use, you need to submit for Google verification (takes 1-2 weeks)

---

## Quick Checklist

- [ ] Google Cloud Project created
- [ ] Gmail API enabled
- [ ] OAuth consent screen configured (External)
- [ ] Scopes added (gmail.send, userinfo.email)
- [ ] Test user email added
- [ ] OAuth credentials created
- [ ] Redirect URIs added (both localhost and production)
- [ ] `GOOGLE_CLIENT_ID` set in Vercel
- [ ] `GOOGLE_CLIENT_SECRET` set in Vercel
- [ ] `NEXTAUTH_URL` set correctly in Vercel
- [ ] Redeployed after environment variable changes
- [ ] Tested authorization flow

---

## Important Notes

1. **Test Users Limit**: You can add up to 100 test users while in testing mode
2. **Token Expiry**: Access tokens expire after 1 hour, but refresh tokens are used to get new ones automatically
3. **Verification**: For public use (not just test users), submit your app for Google verification
4. **Scopes**: Only request the minimum scopes you need (gmail.send for sending emails)

---

## Need Help?

If you're still having issues:
1. Check the browser console for errors
2. Check Vercel deployment logs
3. Verify all environment variables are set correctly
4. Make sure you're using the email that's added as a test user
