import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint keeps the serverless function warm
export async function GET() {
  try {
    // Quick database ping - just count users
    await prisma.user.count();
    
    return NextResponse.json({ 
      status: 'warm',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      error: 'Failed to warm up' 
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
