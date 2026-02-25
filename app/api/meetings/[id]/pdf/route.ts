import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateMinutesPDF } from '@/lib/pdfGenerator';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        minutes: true,
        user: { select: { name: true, email: true } }
      }
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const minutesContent = meeting.minutes?.discussions || null;
    const pdfBuffer = await generateMinutesPDF(meeting, minutesContent);

    // Create report record in database
    const reportCount = await prisma.report.count({ where: { meetingId: id } });
    await prisma.report.create({
      data: {
        meetingId: id,
        version: reportCount + 1,
        emailedTo: []
      }
    });

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="minutes-${meeting.title.replace(/[^a-zA-Z0-9-_]/g, '-')}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
