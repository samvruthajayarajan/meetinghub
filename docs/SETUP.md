# MeetingHub Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment Variables**
   Copy `.env.example` to `.env` and fill in your values:
   - `DATABASE_URL` - MongoDB Atlas connection string
   - `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for local)
   - `NEXTAUTH_SECRET` - Random secret for NextAuth
   - `GOOGLE_CLIENT_ID` - Google OAuth credentials (optional)
   - `GOOGLE_CLIENT_SECRET` - Google OAuth credentials (optional)

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

See `VERCEL_SETUP_GUIDE.md` for detailed instructions.

## Features

- Meeting management
- Agenda creation
- Minutes recording
- PDF report generation
- Email notifications
- WhatsApp integration (optional)
