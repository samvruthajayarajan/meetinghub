# Report PDF Download Fix

## Problem
The "Download PDF" button in the reports history section was calling the wrong endpoint (`/api/meetings/[id]/pdf`), which generates minutes PDFs. This caused the downloaded report PDFs to show HTML/CSS code instead of the actual formatted report content.

## Root Cause
- The `/api/meetings/[id]/pdf` endpoint is designed for minutes PDFs only
- It uses `generateMinutesPDF()` function which expects minutes data structure
- When used for reports, it was showing raw HTML/CSS code instead of formatted content

## Solution Implemented

### 1. Fixed Download Button in Reports History (reports/page.tsx)
- Changed the "Download PDF" button to use `/api/meetings/[id]/custom-report` endpoint
- The button now reconstructs report data from agenda and minutes before generating PDF
- Report data structure:
  ```typescript
  {
    executiveSummary: minutesData.discussions,
    objectives: agendaData.objectives,
    keyDiscussionPoints: agendaData.agendaItems,
    decisionsTaken: minutesData.decisions,
    actionItems: minutesData.actionItems,
    risksIdentified: agendaData.preparationRequired,
    conclusion: ''
  }
  ```

### 2. Prevented Duplicate Report Records
- Added `x-skip-report-creation` header to prevent creating duplicate report entries
- When downloading from history, the header is set to 'true'
- The custom-report endpoint checks this header and skips database insertion

### 3. Updated custom-report Endpoint
- Modified to check for `x-skip-report-creation` header
- Only creates new report record when generating a fresh report
- Skips record creation when downloading from history

## Files Modified
1. `meetingss/app/meetings/[id]/reports/page.tsx` - Fixed download button logic
2. `meetingss/app/api/meetings/[id]/custom-report/route.ts` - Added conditional report creation

## Testing
After deployment, test the following:
1. Generate a new report - should create a new report record
2. Download PDF from reports history - should NOT create duplicate records
3. Verify downloaded PDF shows formatted content with all 7 sections:
   - Executive Summary
   - Meeting Objectives
   - Key Discussion Points
   - Decisions Taken
   - Action Items
   - Risks Identified
   - Conclusion

## Endpoint Usage Summary
- `/api/meetings/[id]/pdf` - ONLY for minutes PDFs
- `/api/meetings/[id]/custom-report` - ONLY for report PDFs
- `/api/meetings/[id]/agenda-pdf` - ONLY for agenda PDFs

## Deployment
- Committed: 7d10942
- Pushed to: meetinghub/main
- Vercel will auto-deploy
