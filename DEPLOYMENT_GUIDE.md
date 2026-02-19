# Deployment Guide for Buyers/Owners

## Overview

This Meeting Management System is designed to be deployed and used by any organization. Each user can configure their own email settings, making it secure, professional, and scalable.

## Pre-Deployment Checklist

### Required
- [ ] Node.js 18+ installed
- [ ] MongoDB database (MongoDB Atlas or self-hosted)
- [ ] Domain name (for production)
- [ ] SSL certificate (for production)

### Optional
- [ ] Company email for system-wide fallback
- [ ] SMTP server access

## Installation Steps

### 1. Clone/Extract the Project

```bash
# Extract the project files to your server
cd /path/to/your/server
```

### 2. Install Dependencies

```bash
cd my-app
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# Database - REQUIRED
DATABASE_URL="your-mongodb-connection-string"

# Authentication - REQUIRED
NEXTAUTH_SECRET="generate-a-random-secret-key"
NEXTAUTH_URL="https://yourdomain.com"

# Email - OPTIONAL (System Fallback)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@yourcompany.com"
SMTP_PASSWORD="your-app-password"
```

**Important Notes:**

- **DATABASE_URL**: Your MongoDB connection string
- **NEXTAUTH_SECRET**: Generate using: `openssl rand -base64 32`
- **NEXTAUTH_URL**: Your production domain (e.g., https://meetings.yourcompany.com)
- **SMTP Settings**: Optional - only needed if you want a system-wide fallback email

### 4. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with sample data
npx prisma db seed
```

### 5. Build for Production

```bash
npm run build
```

### 6. Start the Application

```bash
# Production mode
npm start

# Or use PM2 for process management
pm2 start npm --name "meeting-system" -- start
```

## Email Configuration Options

You have two options for email functionality:

### Option 1: User-Only Configuration (Recommended)

**How it works:**
- Each user configures their own email in Profile settings
- Emails are sent from the user's personal email
- Most professional and secure

**Setup:**
- Leave SMTP settings in `.env` as placeholders
- Provide users with the `USER_EMAIL_SETUP_GUIDE.md`
- Users configure their email when they first login

**Pros:**
- ✅ Most professional (emails from actual person)
- ✅ Most secure (no shared credentials)
- ✅ Easy to manage (users manage their own)

**Cons:**
- ❌ Each user must configure email
- ❌ Users without email config can't send emails

### Option 2: Hybrid (System Fallback)

**How it works:**
- Configure a company email in `.env`
- Users who configure their own email use their email
- Users who don't configure use the system email

**Setup:**
1. Get a company email (e.g., noreply@yourcompany.com)
2. Generate App Password for that email
3. Update `.env` with real SMTP credentials
4. Users can optionally configure their own email

**Pros:**
- ✅ Works out of the box for all users
- ✅ Users can still use their own email if they want
- ✅ Fallback option available

**Cons:**
- ❌ Less professional (emails from generic address)
- ❌ Shared credentials to manage
- ❌ All users without config use same email

## User Onboarding

### First-Time User Setup

1. **User Registration**
   - Users create their account at `/auth/register`
   - Provide: Name, Email, Password

2. **Email Configuration** (Optional but Recommended)
   - After login, go to Profile
   - Configure SMTP settings
   - See `USER_EMAIL_SETUP_GUIDE.md` for detailed instructions

3. **Start Using**
   - Create meetings
   - Add agendas
   - Record minutes
   - Generate reports
   - Send emails

### Provide to Users

Give your users these documents:
- `USER_EMAIL_SETUP_GUIDE.md` - How to configure email
- Basic usage instructions

## Security Considerations

### Production Checklist

- [ ] Use HTTPS (SSL certificate)
- [ ] Change `NEXTAUTH_SECRET` to a strong random value
- [ ] Use strong database password
- [ ] Enable database authentication
- [ ] Set up firewall rules
- [ ] Regular backups of database
- [ ] Keep dependencies updated
- [ ] Monitor logs for suspicious activity

### Email Security

- [ ] Use App Passwords, not regular passwords
- [ ] Store SMTP credentials securely
- [ ] Consider encrypting SMTP passwords in database (for production)
- [ ] Implement rate limiting on email sending
- [ ] Monitor email sending for abuse

### Database Security

- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Enable database authentication
- [ ] Use strong passwords
- [ ] Regular backups
- [ ] Monitor for unusual activity

## Scaling Considerations

### For Small Teams (1-20 users)
- Single server deployment
- MongoDB Atlas free tier
- User-only email configuration

### For Medium Organizations (20-100 users)
- Load balanced servers
- MongoDB Atlas paid tier
- Hybrid email configuration
- Consider Redis for sessions

### For Large Enterprises (100+ users)
- Kubernetes deployment
- MongoDB replica set
- Dedicated SMTP server
- CDN for static assets
- Monitoring and logging

## Backup and Recovery

### Database Backups

**MongoDB Atlas:**
- Automatic backups enabled by default
- Point-in-time recovery available

**Self-Hosted MongoDB:**
```bash
# Backup
mongodump --uri="your-connection-string" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="your-connection-string" /backup/20240101
```

### Application Backups

- Backup `.env` file (securely)
- Backup uploaded files (if any)
- Version control for code

## Monitoring

### What to Monitor

- Application uptime
- Database connections
- Email sending success/failure
- Error logs
- User activity
- Performance metrics

### Recommended Tools

- **PM2** - Process management
- **Nginx** - Reverse proxy and load balancing
- **MongoDB Atlas** - Built-in monitoring
- **Sentry** - Error tracking
- **Google Analytics** - Usage analytics

## Troubleshooting

### Application Won't Start

**Check:**
- Node.js version (18+)
- Dependencies installed (`npm install`)
- `.env` file exists and is configured
- Database is accessible
- Port 3000 is available

### Database Connection Issues

**Check:**
- MongoDB is running
- Connection string is correct
- IP whitelist (for MongoDB Atlas)
- Network connectivity
- Database authentication

### Email Not Sending

**Check:**
- User has configured email in Profile
- SMTP credentials are correct
- SMTP port is not blocked by firewall
- For Gmail: App Password is used, not regular password
- For Gmail: 2-Step Verification is enabled

### Performance Issues

**Solutions:**
- Enable database indexes
- Use connection pooling
- Implement caching
- Optimize queries
- Scale horizontally

## Updating the Application

### Minor Updates

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart meeting-system
```

### Major Updates (with schema changes)

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Update database schema
npx prisma generate
npx prisma db push

# Rebuild
npm run build

# Restart
pm2 restart meeting-system
```

## Support and Maintenance

### Regular Maintenance Tasks

- [ ] Weekly: Check error logs
- [ ] Weekly: Monitor disk space
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review user feedback
- [ ] Quarterly: Security audit
- [ ] Yearly: Review and update documentation

### Getting Help

1. Check documentation files
2. Review error logs
3. Check GitHub issues (if applicable)
4. Contact support

## Cost Estimation

### Minimal Setup (Small Team)
- **Hosting**: $5-20/month (DigitalOcean, Linode)
- **Database**: Free (MongoDB Atlas free tier)
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)
- **Total**: ~$10-25/month

### Professional Setup (Medium Organization)
- **Hosting**: $50-100/month (AWS, Azure, GCP)
- **Database**: $50-100/month (MongoDB Atlas)
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)
- **Monitoring**: $20-50/month
- **Total**: ~$120-250/month

## Conclusion

This system is designed to be:
- ✅ Easy to deploy
- ✅ Secure by default
- ✅ Scalable for growth
- ✅ Professional and user-friendly
- ✅ Low maintenance

Each user manages their own email configuration, making it perfect for organizations of any size.

## Quick Start Summary

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Edit .env with your settings

# 3. Setup Database
npx prisma generate
npx prisma db push

# 4. Build
npm run build

# 5. Run
npm start
```

**That's it!** Your meeting management system is ready to use.

Provide users with `USER_EMAIL_SETUP_GUIDE.md` and they can configure their email in minutes.
