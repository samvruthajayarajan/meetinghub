# Application Routes

## Public Routes
- `/` - Home page (landing page with features)
- `/auth/signin` - Sign in page

## Protected Routes (Require Authentication)

### Admin Routes (ADMIN role only)
- `/admin` - Admin dashboard with system-wide analytics
  - View all meetings from all users
  - System statistics
  - Full CRUD operations

### User Routes (USER role)
- `/user` - User dashboard
  - View personal meetings only
  - Create and manage own meetings

### Shared Protected Routes (Both roles)
- `/meetings/new` - Create new meeting
- `/meetings/[id]` - View meeting details
  - View agenda items
  - Record/edit minutes
  - Download PDF
  - Email reports

### API Routes
- `POST /api/auth/[...nextauth]` - NextAuth authentication
- `POST /api/auth/register` - User registration
- `GET /api/meetings` - List meetings (filtered by role)
- `POST /api/meetings` - Create meeting
- `GET /api/meetings/[id]` - Get meeting details
- `PUT /api/meetings/[id]` - Update meeting
- `DELETE /api/meetings/[id]` - Delete meeting
- `POST /api/meetings/[id]/minutes` - Add/update minutes
- `GET /api/meetings/[id]/pdf` - Generate PDF report
- `POST /api/meetings/[id]/email` - Email report
- `GET /api/users` - List users (admin only)

## Routing Logic

### Middleware Protection
- Unauthenticated users accessing protected routes → Redirect to `/auth/signin`
- Authenticated users accessing `/auth/signin` → Redirect to dashboard
- Admin accessing `/user` → Redirect to `/admin`
- User accessing `/admin` → Redirect to `/user`
- Anyone accessing `/dashboard` → Redirect to role-specific dashboard

### Role-Based Redirects
- After login:
  - ADMIN → `/admin`
  - USER → `/user`
- Sign out → `/` (home page)

## Navigation Flow

```
Home (/) 
  → Sign In (/auth/signin)
    → Admin Dashboard (/admin) [if ADMIN]
    → User Dashboard (/user) [if USER]
      → Create Meeting (/meetings/new)
      → View Meeting (/meetings/[id])
        → Edit Minutes
        → Download PDF
        → Email Report
```
