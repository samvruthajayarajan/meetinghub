import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch current SMTP configuration
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
        gmailRefreshToken: true,
        // Don't return password for security
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      smtpHost: user.smtpHost,
      smtpPort: user.smtpPort,
      smtpUser: user.smtpUser,
      gmailRefreshToken: !!user.gmailRefreshToken // Return boolean, not the actual token
    });
  } catch (error: any) {
    console.error('Error fetching SMTP config:', error);
    return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 });
  }
}

// POST - Update SMTP configuration
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { smtpHost, smtpPort, smtpUser, smtpPassword } = body;

    // Build update data - only include password if provided
    const updateData: any = {
      smtpHost: smtpHost?.trim() || null,
      smtpPort,
      smtpUser: smtpUser?.trim() || null
    };

    // Only update password if a new one is provided
    if (smtpPassword) {
      // Trim whitespace from password
      updateData.smtpPassword = smtpPassword.trim();
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        smtpHost: true,
        smtpPort: true,
        smtpUser: true
      }
    });

    return NextResponse.json({
      message: 'SMTP configuration updated successfully',
      config: user
    });
  } catch (error: any) {
    console.error('Error updating SMTP config:', error);
    return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 });
  }
}
