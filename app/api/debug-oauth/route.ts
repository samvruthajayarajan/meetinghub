import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set (hidden)' : 'Not set',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set (hidden)' : 'Not set',
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    expectedCallbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
    expectedGmailCallbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/gmail/callback`,
  });
}
