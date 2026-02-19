# Meeting Management System

A comprehensive meeting management system built with Next.js, featuring agenda creation, minutes recording, report generation, and email notifications.

## Features

- 📅 **Meeting Management** - Create, edit, and manage meetings
- 📋 **Agenda Builder** - Create detailed meeting agendas with objectives, preparation items, and action items
- 📝 **Minutes Recording** - Record meeting discussions, decisions, and action items
- 📊 **Report Generation** - Generate professional PDF reports
- 📧 **Email Notifications** - Send meeting invitations and agendas via email
- 👥 **User Management** - Multi-user support with authentication
- 🔒 **Secure** - User-specific email configuration with secure credential storage
- 💼 **Professional** - Modern, responsive UI with dark theme

## Quick Start

### Prerequisites

- Node.js 18 or higher
- MongoDB database (MongoDB Atlas or self-hosted)

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Setup database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## Email Configuration

This system supports user-specific email configuration. Each user can configure their own SMTP settings to send emails from their personal email address.

### For Users

See `USER_EMAIL_SETUP_GUIDE.md` for detailed instructions on configuring your email.

**Quick Setup:**
1. Login to your account
2. Go to Profile → Email Configuration
3. Enter your SMTP settings (Gmail, Outlook, etc.)
4. Save and start sending emails!

### For Administrators/Deployers

See `DEPLOYMENT_GUIDE.md` for complete deployment instructions.

## Documentation

- 📖 **USER_EMAIL_SETUP_GUIDE.md** - How users configure their email
- 🚀 **DEPLOYMENT_GUIDE.md** - Complete deployment guide for buyers/owners
- 📧 **EMAIL_CONFIGURATION_GUIDE.md** - Technical email configuration details
- 📋 **SETUP_INSTRUCTIONS.md** - Quick setup steps
- 📊 **CHANGES_SUMMARY.md** - Recent changes and updates

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **PDF Generation**: Puppeteer
- **Email**: Nodemailer

## Key Features Explained

### User-Specific Email

Unlike traditional systems with hardcoded email credentials, this system allows each user to configure their own SMTP settings. Benefits:

- ✅ Emails sent from the actual meeting organizer
- ✅ Professional and personalized
- ✅ Secure (no shared credentials)
- ✅ Scalable for any organization size

### Meeting Workflow

1. **Create Meeting** - Set title, date, location, mode (online/offline)
2. **Build Agenda** - Add objectives, preparation items, and agenda items
3. **Share Agenda** - Email meeting details or full agenda PDF
4. **Record Minutes** - Document discussions, decisions, and action items
5. **Generate Reports** - Create professional PDF reports
6. **Archive** - All meetings and reports stored for future reference

## Project Structure

```
my-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── meetings/          # Meeting pages
│   └── user/              # User profile page
├── components/            # React components
├── lib/                   # Utility libraries
├── prisma/               # Database schema
└── public/               # Static assets
```

## Environment Variables

Required variables in `.env`:

```env
DATABASE_URL="your-mongodb-connection-string"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional: System-wide email fallback
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Deployment

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

**Quick Deploy:**
1. Set up MongoDB database
2. Configure environment variables
3. Run `npm install && npm run build`
4. Start with `npm start` or use PM2

## Security

- 🔒 Secure authentication with NextAuth.js
- 🔐 Password hashing with bcrypt
- 🛡️ SMTP credentials stored securely in database
- 🔑 App Passwords recommended for email (not regular passwords)
- 🌐 HTTPS recommended for production

## API Endpoints

### Meetings
- `GET /api/meetings` - List all meetings
- `POST /api/meetings` - Create new meeting
- `GET /api/meetings/[id]` - Get meeting details
- `PUT /api/meetings/[id]` - Update meeting
- `DELETE /api/meetings/[id]` - Delete meeting

### Email
- `POST /api/meetings/[id]/email` - Send full agenda email
- `POST /api/meetings/[id]/email-details` - Send meeting invitation only
- `POST /api/meetings/[id]/email-agenda-pdf` - Send agenda as PDF attachment

### Reports
- `GET /api/meetings/[id]/pdf` - Generate meeting report PDF
- `GET /api/meetings/[id]/agenda-pdf` - Generate agenda PDF
- `POST /api/meetings/[id]/minutes` - Add/update minutes

### User
- `GET /api/users/smtp-config` - Get user's SMTP configuration
- `POST /api/users/smtp-config` - Update user's SMTP configuration

## Support

For issues or questions:
1. Check the documentation files
2. Review the troubleshooting sections
3. Check error logs
4. Contact your system administrator

## License

MIT

## Credits

Built with Next.js, Prisma, MongoDB, and other amazing open-source technologies.

---

**Ready to get started?** Follow the Quick Start guide above or see `DEPLOYMENT_GUIDE.md` for production deployment.
