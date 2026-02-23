# Vercel Deployment Setup Guide

## Environment Variables Configuration

Your application is deployed but showing server errors because environment variables are missing in Vercel.

### Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your project (meetinghub)

2. **Navigate to Settings**
   - Click on the "Settings" tab at the top
   - Click "Environment Variables" in the left sidebar

3. **Add Each Environment Variable**

For each variable below, click "Add New" and enter:

#### Required Variables:

**DATABASE_URL**
```
Copy from your local .env file
```
- Select: Production, Preview, Development

**NEXTAUTH_URL**
```
https://your-actual-vercel-url.vercel.app
```
- Replace `your-actual-vercel-url` with your actual Vercel deployment URL
- Select: Production, Preview, Development

**NEXTAUTH_SECRET**
```
Copy from your local .env file
```
- Select: Production, Preview, Development

**GOOGLE_CLIENT_ID**
```
Copy from your local .env file
```
- Select: Production, Preview, Development

**GOOGLE_CLIENT_SECRET**
```
Copy from your local .env file
```
- Select: Production, Preview, Development

**GOOGLE_REDIRECT_URI**
```
https://your-actual-vercel-url.vercel.app/api/auth/gmail/callback
```
- Replace `your-actual-vercel-url` with your actual Vercel deployment URL
- Select: Production, Preview, Development

#### Optional Variables (for WhatsApp features):

**WHATSAPP_API_URL**
```
(leave empty for now)
```

**WHATSAPP_API_TOKEN**
```
(leave empty for now)
```

4. **Update Google OAuth Settings**
   - Go to Google Cloud Console: https://console.cloud.google.com
   - Navigate to your OAuth 2.0 Client
   - Add your Vercel URL to "Authorized redirect URIs":
     - `https://your-actual-vercel-url.vercel.app/api/auth/gmail/callback`

5. **Redeploy**
   - After adding all variables, go to "Deployments" tab
   - Click the three dots (...) on the latest deployment
   - Click "Redeploy"
   - OR simply push a new commit to trigger automatic deployment

## Finding Your Vercel URL

Your Vercel URL is shown in the deployment dashboard. It looks like:
- `https://meetinghub-xyz123.vercel.app`
- Or your custom domain if you've set one up

## Troubleshooting

### Still seeing server errors?
1. Check Vercel logs: Go to your deployment → Click "View Function Logs"
2. Verify all environment variables are saved
3. Make sure you redeployed after adding variables
4. Check that MongoDB allows connections from anywhere (0.0.0.0/0) in Network Access

### Database connection issues?
1. Go to MongoDB Atlas
2. Navigate to Network Access
3. Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
4. This is required for Vercel's serverless functions

## Security Note

The environment variables in this guide contain sensitive information. Never commit the `.env` file to Git. It's already in `.gitignore`.
