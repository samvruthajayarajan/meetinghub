import { google } from 'googleapis';
import { prisma } from './prisma';

export async function getGmailClient(userEmail: string) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: {
      gmailAccessToken: true,
      gmailRefreshToken: true,
      gmailTokenExpiry: true,
      email: true
    }
  });

  if (!user?.gmailRefreshToken) {
    throw new Error('Gmail not connected. Please authorize Gmail access first.');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/gmail/callback`
  );

  oauth2Client.setCredentials({
    access_token: user.gmailAccessToken,
    refresh_token: user.gmailRefreshToken,
    expiry_date: user.gmailTokenExpiry?.getTime()
  });

  // Refresh token if expired
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      await prisma.user.update({
        where: { email: userEmail },
        data: {
          gmailAccessToken: tokens.access_token,
          gmailRefreshToken: tokens.refresh_token,
          gmailTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
        }
      });
    } else if (tokens.access_token) {
      await prisma.user.update({
        where: { email: userEmail },
        data: {
          gmailAccessToken: tokens.access_token,
          gmailTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
        }
      });
    }
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  return { gmail, userEmail: user.email };
}

export async function sendEmailViaGmail(
  userEmail: string,
  to: string[],
  subject: string,
  htmlBody: string,
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>
) {
  const { gmail, userEmail: fromEmail } = await getGmailClient(userEmail);

  // Create email message
  const boundary = '----=_Part_' + Date.now();
  let message = [
    `From: ${fromEmail}`,
    `To: ${to.join(', ')}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    '',
    htmlBody,
  ];

  // Add attachments if any
  if (attachments && attachments.length > 0) {
    for (const attachment of attachments) {
      message.push(
        `--${boundary}`,
        `Content-Type: ${attachment.contentType}`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${attachment.filename}"`,
        '',
        attachment.content.toString('base64')
      );
    }
  }

  message.push(`--${boundary}--`);

  const encodedMessage = Buffer.from(message.join('\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage
    }
  });

  return response.data;
}

export async function checkGmailConnection(userEmail: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { gmailRefreshToken: true }
    });
    return !!user?.gmailRefreshToken;
  } catch (error) {
    return false;
  }
}

export async function disconnectGmail(userEmail: string) {
  await prisma.user.update({
    where: { email: userEmail },
    data: {
      gmailAccessToken: null,
      gmailRefreshToken: null,
      gmailTokenExpiry: null
    }
  });
}
