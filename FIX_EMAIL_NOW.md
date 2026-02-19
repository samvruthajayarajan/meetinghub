# 🚨 QUICK FIX: Email Authentication Error

Your Gmail App Password is not working. Here's how to fix it:

## ⚡ FASTEST SOLUTION: Use Outlook Instead

**No App Password needed!**

1. **Update your `.env` file** (my-app/.env):
   ```env
   SMTP_HOST="smtp-mail.outlook.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@outlook.com"
   SMTP_PASSWORD="your-regular-outlook-password"
   ```

2. **Restart the server:**
   - Press `Ctrl+C` to stop
   - Run `npm run dev` again

3. **Done!** Try sending an email.

---

## 🔧 OR: Fix Gmail (Takes longer)

### Step 1: Enable 2-Step Verification
1. Go to: https://myaccount.google.com/security
2. Find "2-Step Verification" 
3. Click "Get Started" and complete setup

### Step 2: Generate NEW App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" app
3. Select "Windows Computer" device
4. Click "Generate"
5. **Copy the 16-character password** (looks like: `xxxx xxxx xxxx xxxx`)

### Step 3: Update .env File
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="samvruthajay@gmail.com"
SMTP_PASSWORD="paste-your-new-app-password-here-no-spaces"
```

**IMPORTANT:** Remove ALL spaces from the App Password!

### Step 4: Restart Server
```bash
npm run dev
```

---

## ✅ Test It

1. Go to any meeting's Reports page
2. Click "Send via Email"
3. Enter your email
4. Click "Send Email"
5. Check your inbox!

---

## 🆘 Still Not Working?

**Common Issues:**

1. **Gmail: "Bad credentials"**
   - Make sure 2-Step Verification is ON
   - Generate a BRAND NEW App Password
   - Remove all spaces from the password
   - Restart the server

2. **Outlook: "Authentication failed"**
   - Verify your password by logging into outlook.com
   - Make sure you're using the correct email address

3. **"SMTP not configured"**
   - Check that all 4 SMTP variables are in .env
   - Make sure there are no typos
   - Restart the server after any changes

---

## 📧 Current Configuration

Your current .env has been updated with commented examples.
Choose ONE option (Gmail OR Outlook) and uncomment those lines.
