# Reports Page - How It Works

## Current Functionality

The Reports page at `/meetings/[id]/reports` has TWO main sections:

### 1. Create Report Section (Always Visible)
- Shows a "Generate Meeting Report" button
- When clicked, opens a form with 7 sections:
  1. Executive Summary
  2. Meeting Objectives
  3. Key Discussion Points
  4. Decisions Taken
  5. Action Items
  6. Risks Identified
  7. Conclusion
- Fill in the form and click "Generate Report"
- This creates a PDF and saves it to the database

### 2. Generated Reports History (Shows After Creating Reports)
- This section appears ONLY if you have created reports
- Shows all previously generated reports with:
  - Report version number
  - Generation date/time
  - View button (expand to see full content)
  - Download PDF button
  - Download Agenda PDF button
  - Delete button
- Each report shows:
  - Meeting information
  - Agenda (if created)
  - Minutes (if created)

---

## How to See Reports

### Step 1: Create a Report
1. Go to `/meetings/[id]/reports`
2. Click "Create Report" button
3. Fill in the form (at least some fields)
4. Click "Generate Report"
5. PDF will download automatically
6. Report is saved to database

### Step 2: View Reports History
1. After creating a report, the page will refresh
2. You'll see "Generated Reports" section appear
3. Click "View Report" to expand and see content
4. Click "Download PDF" to download again
5. Click "Agenda PDF" to download agenda separately

---

## Share Reports

The "Share Report" section lets you:
- Send via Email (with PDF attachment)
- Send via WhatsApp (with download link)

This works for the CURRENT form data, not saved reports.

---

## Why You Might Not See Reports

If you don't see the "Generated Reports History" section, it means:
1. No reports have been created yet for this meeting
2. The database query failed (check console for errors)
3. The meeting fetch didn't include reports (unlikely - it's in the API)

---

## To Fix: Check if Reports Exist

Run this in your database to see if reports exist:
```sql
SELECT * FROM Report WHERE meetingId = 'your-meeting-id';
```

If no reports exist, create one using the form on the reports page.

---

## Current Status

✅ Reports page exists and works
✅ Create report form works
✅ PDF generation works
✅ Reports are saved to database
✅ Reports history section exists
✅ View/Download/Delete buttons work
✅ Share via email/WhatsApp works

❓ Reports might not be showing because none have been created yet

---

## Next Steps

1. Go to a meeting's reports page
2. Click "Create Report"
3. Fill in at least the Executive Summary
4. Click "Generate Report"
5. The "Generated Reports History" section should appear
6. You can now view, download, and share your reports

---

## Technical Details

- Reports are stored in the `Report` table
- Each report has a version number (auto-incremented)
- Reports include the meeting data at the time of generation
- PDFs are generated on-demand (not stored in database)
- The form pre-populates with data from agenda and minutes if available
