# Email Configuration Guide

## Overview

The Meeting Management System now supports **dynamic email configuration**. Each user can configure their own SMTP settings to send emails from their personal email address, or the system can use default SMTP settings as a fallback.

## Important Changes

### ✅ What's Been Updated

1. **Removed Hardcoded Credentials**: Personal Gmail credentials have been removed from `.env` file
2. **User-Specific SMTP**: Each user can now configure their own email settings
3. **Dynamic Email Sender**: Emails are sent from the logged-in user's email (if configured)
4. **Fallback System**: If user hasn't configured SMTP, system uses default SMTP from `.env` (if available)
5. **Database Schema**: Added SMTP fields to User model (`smtpHost`, `smtpPort`, `smtpUser`, `smtpPassword`)

### 📋 Required Steps

#### Step 1: Stop Development Server

Before proceeding, **stop your development server** if it's running:
- Press `Ctrl+C` in the terminal where `npm run dev` is running

#### Step 2: Regenerate Prisma Client

The database schema has been updated with new SMTP fields. You need to regenerate the Prisma client:

```bash
cd my-app
npx prisma generate
```

This command will update the Prisma client to include the new SMTP fields.

#### Step 3: Restart Development Server

After Prisma generation completes:

```bash
npm run dev
```

## How to Configure Email

### Option 1: User-Level Configuration (Recommended)

Each user can configure their own email settings:

1. **Login** to your account
2. Go to **Profile** section in the sidebar
3. Fill in your SMTP settings:
   - **SMTP Host**: Your email provider's SMTP server (e.g., `smtp.gmail.com`)
   - **SMTP Port**: Usually `587` for TLS or `465` for SSL
   - **Email Address**: Your email address
   - **App Password**: Your email app password (see below for Gmail instructions)
4. Click **Save Configuration**

#### Gmail App Password Setup

For Gmail users:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select **Mail** and **Windows Computer**
5. Click **Generate**
6. Copy the 16-character password (remove spaces)
7. Use this password in the "App Password" field

#### Other Email Providers

**Outlook/Hotmail:**
- SMTP Host: `smtp-mail.outlook.com`
- SMTP Port: `587`
- Use your regular email and password

**Yahoo:**
- SMTP Host: `smtp.mail.yahoo.com`
- SMTP Port: `587`
- Generate an app password from Yahoo Account Security

**Custom Domain:**
- Contact your email provider for SMTP settings

### Option 2: System-Level Configuration (Fallback)

If users don't configure their own SMTP, the system will use default settings from `.env` file.

Edit `my-app/.env`:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-company-email@gmail.com"
SMTP_PASSWORD="your-app-password-here"
```

**Note**: This is optional. If not configured, users MUST set up their own SMTP to send emails.

## How It Works

### Email Sending Logic

When a user sends an email:

1. **Check User SMTP**: System checks if the user has configured personal SMTP settings
2. **Use User SMTP**: If configured, email is sent from user's email address
3. **Fallback to System**: If not configured, system uses default SMTP from `.env`
4. **Error if None**: If neither is configured, user gets an error message

### Email Headers

- **From**: User's name with their email or system email
- **Reply-To**: Always set to the actual user's email (from their account)
- **To**: Recipients specified by the user

Example:
```
From: "John Doe" <john@gmail.com>
Reply-To: john@gmail.com
To: alice@example.com, bob@example.com
```

## Security Considerations

### ✅ Best Practices

1. **Use App Passwords**: Never use your main email password
2. **Secure Storage**: SMTP passwords are stored in the database (consider encryption for production)
3. **Environment Variables**: Keep `.env` file secure and never commit to version control
4. **HTTPS**: Always use HTTPS in production to protect credentials in transit

### 🔒 For Production Deployment

1. **Encrypt Passwords**: Consider encrypting SMTP passwords in the database
2. **Use Secrets Manager**: Store system SMTP credentials in a secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)
3. **Rate Limiting**: Implement rate limiting on email sending to prevent abuse
4. **Email Verification**: Verify user email addresses before allowing SMTP configuration
5. **Audit Logging**: Log all email sending activities for security auditing

## Troubleshooting

### Error: "Email service not configured"

**Cause**: Neither user SMTP nor system SMTP is configured.

**Solution**: 
- Configure your personal SMTP in Profile section, OR
- Ask system administrator to configure system SMTP in `.env`

### Error: "Failed to send email: Authentication failed"

**Cause**: Invalid SMTP credentials.

**Solution**:
- Verify your email and app password are correct
- For Gmail, ensure you're using an App Password, not your regular password
- Check that 2-Step Verification is enabled for Gmail

### Error: "EPERM: operation not permitted" during Prisma generate

**Cause**: Development server is running and locking Prisma files.

**Solution**:
- Stop the development server (`Ctrl+C`)
- Run `npx prisma generate` again
- Restart the development server

### Emails not being received

**Possible causes**:
- Check spam/junk folder
- Verify recipient email addresses are correct
- Check SMTP host and port are correct
- Ensure firewall isn't blocking SMTP ports

## Testing Email Configuration

After configuration, test email sending:

1. Create a test meeting
2. Go to the meeting's Agenda page
3. Click "Email Meeting Details" or "Email Agenda PDF"
4. Enter your own email address as recipient
5. Check if you receive the email

## API Routes Updated

The following API routes now support dynamic SMTP:

- `/api/meetings/[id]/email` - Send full agenda email
- `/api/meetings/[id]/email-details` - Send meeting invitation only
- `/api/meetings/[id]/email-agenda-pdf` - Send agenda as PDF attachment

All routes automatically detect and use:
1. User's personal SMTP (if configured)
2. System SMTP (if user SMTP not configured)
3. Return error (if neither is configured)

## Database Schema

New fields added to `User` model:

```prisma
model User {
  // ... existing fields ...
  
  // Optional: User's own SMTP settings for sending emails
  smtpHost     String?
  smtpPort     Int?
  smtpUser     String?
  smtpPassword String?
}
```

## For Buyers/Deployers

When deploying this application:

1. **Initial Setup**: Configure system SMTP in `.env` as fallback
2. **User Onboarding**: Instruct users to configure their own SMTP in Profile
3. **Documentation**: Provide this guide to all users
4. **Support**: Be prepared to help users with email provider-specific setup

## Summary

✅ No more hardcoded personal email credentials
✅ Each user can use their own email
✅ System SMTP as fallback option
✅ Secure credential storage
✅ Easy configuration through UI
✅ Ready for multi-user deployment

For questions or issues, refer to the troubleshooting section or contact support.
