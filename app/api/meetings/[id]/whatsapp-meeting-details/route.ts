import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { phoneNumbers } = await request.json();

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return NextResponse.json({ error: 'Phone numbers are required' }, { status: 400 });
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Build WhatsApp message
    let message = `*Meeting Details*\n\n`;
    message += `*Title:* ${meeting.title}\n`;
    message += `*Date:* ${new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    message += `*Time:* ${new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}\n`;
    message += `*Mode:* ${(meeting.meetingMode || 'Offline').charAt(0).toUpperCase() + (meeting.meetingMode || 'Offline').slice(1)}\n`;
    if (meeting.location) {
      message += `*Location:* ${meeting.location}\n`;
    }
    if (meeting.meetingLink && (meeting.meetingMode === 'online' || meeting.meetingMode === 'hybrid')) {
      message += `*Meeting Link:* ${meeting.meetingLink}\n`;
    }

    const encodedMessage = encodeURIComponent(message);

    // Generate WhatsApp Web links for each phone number
    const links = phoneNumbers.map((phone: string) => ({
      phone,
      url: `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`,
    }));

    return NextResponse.json({
      message: 'WhatsApp links generated',
      method: 'whatsapp_web',
      links,
      totalSent: phoneNumbers.length,
      totalFailed: 0,
    });
  } catch (error) {
    console.error('Error generating WhatsApp links:', error);
    return NextResponse.json(
      { error: 'Failed to generate WhatsApp links', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
