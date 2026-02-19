# WhatsApp PDF Sharing

## Overview
The WhatsApp sharing feature generates PDFs and provides download links that can be shared via WhatsApp to multiple recipients simultaneously.

## How It Works

1. **PDF Generation**: When you click "Send via WhatsApp", the system:
   - Generates a Meeting Report PDF (with agenda and minutes)
   - Generates an Agenda PDF (agenda only)
   - Saves both PDFs to `public/temp-pdfs/` folder
   - Creates unique filenames with timestamps

2. **Multiple Recipients**: 
   - Enter multiple phone numbers (one per line)
   - System generates the same message with PDF links for all recipients
   - Opens separate WhatsApp windows for each recipient (with 500ms delay between each)

3. **WhatsApp Message**: Opens WhatsApp Web with a pre-filled message containing:
   - Meeting details summary
   - Download links for both PDFs
   - Note that links are valid for 24 hours

4. **File Cleanup**: PDFs are automatically cleaned up after 24 hours

## Usage

### Sending to Multiple Recipients

1. Click "Send via WhatsApp" button
2. Enter phone numbers in the textarea (one per line)
   ```
   +1234567890
   +9876543210
   +1122334455
   ```
3. Click "Send WhatsApp"
4. System will prompt you for each recipient one at a time
5. For each recipient:
   - Click OK on the confirmation dialog
   - WhatsApp Web will open with the pre-filled message
   - Send the message to that recipient
   - After 3 seconds, you'll be prompted for the next recipient
6. Repeat until all recipients have been messaged

### Why One at a Time?

WhatsApp Web only allows one active session at a time. If you open multiple WhatsApp windows simultaneously, they will all share the same session and interfere with each other. By opening them one at a time with confirmation prompts, you can:
- Send the message to each recipient properly
- Verify each message was sent before moving to the next
- Avoid confusion with multiple windows

### Important Notes

- Include country code for all phone numbers (e.g., +1 for USA)
- No spaces or special characters in phone numbers
- Wait for each message to send before clicking OK for the next recipient
- You can cancel at any time by clicking Cancel on the confirmation dialog
- All recipients receive the same PDF links (PDFs are generated once)

## Technical Details

### PDF Storage
- Location: `public/temp-pdfs/`
- Naming: `meeting-report-{title}-{timestamp}.pdf` and `agenda-{title}-{timestamp}.pdf`
- Lifetime: 24 hours

### Cleanup
PDFs older than 24 hours are automatically deleted. You can manually trigger cleanup by calling:

```bash
curl -X POST http://localhost:3000/api/cleanup-temp-pdfs
```

Or set up a cron job to run this endpoint daily.

### Security Considerations

1. **Public Access**: PDFs are stored in the public folder and accessible via direct URL
2. **Temporary Storage**: Files are automatically deleted after 24 hours
3. **Unique Names**: Timestamps prevent filename collisions
4. **No Authentication**: Anyone with the link can download the PDF (by design for WhatsApp sharing)

## Limitations

- WhatsApp Web API doesn't support direct file attachments
- Recipients must click the link to download PDFs
- Links expire after 24 hours
- PDFs are publicly accessible during the 24-hour window
- **WhatsApp Web only supports one active session** - messages must be sent one recipient at a time
- Cannot send to multiple recipients simultaneously due to WhatsApp Web limitations

## Alternative Approaches

If you need to send to many recipients more efficiently:

1. **Use Email Instead** - Email supports multiple recipients and direct PDF attachments
2. **WhatsApp Business API** - Requires business account and API access, supports automated messaging
3. **Create a WhatsApp Group** - Add all recipients to a group and send once
4. **Use a Third-Party Service** - Services like Twilio, MessageBird support bulk WhatsApp messaging
5. **Manual Copy-Paste** - Copy the message and PDF links, paste manually in WhatsApp

For most use cases, email is the recommended approach for multiple recipients as it:
- Supports unlimited recipients
- Includes PDFs as direct attachments
- Doesn't require manual intervention for each recipient
- Provides delivery confirmation

## Maintenance

### Manual Cleanup
To manually clean up old PDFs:
```bash
# Via API
curl -X POST http://localhost:3000/api/cleanup-temp-pdfs

# Or delete the folder
rm -rf public/temp-pdfs/*
```

### Automated Cleanup (Recommended)
Set up a cron job or scheduled task to call the cleanup endpoint daily:

**Linux/Mac (crontab):**
```bash
0 2 * * * curl -X POST http://your-domain.com/api/cleanup-temp-pdfs
```

**Windows (Task Scheduler):**
Create a scheduled task that runs daily and executes:
```powershell
Invoke-WebRequest -Uri "http://your-domain.com/api/cleanup-temp-pdfs" -Method POST
```

## Troubleshooting

### PDFs not generating
- Check Puppeteer is installed: `npm list puppeteer`
- Check server logs for errors
- Ensure sufficient disk space

### Links not working
- Verify `public/temp-pdfs/` folder exists
- Check file permissions
- Ensure Next.js is serving static files from public folder

### WhatsApp not opening
- Verify phone number format (include country code, no spaces)
- Check browser allows opening WhatsApp Web
- Try with different browsers
- Allow popups for multiple recipients
- If sending to many recipients, try smaller batches (5-10 at a time)
