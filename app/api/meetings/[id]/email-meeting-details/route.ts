import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmailViaGmail } from '@/lib/gmailApi';
import { generateMeetingDetailsPDF } from '@/lib/pdfGenerator';

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
    const { recipients } = await request.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'Recipients are required' }, { status: 400 });
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Get user with Gmail tokens
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        gmailAccessToken: true,
        gmailRefreshToken: true,
        gmailTokenExpiry: true,
      },
    });

    if (!user?.gmailRefreshToken) {
      return NextResponse.json(
        { error: 'Gmail not connected', needsGmailAuth: true },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateMeetingDetailsPDF(meeting);

    // Build email content
    const subject = `Meeting Details: ${meeting.title}`;
    let body = `Meeting Details\n\n`;
    body += `Title: ${meeting.title}\n`;
    body += `Date: ${new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    body += `Time: ${new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}\n`;
    body += `Mode: ${(meeting.meetingMode || 'Offline').charAt(0).toUpperCase() + (meeting.meetingMode || 'Offline').slice(1)}\n`;
    if (meeting.location) {
      body += `Location: ${meeting.location}\n`;
    }
    if (meeting.meetingLink && (meeting.meetingMode === 'online' || meeting.meetingMode === 'hybrid')) {
      body += `Meeting Link: ${meeting.meetingLink}\n`;
    }
    body += `\nPlease find the meeting details PDF attached.\n`;

    // Send email to each recipient
    const results = await Promise.allSettled(
      recipients.map((recipient) =>
        sendEmailViaGmail(
          user.gmailAccessToken!,
          user.gmailRefreshToken!,
          user.gmailTokenExpiry,
          session.user.email!,
          recipient,
          subject,
          body,
          [{
            filename: `meeting-details-${meeting.title.replace(/[^a-zA-Z0-9-_]/g, '-')}.pdf`,
            content: pdfBuffer.toString('base64'),
            encoding: 'base64',
          }]
        )
      )
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({
      message: 'Meeting details sent',
      totalSent: successful,
      totalFailed: failed,
    });
  } catch (error) {
    console.error('Error sending meeting details email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
