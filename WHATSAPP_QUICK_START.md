# WhatsApp Quick Start (5 Minutes)

## What Changed?

WhatsApp messages are now sent **automatically from the backend** without opening WhatsApp. Just enter phone numbers and click send!

## Quick Setup (Twilio Sandbox - FREE)

### Step 1: Get Twilio Account (2 min)
1. Go to https://console.twilio.com/
2. Sign up (free $15 credit included)
3. Copy your **Account SID** and **Auth Token** from dashboard

### Step 2: Join Sandbox (1 min)
1. In Twilio Console: **Messaging** → **Try it out** → **Send a WhatsApp message**
2. You'll see instructions like:
   ```
   Send "join happy-tiger" to +1 415 523 8886
   ```
3. Open WhatsApp on your phone
4. Send that message to the number shown
5. You'll get a confirmation

### Step 3: Configure App (1 min)
Add to your `.env` file:
```env
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
```

### Step 4: Restart Server (1 min)
```bash
# Stop your dev server (Ctrl+C)
npm run dev
```

## How to Use

1. Go to any meeting
2. Click **"Share via WhatsApp"**
3. Enter phone numbers (one per line):
   ```
   +1234567890
   +919876543210
   ```
4. Click **Send**
5. Messages sent automatically! ✅

## Important Notes

### Phone Number Format
- ✅ Always include country code: `+1234567890`
- ❌ Don't forget the `+`: `1234567890`

### Sandbox Mode
- Recipients must join sandbox first (send "join your-code" to sandbox number)
- Free for testing
- Good for development

### Production Mode
- Apply for WhatsApp Business number in Twilio
- No sandbox joining required
- Send to any WhatsApp number

## What Gets Sent?

Each message includes:
- 📋 Meeting details (title, date, time)
- 👤 Organizer info
- 📝 Agenda summary
- 📊 Minutes summary
- 📎 PDF download links

## Pricing

- **Sandbox**: FREE
- **Production**: ~$0.005-$0.02 per message
- **Free Credit**: $15 (enough for 750-3000 messages)

## Troubleshooting

**"Twilio credentials not configured"**
→ Check `.env` file and restart server

**Messages not received**
→ Recipient must join sandbox first (for sandbox mode)

**Invalid phone number**
→ Use format: `+countrycode` + `number` (e.g., `+1234567890`)

## Need Help?

See full guide: `WHATSAPP_SETUP_GUIDE.md`
