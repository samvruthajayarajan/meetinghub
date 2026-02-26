import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    expectedRedirectUri: `${process.env.NEXTAUTH_URL}/api/auth/gmail/callback`,
  });
}
