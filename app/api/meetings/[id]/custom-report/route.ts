import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateReportPDF } from '@/lib/pdfGenerator';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const reportData = await req.json();
    
    console.log('Received report data:', JSON.stringify(reportData, null, 2));

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    console.log('Generating PDF for meeting:', meeting.title);
    console.log('Report data keys:', Object.keys(reportData));
    console.log('Executive summary length:', reportData.executiveSummary?.length || 0);
    console.log('Objectives length:', reportData.objectives?.length || 0);
    console.log('Discussion points count:', reportData.keyDiscussionPoints?.length || 0);
    
    const pdf = await generateReportPDF(meeting, reportData);
    console.log('PDF generated, size:', pdf.length, 'bytes');

    // Only create report record if this is a new report (not a download from history)
    // Check if request has a special header to skip report creation
    const skipReportCreation = req.headers.get('x-skip-report-creation') === 'true';
    
    if (!skipReportCreation) {
      const reportCount = await prisma.report.count({ where: { meetingId: id } });
      await prisma.report.create({
        data: {
          meetingId: id,
          version: reportCount + 1
        }
      });
    }

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="meeting-report-${meeting.title.replace(/[^a-zA-Z0-9-_]/g, '-')}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error in custom report generation:', error);
    return NextResponse.json({ error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
