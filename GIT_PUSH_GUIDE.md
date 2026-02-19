# Git Push Guide for MeetingHub

## Step 1: Install Git

1. Download Git for Windows from: https://git-scm.com/download/win
2. Run the installer with default settings
3. Restart your terminal/command prompt

## Step 2: Configure Git (First Time Only)

Open Command Prompt or PowerShell and run:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Initialize and Push to GitHub

Navigate to your project folder and run these commands:

```bash
cd C:\Users\NANO\Desktop\IITS\my-app

# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "feat: Redesigned auth pages with modern dark UI and purple-blue gradients

- Updated sign-in page with purple-blue gradient theme
- Redesigned register page with split-screen modern layout
- Reverted main app from purple theme to professional dark theme
- Added glass-morphism effects and smooth transitions
- Improved responsive design for mobile devices"

# Set main branch
git branch -M main

# Add remote repository
git remote add origin https://github.com/samvruthajayarajan/Meetinghub.git

# Push to GitHub
git push -u origin main
```

## If Repository Already Exists

If you get an error saying the repository already exists, use:

```bash
# Force push (WARNING: This will overwrite remote repository)
git push -u origin main --force

# OR pull first, then push
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## Alternative: GitHub Desktop

If you prefer a GUI:

1. Download GitHub Desktop: https://desktop.github.com/
2. Install and sign in with your GitHub account
3. Click "Add" → "Add Existing Repository"
4. Select folder: C:\Users\NANO\Desktop\IITS\my-app
5. Click "Publish repository" or "Push origin"

## Changes Made Today

### UI Redesign
- ✅ Sign-in page: Purple-blue gradient theme with split-screen layout
- ✅ Register page: Modern dark UI with branding section
- ✅ Reverted main app from light purple to dark theme
- ✅ Updated globals.css with clean dark theme variables

### Previous Features (Already Implemented)
- ✅ Dynamic SMTP configuration per user
- ✅ PDF generation for meetings and agendas
- ✅ Email sharing with PDF attachments
- ✅ WhatsApp sharing with download links
- ✅ Report deletion functionality
- ✅ Multi-recipient support

## Troubleshooting

### "Git is not recognized"
- Make sure Git is installed
- Restart your terminal after installation
- Check if Git is in PATH: `where.exe git`

### Authentication Issues
- GitHub may require a Personal Access Token instead of password
- Generate token at: https://github.com/settings/tokens
- Use token as password when prompted

### Permission Denied
- Make sure you have write access to the repository
- Check if you're logged in to the correct GitHub account

## Quick Commands Reference

```bash
# Check status
git status

# View changes
git diff

# Add specific files
git add path/to/file

# Commit with message
git commit -m "Your message"

# Push changes
git push

# Pull latest changes
git pull

# View commit history
git log --oneline
```
