# Setup Instructions

## Prerequisites
- Node.js installed
- PostgreSQL installed and running

## Step-by-Step Setup

### 1. Install PostgreSQL (if not installed)
Download from: https://www.postgresql.org/download/windows/

### 2. Create Database
Open PostgreSQL command line (psql) or pgAdmin and run:
```sql
CREATE DATABASE meeting_system;
```

### 3. Configure Environment Variables
The `.env` file has been created. Update it with your credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/meeting_system"
NEXTAUTH_SECRET="generate-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (optional for now)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### 4. Run Database Migration
```bash
npx prisma migrate dev --name init
```

### 5. Seed Database with Demo Users
```bash
npm run db:seed
```

This creates:
- Admin: admin@example.com / password
- User: user@example.com / password

### 6. Access the Application
The dev server is already running at: http://localhost:3000

Login with:
- Email: admin@example.com
- Password: password

## Features Available

✅ User Authentication (Sign In/Sign Out)
✅ Create Meetings with Agenda Items
✅ View Meeting Dashboard
✅ Record Meeting Minutes
✅ Generate PDF Reports
✅ Email Reports
✅ Search & Filter Meetings
✅ Role-based Access (Admin/User)

## Troubleshooting

### Database Connection Error
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database exists: `psql -l`

### Migration Errors
- Delete prisma/migrations folder
- Run: `npx prisma migrate reset`
- Run: `npx prisma migrate dev --name init`

### Port Already in Use
- Stop the dev server: Ctrl+C
- Change port: `npm run dev -- -p 3001`
