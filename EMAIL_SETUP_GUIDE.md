# Email Setup Guide

This guide will help you configure email sending for the Meeting Management System.

## Gmail Setup (Recommended)

### Step 1: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Scroll down to "How you sign in to Google"
3. Click on "2-Step Verification"
4. Follow the prompts to enable it (if not already enabled)

### Step 2: Create App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Or navigate: Google Account → Security → 2-Step Verification → App passwords
2. In the "Select app" dropdown, choose "Mail"
3. In the "Select device" dropdown, choose "Other (Custom name)"
4. Enter "Meeting System" as the name
5. Click "Generate"
6. Google will show you a 16-character password (e.g., `abcd efgh ijkl mnop`)
7. **Copy this password** (you won't be able to see it again)

### Step 3: Update .env File

1. Open `my-app/.env` file
2. Update the following lines with your information:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-actual-email@gmail.com"
SMTP_PASSWORD="abcdefghijklmnop"
```

**Important Notes:**
- Remove spaces from the App Password (use `abcdefghijklmnop` not `abcd efgh ijkl mnop`)
- Use your full Gmail address (e.g., `john.doe@gmail.com`)
- Keep the quotes around the values

### Step 4: Restart the Server

1. Stop the current server (Ctrl+C in terminal)
2. Restart with: `npm run dev`
3. Test email sending from the Reports page

## Alternative Email Providers

### Outlook/Hotmail

```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_USER="your-email@outlook.com"
SMTP_PASSWORD="your-password"
```

### Yahoo Mail

```env
SMTP_HOST="smtp.mail.yahoo.com"
SMTP_PORT="587"
SMTP_USER="your-email@yahoo.com"
SMTP_PASSWORD="your-app-password"
```

Note: Yahoo also requires an App Password. Generate it at [Yahoo Account Security](https://login.yahoo.com/account/security).

### Custom SMTP Server

```env
SMTP_HOST="mail.yourdomain.com"
SMTP_PORT="587"
SMTP_USER="your-email@yourdomain.com"
SMTP_PASSWORD="your-password"
```

## Troubleshooting

### "Failed to send email" Error

1. **Check credentials**: Make sure email and password are correct
2. **App Password**: For Gmail/Yahoo, you MUST use an App Password, not your regular password
3. **2FA**: Enable 2-Step Verification before creating App Password
4. **Restart server**: Changes to .env require server restart
5. **Firewall**: Ensure port 587 is not blocked

### "Authentication failed" Error

- Double-check your email address
- Verify the App Password is correct (no spaces)
- Make sure 2-Step Verification is enabled
- Try generating a new App Password

### "Connection timeout" Error

- Check your internet connection
- Verify SMTP_HOST and SMTP_PORT are correct
- Try using port 465 with `secure: true` in the code

## Testing Email

1. Go to any meeting's Reports page
2. Click "Send via Email"
3. Enter your own email address
4. Click "Send Email"
5. Check your inbox (and spam folder)

## Security Notes

- Never commit your .env file to version control
- The .env file is already in .gitignore
- App Passwords are safer than using your main password
- Revoke App Passwords you're not using from Google Account settings

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Check the server terminal for error logs
3. Verify all environment variables are set correctly
4. Try with a different email provider
