import twilio from 'twilio';

// Initialize Twilio client
function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
  }
  
  return twilio(accountSid, authToken);
}

export async function sendWhatsAppMessage(
  to: string,
  message: string,
  mediaUrl?: string
) {
  // Check if Twilio is configured
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;
  
  if (!accountSid || !authToken || !from || 
      accountSid === 'your-twilio-account-sid' || 
      authToken === 'your-twilio-auth-token') {
    throw new Error('Twilio WhatsApp is not configured. Please set up Twilio credentials in .env file. See WHATSAPP_SETUP_GUIDE.md for instructions.');
  }
  
  const client = getTwilioClient();
  
  try {
    // Format phone number for WhatsApp
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    const messageOptions: any = {
      from,
      to: formattedTo,
      body: message,
    };
    
    // Add media URL if provided (for sending PDFs)
    if (mediaUrl) {
      messageOptions.mediaUrl = [mediaUrl];
    }
    
    const result = await client.messages.create(messageOptions);
    
    return {
      success: true,
      messageId: result.sid,
      status: result.status,
    };
  } catch (error: any) {
    console.error('WhatsApp send error:', error);
    throw new Error(`Failed to send WhatsApp message: ${error.message}`);
  }
}

export async function sendWhatsAppToMultiple(
  phoneNumbers: string[],
  message: string,
  mediaUrl?: string
) {
  const results = [];
  const errors = [];
  
  for (const phoneNumber of phoneNumbers) {
    try {
      const result = await sendWhatsAppMessage(phoneNumber, message, mediaUrl);
      results.push({
        phoneNumber,
        ...result,
      });
    } catch (error: any) {
      errors.push({
        phoneNumber,
        error: error.message,
      });
    }
  }
  
  return {
    successful: results,
    failed: errors,
    totalSent: results.length,
    totalFailed: errors.length,
  };
}
