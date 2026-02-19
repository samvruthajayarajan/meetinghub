# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a new cluster (Free M0 tier is sufficient)

## Step 2: Get Connection String

1. In MongoDB Atlas dashboard, click "Connect"
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/meeting_system?retryWrites=true&w=majority
   ```

## Step 3: Configure Database Access

1. Go to "Database Access" in the left menu
2. Click "Add New Database User"
3. Create a username and password
4. Set privileges to "Read and write to any database"

## Step 4: Configure Network Access

1. Go to "Network Access" in the left menu
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0) for development
4. Click "Confirm"

## Step 5: Update .env File

Replace the DATABASE_URL in your `.env` file with your connection string:

```env
DATABASE_URL="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/meeting_system?retryWrites=true&w=majority"
```

**Important**: Replace:
- `YOUR_USERNAME` with your database username
- `YOUR_PASSWORD` with your database password
- `YOUR_CLUSTER` with your cluster name

## Step 6: Generate Prisma Client

```bash
npx prisma generate
```

## Step 7: Push Schema to MongoDB

```bash
npx prisma db push
```

## Step 8: Seed Database

```bash
npm run db:seed
```

## Step 9: Login

Use these credentials:
- Email: admin@example.com
- Password: password

## Troubleshooting

### Connection Error
- Check if your IP is whitelisted in Network Access
- Verify username and password are correct
- Make sure password doesn't contain special characters that need URL encoding

### Authentication Failed
- Run `npx prisma db push` to ensure schema is synced
- Run `npm run db:seed` to create demo users
- Check server logs for detailed error messages
