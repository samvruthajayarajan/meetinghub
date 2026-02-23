# MeetingHub

A modern meeting management system built with Next.js, MongoDB, and Prisma.

## Features

- 📅 Meeting scheduling and management
- 📝 Agenda creation and tracking
- 📋 Meeting minutes recording
- 📄 PDF report generation
- 📧 Email notifications
- 💬 WhatsApp integration (optional)
- 🔐 Secure authentication with NextAuth
- 📱 Fully responsive design

## Tech Stack

- **Framework**: Next.js 16
- **Database**: MongoDB Atlas with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **PDF Generation**: Puppeteer
- **Email**: Nodemailer / Gmail API

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/samvruthajayarajan/meetinghub.git
   cd meetinghub
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Setup environment variables
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="your-mongodb-connection-string"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. Generate Prisma Client
   ```bash
   npx prisma generate
   ```

5. Run the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Deployment

See `VERCEL_SETUP_GUIDE.md` for detailed Vercel deployment instructions.

## Project Structure

```
meetingss/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── meetings/       # Meeting pages
│   └── user/           # User dashboard
├── components/         # React components
├── lib/               # Utility functions
├── prisma/            # Database schema
├── public/            # Static assets
└── docs/              # Documentation
```

## License

MIT
