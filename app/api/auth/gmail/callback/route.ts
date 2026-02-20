import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/user?error=gmail_auth_failed', req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/user?error=no_code', req.url));
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/gmail/callback`
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.refresh_token) {
      return NextResponse.redirect(new URL('/user?error=no_refresh_token', req.url));
    }

    // Save tokens to database
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        gmailAccessToken: tokens.access_token || null,
        gmailRefreshToken: tokens.refresh_token,
        gmailTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      }
    });

    return NextResponse.redirect(new URL('/user?success=gmail_connected', req.url));
  } catch (error: any) {
    console.error('Gmail OAuth error:', error);
    return NextResponse.redirect(new URL('/user?error=token_exchange_failed', req.url));
  }
}
