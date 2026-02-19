# Email Setup Guide for Users

## Welcome! 

To send meeting invitations and agendas via email, you have **two options**:

### Option 1: Open in Email App (Easiest - No Configuration!)

Click the **"Open in Email App"** button to compose the email in your default email application (Gmail, Outlook, Apple Mail, etc.). The meeting details and agenda will be pre-filled - you just add recipients and send!

**Benefits:**
- ✅ No SMTP configuration needed
- ✅ Works instantly
- ✅ Uses your default email app
- ✅ You control who receives the email

**How to use:**
1. Go to the meeting's Agenda page
2. Click **"Open in Email App"**
3. Your email app opens with the agenda pre-filled
4. Add recipient email addresses
5. Click Send in your email app

### Option 2: Configure SMTP (For Automated Sending)

If you want to send emails directly from the application without opening your email app, you can configure your SMTP settings. This is a one-time setup that takes about 5 minutes.

**Benefits:**
- ✅ Send emails directly from the app
- ✅ Faster for bulk sending
- ✅ Can attach PDF files
- ✅ Professional automated emails

## Why Do I Need SMTP Configuration?

When you configure SMTP and send emails directly from the app, they will be sent from YOUR email address. This makes it professional and ensures recipients know the email is from you.

## Step-by-Step SMTP Setup

### Step 1: Access Profile Settings

1. Login to your account
2. Click **"Profile"** in the left sidebar
3. You'll see the "Email Configuration" section

### Step 2: Choose Your Email Provider

#### For Gmail Users (Most Common)

**What You Need:**
- Your Gmail address (e.g., yourname@gmail.com)
- A Gmail App Password (NOT your regular Gmail password)

**How to Get Gmail App Password:**

1. **Enable 2-Step Verification** (if not already enabled):
   - Go to: https://myaccount.google.com/security
   - Find "2-Step Verification" and turn it ON
   - Follow the prompts to set it up

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - You may need to sign in again
   - Select "Mail" from the dropdown
   - Select "Windows Computer" (or any device)
   - Click **"Generate"**
   - You'll see a 16-character password like: `abcd efgh ijkl mnop`
   - **Copy this password** (you can remove the spaces)

3. **Fill in Profile Settings**:
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587`
   - Email Address: `yourname@gmail.com`
   - App Password: `abcdefghijklmnop` (paste the password you copied)

4. Click **"Save Configuration"**

#### For Outlook/Hotmail Users

**Fill in Profile Settings:**
- SMTP Host: `smtp-mail.outlook.com`
- SMTP Port: `587`
- Email Address: `yourname@outlook.com`
- App Password: Your Outlook password

**Note:** Outlook may require you to enable "Less secure app access" or generate an app password depending on your account settings.

#### For Yahoo Mail Users

**Fill in Profile Settings:**
- SMTP Host: `smtp.mail.yahoo.com`
- SMTP Port: `587`
- Email Address: `yourname@yahoo.com`
- App Password: Generate from Yahoo Account Security

**How to Get Yahoo App Password:**
1. Go to: https://login.yahoo.com/account/security
2. Click "Generate app password"
3. Select "Other App" and name it "Meeting System"
4. Copy the generated password

#### For Custom Domain/Company Email

Contact your IT department or email administrator for:
- SMTP Host (e.g., `smtp.yourcompany.com`)
- SMTP Port (usually `587` or `465`)
- Your email address
- Your email password or app password

### Step 3: Test Your Configuration

1. Go to any meeting
2. Click **"Email Meeting Details"** button
3. Enter your own email address
4. Click Send
5. Check your inbox - you should receive the email within a minute

## Troubleshooting

### "Email service not configured" Error

**Cause:** You haven't configured your email settings yet.

**Solution:** Follow the steps above to configure your email in the Profile page.

### "Authentication failed" Error

**Cause:** Your email or password is incorrect.

**Solutions:**
- For Gmail: Make sure you're using an App Password, NOT your regular Gmail password
- Double-check your email address is correct
- Make sure there are no extra spaces in the password
- For Gmail: Ensure 2-Step Verification is enabled

### Email Not Received

**Check:**
- Spam/Junk folder
- Recipient email address is correct
- Your email configuration is saved correctly
- Try sending to a different email address

### "Less secure app" Warning (Gmail)

**Solution:** Use App Passwords instead. Google no longer allows regular passwords for third-party apps. You MUST use App Passwords.

## Security Notes

### Is This Safe?

✅ **Yes!** Your credentials are stored securely in the database.
✅ App Passwords are safer than regular passwords because they're app-specific.
✅ You can revoke App Passwords anytime without changing your main password.

### Best Practices

1. **Use App Passwords** - Never use your main email password
2. **Keep it Private** - Don't share your App Password with anyone
3. **Revoke if Needed** - If you leave the organization, revoke the App Password
4. **Use Strong Passwords** - For your main email account

## Do I Have to Configure Email?

**No, it's completely optional!** You have multiple ways to share meeting information:

### Without SMTP Configuration:
1. **Open in Email App** - Opens your default email app with agenda pre-filled (easiest!)
2. **Download PDF** - Download and attach manually to your email
3. **WhatsApp** - Share via WhatsApp
4. **Copy/Paste** - Copy meeting details and paste anywhere

### With SMTP Configuration:
- Send emails directly from the app
- Attach PDFs automatically
- Faster for sending to multiple recipients

You can still use all other features (create meetings, agendas, minutes, reports) without configuring email!

## For System Administrators

If you're setting up this system for your organization, you have two options:

### Option 1: User-Only Configuration
- Each user configures their own email
- Most secure and professional
- Emails come from the actual meeting organizer

### Option 2: System Fallback Email
- Configure a system-wide email in `.env` file
- Users who don't configure email will use the system email
- Users who configure email will use their own

To set up system email, edit `my-app/.env`:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@yourcompany.com"
SMTP_PASSWORD="your-app-password"
```

## Need Help?

If you're still having trouble:
1. Check the troubleshooting section above
2. Contact your system administrator
3. Verify your email provider's SMTP settings online

## Summary

✅ One-time setup (5 minutes)
✅ Emails sent from YOUR email address
✅ Professional and secure
✅ Easy to configure
✅ Optional - only needed if you want to send emails

**Ready to get started? Go to Profile → Email Configuration!**
