# Quick Setup Instructions

## ⚠️ IMPORTANT: Follow These Steps Now

Your email system has been updated to remove hardcoded credentials. Follow these steps to complete the setup:

### Step 1: Stop Development Server ⏹️

If your development server is running, **stop it now**:
- Press `Ctrl+C` in the terminal

### Step 2: Regenerate Prisma Client 🔄

Run this command in the `my-app` directory:

```bash
cd my-app
npx prisma generate
```

Wait for it to complete successfully.

### Step 3: Restart Development Server ▶️

```bash
npm run dev
```

### Step 4: Configure Your Email 📧

1. Open the application in your browser
2. Login to your account
3. Click **Profile** in the sidebar
4. Fill in your SMTP settings:
   - SMTP Host: `smtp.gmail.com` (for Gmail)
   - SMTP Port: `587`
   - Email Address: Your email
   - App Password: Generate from [Google App Passwords](https://myaccount.google.com/apppasswords)
5. Click **Save Configuration**

### Step 5: Test Email Sending ✅

1. Go to any meeting
2. Click "Email Meeting Details"
3. Enter your email as recipient
4. Check if you receive the email

## What Changed?

- ✅ Removed your personal Gmail from `.env` file
- ✅ Added user-specific SMTP configuration
- ✅ Emails now send from the logged-in user's email
- ✅ System is ready for multi-user deployment

## Need Help?

See `EMAIL_CONFIGURATION_GUIDE.md` for detailed instructions and troubleshooting.

## Current Status

- [x] Code updated to use dynamic SMTP
- [x] `.env` file updated with placeholders
- [x] Profile page created for SMTP configuration
- [x] API routes updated
- [ ] **YOU NEED TO**: Run `npx prisma generate`
- [ ] **YOU NEED TO**: Configure your email in Profile

**Do these steps now to continue using email features!**
