# FIX GOOGLE OAUTH - DO THIS NOW

## The Problem
Error 400: redirect_uri_mismatch means Google doesn't recognize the redirect URI.

## Your Deployment URL
`https://meetinghub-git-main-samvrutha-jayarajans-projects.vercel.app`

---

## STEP 1: Fix Google Cloud Console (5 minutes)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", make sure you have EXACTLY these:

```
http://localhost:3000/api/auth/callback/google
https://meetinghub-git-main-samvrutha-jayarajans-projects.vercel.app/api/auth/callback/google
```

4. Click "SAVE"
5. Wait 5 minutes for Google to update

---

## STEP 2: Fix Vercel Environment Variables (2 minutes)

1. Go to: https://vercel.com/dashboard
2. Click your project
3. Go to Settings → Environment Variables
4. Find `NEXTAUTH_URL` and click "Edit"
5. Change the value to EXACTLY this (no trailing slash, no extra spaces):

```
https://meetinghub-git-main-samvrutha-jayarajans-projects.vercel.app
```

6. Click "Save"
7. Go to Deployments tab
8. Click "..." on latest deployment → "Redeploy"

---

## STEP 3: Add Test User (1 minute)

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Scroll down to "Test users"
3. Click "+ ADD USERS"
4. Add: `samvruthajay2@gmail.com`
5. Click "SAVE"

---

## STEP 4: Test (After 5 minutes)

1. Wait 5 minutes after Step 1
2. Go to your app
3. Try signing in with Google using `samvruthajay2@gmail.com`
4. Should work now!

---

## If Still Not Working

The app is currently "In production" which requires verification for sensitive scopes.

### OPTION A: Switch to Testing Mode (Works immediately, max 100 users)
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click "BACK TO TESTING" button
3. Add test users (up to 100)
4. Works immediately with warning screen

### OPTION B: Keep Published (Unlimited users, shows warning)
- Users see "This app isn't verified" warning
- They click: "Advanced" → "Go to MeetingHub (unsafe)" → "Continue"
- Works fine, just 2 extra clicks

---

## Quick Check

Your current OAuth Client should have:

**Authorized JavaScript origins:**
- `http://localhost:3000`
- `https://meetinghub-git-main-samvrutha-jayarajans-projects.vercel.app`

**Authorized redirect URIs:**
- `http://localhost:3000/api/auth/callback/google`
- `https://meetinghub-git-main-samvrutha-jayarajans-projects.vercel.app/api/auth/callback/google`

That's it! Only these 2 redirect URIs are needed for NextAuth Google provider.
