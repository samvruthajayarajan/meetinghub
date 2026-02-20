# WhatsApp Integration Setup Guide

This guide will help you set up WhatsApp messaging using Twilio's WhatsApp Business API.

## Overview

The app can now send WhatsApp messages programmatically without opening WhatsApp. Messages are sent directly from the backend using Twilio's API.

## Setup Steps

### 1. Create a Twilio Account

1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account (includes $15 credit)
3. Verify your email and phone number

### 2. Get Your Credentials

1. From the Twilio Dashboard, find:
   - **Account SID** (starts with AC...)
   - **Auth Token** (click to reveal)
2. Copy these values

### 3. Enable WhatsApp

#### Option A: Twilio Sandbox (For Testing - FREE)

1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. You'll see a sandbox number like: `+1 415 523 8886`
3. **Important**: Recipients must join the sandbox first:
   - Send a WhatsApp message to `+1 415 523 8886`
   - Message content: `join <your-sandbox-code>` (e.g., `join happy-tiger`)
   - You'll receive a confirmation message
4. Use this number in your .env: `whatsapp:+14155238886`

**Sandbox Limitations:**
- Recipients must join the sandbox before receiving messages
- Good for testing only
- Free to use

#### Option B: Production WhatsApp Number (For Production)

1. Go to **Messaging** → **Senders** → **WhatsApp senders**
2. Click **Request to enable my Twilio numbers for WhatsApp**
3. Follow the approval process (requires business verification)
4. Once approved, use your number: `whatsapp:+1234567890`

**Production Benefits:**
- Send to any WhatsApp number
- No sandbox joining required
- Professional setup

### 4. Configure Environment Variables

Add these to your `.env` file:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
```

**Important Notes:**
- Replace `ACxxxxxxxx...` with your actual Account SID
- Replace `your_auth_token_here` with your actual Auth Token
- For sandbox, use: `whatsapp:+14155238886`
- For production, use: `whatsapp:+YOUR_APPROVED_NUMBER`

### 5. Test the Integration

1. Make sure recipients have joined the Twilio sandbox (if using sandbox)
2. In your app, go to a meeting
3. Click "Share via WhatsApp"
4. Enter phone numbers with country code (e.g., `+1234567890`)
5. Click Send

## Phone Number Format

Always include the country code:
- ✅ Correct: `+1234567890` (US)
- ✅ Correct: `+919876543210` (India)
- ✅ Correct: `+447123456789` (UK)
- ❌ Wrong: `1234567890` (missing +)
- ❌ Wrong: `9876543210` (missing country code)

## Multiple Recipients

You can send to multiple numbers at once:
```
+1234567890
+919876543210
+447123456789
```

The system will send messages to all numbers automatically.

## Message Content

Each WhatsApp message includes:
- Meeting title, date, time
- Organizer information
- Meeting mode and link
- Agenda summary
- Minutes summary (if available)
- PDF download links (report and agenda)

## Pricing

### Twilio Sandbox (Testing)
- **FREE** for testing
- No charges for sandbox messages

### Production WhatsApp
- **Conversation-based pricing**
- Business-initiated: ~$0.005 - $0.02 per message (varies by country)
- User-initiated: FREE for 24 hours after user messages you
- Check [Twilio WhatsApp Pricing](https://www.twilio.com/whatsapp/pricing)

### Free Trial Credit
- New accounts get $15 credit
- Enough for ~750-3000 messages (depending on country)

## Troubleshooting

### Error: "Twilio credentials not configured"
- Make sure `.env` has all three Twilio variables
- Restart your development server after adding variables

### Error: "Failed to send WhatsApp message"
- Check if recipient joined the sandbox (for sandbox mode)
- Verify phone number format includes country code
- Check Twilio console for error details

### Messages not received
- Recipient must have WhatsApp installed
- For sandbox: Recipient must join sandbox first
- Check phone number format
- Verify Twilio account has credit

### Sandbox joining not working
- Make sure to send exact message: `join <your-code>`
- Send to correct sandbox number
- Wait a few seconds for confirmation

## Alternative Services

If you prefer not to use Twilio, you can integrate:

1. **WhatsApp Cloud API** (Meta/Facebook)
   - Direct from Meta
   - Free for first 1000 conversations/month
   - More complex setup

2. **MessageBird**
   - Similar to Twilio
   - Good international coverage

3. **Vonage (Nexmo)**
   - Another Twilio alternative
   - Competitive pricing

## Security Notes

- Never commit `.env` file to Git
- Keep Auth Token secret
- Rotate credentials if exposed
- Use environment variables in production
- Monitor usage in Twilio console

## Support

- Twilio Documentation: https://www.twilio.com/docs/whatsapp
- Twilio Support: https://support.twilio.com/
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp

## Next Steps

After setup:
1. Test with sandbox number
2. Verify messages are received
3. For production, apply for WhatsApp Business number
4. Monitor usage and costs in Twilio console
