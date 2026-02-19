# 🔧 Troubleshooting Guide

## Error: "Failed to fetch meeting"

This error occurs when the Reports page cannot load meeting data from the API.

### Possible Causes:

1. **Server not running**
2. **Database connection issue**
3. **Meeting doesn't exist**
4. **Authentication issue**
5. **Browser cache issue**

---

## ✅ Quick Fixes (Try in order)

### Fix 1: Restart the Server (Most Common)

```bash
# Stop the server
Press Ctrl+C

# Clear Next.js cache
rmdir /s /q .next

# Restart
npm run dev
```

Wait for "Ready" message, then refresh your browser.

---

### Fix 2: Hard Refresh Browser

```
Press: Ctrl + Shift + R
```

This clears the browser cache and reloads the page.

---

### Fix 3: Check Database Connection

```bash
npx prisma db push
```

Should say: "The database is already in sync"

If you see connection errors, check your DATABASE_URL in .env file.

---

### Fix 4: Verify Meeting Exists

1. Go to Dashboard (http://localhost:3000/user)
2. Check if the meeting is listed
3. If not, the meeting may have been deleted
4. Create a new meeting and try again

---

### Fix 5: Check Authentication

1. Sign out and sign back in
2. Make sure you're logged in as the meeting owner
3. Check browser console for 401 errors

---

## 🔍 Detailed Diagnostics

### Check Server Logs

Look at your terminal where `npm run dev` is running.

**Good signs:**
- No error messages
- Shows "Ready" or "Compiled successfully"

**Bad signs:**
- Red error messages
- "ECONNREFUSED" (database connection failed)
- "Module not found" (missing dependencies)

---

### Check Browser Console

1. Press F12 to open Developer Tools
2. Go to "Console" tab
3. Look for red error messages

**Common errors:**

**"401 Unauthorized"**
- Solution: Sign out and sign back in

**"404 Not Found"**
- Solution: Meeting doesn't exist, go back to dashboard

**"500 Internal Server Error"**
- Solution: Check server logs, restart server

**"Failed to fetch"**
- Solution: Server is not running, start it with `npm run dev`

---

### Check Network Tab

1. Press F12 to open Developer Tools
2. Go to "Network" tab
3. Refresh the page
4. Look for the API call to `/api/meetings/[id]`
5. Click on it to see the response

**Status codes:**
- 200: Success ✅
- 401: Not authenticated (sign in again)
- 404: Meeting not found (check meeting ID)
- 500: Server error (check server logs)

---

## 🚨 Nuclear Option: Complete Reset

If nothing works, try this:

```bash
# 1. Stop the server
Press Ctrl+C

# 2. Delete node_modules and .next
rmdir /s /q node_modules
rmdir /s /q .next

# 3. Reinstall dependencies
npm install

# 4. Sync database
npx prisma generate
npx prisma db push

# 5. Restart server
npm run dev
```

Then:
1. Clear browser cache (Ctrl+Shift+R)
2. Sign out and sign back in
3. Try accessing the meeting again

---

## 📊 Common Error Patterns

### Pattern 1: Works on Dashboard, Fails on Reports

**Cause:** Reports page has additional data requirements (agenda, minutes)

**Solution:**
1. Make sure the meeting has agenda items
2. Make sure the meeting has minutes
3. Restart the server

---

### Pattern 2: Works After Server Restart

**Cause:** Next.js cache or hot reload issue

**Solution:**
1. Always delete .next folder before restarting
2. Use `npm run dev` instead of `next dev`
3. Clear browser cache regularly

---

### Pattern 3: Random Failures

**Cause:** Database connection timeout or network issues

**Solution:**
1. Check internet connection
2. Verify MongoDB Atlas cluster is running
3. Check DATABASE_URL in .env is correct
4. Try `npx prisma db push` to test connection

---

## 🆘 Still Not Working?

### Collect Debug Information

1. **Server logs:** Copy the terminal output
2. **Browser console:** Copy any error messages
3. **Network tab:** Screenshot the failed API call
4. **Meeting ID:** Note which meeting is failing

### Check These Files

1. **`.env`** - Make sure DATABASE_URL is correct
2. **`prisma/schema.prisma`** - Should have Meeting, Minutes, Report models
3. **`app/api/meetings/[id]/route.ts`** - Should have GET endpoint

### Test API Directly

Open this URL in your browser (replace [id] with actual meeting ID):
```
http://localhost:3000/api/meetings/[id]
```

You should see JSON data. If you see an error, that's the root cause.

---

## ✅ Prevention Tips

1. **Always restart server** after changing .env or schema
2. **Clear .next folder** when things get weird
3. **Hard refresh browser** (Ctrl+Shift+R) regularly
4. **Check server logs** before reporting issues
5. **Test in incognito mode** to rule out cache issues

---

## 📝 Quick Reference

**Restart server:**
```bash
Ctrl+C
npm run dev
```

**Clear cache:**
```bash
rmdir /s /q .next
```

**Hard refresh browser:**
```
Ctrl + Shift + R
```

**Check database:**
```bash
npx prisma db push
```

**Check API:**
```
http://localhost:3000/api/meetings/[id]
```

---

**Most issues are solved by restarting the server and clearing the cache!** 🚀
