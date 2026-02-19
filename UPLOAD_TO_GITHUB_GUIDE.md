# Upload to GitHub via Website (No Git Installation Required)

## Method 1: Upload via GitHub Web Interface (Easiest)

### Step 1: Prepare Your Files
1. Go to `C:\Users\NANO\Desktop\IITS\my-app`
2. Select ALL files and folders EXCEPT:
   - `node_modules` folder (too large, will be regenerated)
   - `.next` folder (build files, will be regenerated)
   - `.env` file (contains sensitive data)

### Step 2: Create ZIP File
1. Select all the files (except the ones mentioned above)
2. Right-click → "Send to" → "Compressed (zipped) folder"
3. Name it `meetinghub-code.zip`

### Step 3: Upload to GitHub
1. Go to: https://github.com/samvruthajayarajan/Meetinghub
2. Sign in to your GitHub account
3. Click the "Add file" button (top right)
4. Select "Upload files"
5. Drag and drop your files OR click "choose your files"
6. Add commit message: "Updated UI with modern dark theme and purple-blue gradients"
7. Click "Commit changes"

**Note:** GitHub web interface has a 100 file limit per upload. If you hit this limit, use Method 2 below.

---

## Method 2: GitHub Desktop (No Command Line)

### Step 1: Install GitHub Desktop
1. Download from: https://desktop.github.com/
2. Install and sign in with your GitHub account

### Step 2: Clone Repository
1. Open GitHub Desktop
2. File → Clone Repository
3. Select "URL" tab
4. Enter: `https://github.com/samvruthajayarajan/Meetinghub.git`
5. Choose local path (e.g., `C:\Users\NANO\Desktop\GitHub\Meetinghub`)
6. Click "Clone"

### Step 3: Copy Your Files
1. Open the cloned folder
2. Delete everything inside (except .git folder if visible)
3. Copy ALL files from `C:\Users\NANO\Desktop\IITS\my-app` to the cloned folder
4. EXCEPT: `node_modules`, `.next`, `.env`

### Step 4: Commit and Push
1. Go back to GitHub Desktop
2. You'll see all changed files listed
3. Add commit message: "Updated UI with modern dark theme"
4. Click "Commit to main"
5. Click "Push origin" button at the top

---

## Method 3: Manual File-by-File Upload (If Methods 1 & 2 Don't Work)

### For Small Updates:
1. Go to: https://github.com/samvruthajayarajan/Meetinghub
2. Navigate to the file you want to update
3. Click the pencil icon (Edit)
4. Make changes
5. Commit changes

### For New Files:
1. Go to the folder where you want to add the file
2. Click "Add file" → "Create new file"
3. Copy-paste the content
4. Commit

---

## What Files to Upload

### ✅ MUST UPLOAD:
- `app/` folder (all pages and components)
- `components/` folder
- `lib/` folder
- `prisma/` folder
- `public/` folder (except temp-pdfs)
- `scripts/` folder
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.mjs`
- `middleware.ts`
- `.gitignore`
- All `.md` files (README, guides, etc.)

### ❌ DO NOT UPLOAD:
- `node_modules/` (too large, auto-generated)
- `.next/` (build files, auto-generated)
- `.env` (contains sensitive passwords)
- `public/temp-pdfs/` (temporary files)

---

## After Upload - Setup Instructions for Others

Create a `.env.example` file with this content:

```env
# Database
DATABASE_URL="your_mongodb_connection_string"

# NextAuth
NEXTAUTH_SECRET="your_secret_key_here"
NEXTAUTH_URL="http://localhost:3000"

# System SMTP (Optional - fallback if user doesn't configure their own)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

---

## Quick Summary of Changes Made

### UI Updates:
- ✅ Sign-in page: Purple-blue gradient theme
- ✅ Register page: Modern dark split-screen layout
- ✅ Reverted main app to professional dark theme
- ✅ Clean globals.css with dark theme variables

### Features (Already Implemented):
- ✅ Dynamic SMTP configuration per user
- ✅ PDF generation for meetings and agendas
- ✅ Email sharing with PDF attachments
- ✅ WhatsApp sharing with download links
- ✅ Report deletion functionality
- ✅ Multi-recipient email support
- ✅ User authentication with NextAuth
- ✅ MongoDB database integration

---

## Troubleshooting

### "File too large" error
- Make sure you excluded `node_modules` and `.next`
- Upload in smaller batches

### "Repository already exists"
- That's fine! Just upload/replace the files
- Or delete the repository and create a new one

### Can't see changes after upload
- Clear browser cache
- Wait a few minutes for GitHub to process

---

## Need Help?

If you encounter issues:
1. Check GitHub's upload limits: https://docs.github.com/en/repositories/working-with-files/managing-large-files
2. Use GitHub Desktop (Method 2) - it's the most reliable
3. Contact GitHub Support if needed

---

## Recommended: Use GitHub Desktop

**Why GitHub Desktop is best:**
- ✅ No command line needed
- ✅ Visual interface
- ✅ Handles large projects easily
- ✅ No file size limits
- ✅ Automatic .gitignore handling
- ✅ Easy to sync future changes

Download: https://desktop.github.com/
