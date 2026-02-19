import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer';
import { format } from 'date-fns';

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
        agendaItems: { orderBy: { order: 'asc' } },
        minutes: true,
        user: { select: { name: true, email: true } }
      }
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const html = generateMeetingHTML(meeting);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // Create report record in database
    const reportCount = await prisma.report.count({ where: { meetingId: id } });
    const report = await prisma.report.create({
      data: {
        meetingId: id,
        version: reportCount + 1
      }
    });

    console.log('Report created:', report);

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="meeting-${meeting.title.replace(/[^a-zA-Z0-9-_]/g, '-')}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error in PDF generation:', error);
    return NextResponse.json({ error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

function generateMeetingHTML(meeting: any) {
  // Parse agenda from agendaData field (or fallback to description for backward compatibility)
  let agendaData: any = null;
  
  // Try agendaData first
  if (meeting.agendaData) {
    try {
      const parsed = JSON.parse(meeting.agendaData);
      if (parsed.savedAgendas && parsed.savedAgendas.length > 0) {
        agendaData = parsed.savedAgendas[parsed.savedAgendas.length - 1];
      }
    } catch (e) {
      console.error('Error parsing agendaData:', e);
    }
  }
  
  // Fallback to description if agendaData is not available
  if (!agendaData && meeting.description) {
    try {
      const parsed = JSON.parse(meeting.description);
      if (parsed.savedAgendas && parsed.savedAgendas.length > 0) {
        agendaData = parsed.savedAgendas[parsed.savedAgendas.length - 1];
      }
    } catch (e) {
      // Not JSON, skip
    }
  }

  // Parse minutes
  let minutesData: any = null;
  if (meeting.minutes?.discussions) {
    try {
      const parsed = JSON.parse(meeting.minutes.discussions);
      if (parsed.savedMinutes && parsed.savedMinutes.length > 0) {
        minutesData = parsed.savedMinutes[parsed.savedMinutes.length - 1]; // Get latest minutes
      }
    } catch (e) {
      // Not JSON, use raw data
      minutesData = {
        discussions: meeting.minutes.discussions,
        attendees: meeting.minutes.attendees || [],
        decisions: [],
        actionItems: []
      };
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 40px; 
          line-height: 1.6;
          color: #333;
        }
        h1 { 
          color: #1e40af; 
          border-bottom: 3px solid #3b82f6; 
          padding-bottom: 15px;
          margin-bottom: 30px;
        }
        h2 { 
          color: #1e40af; 
          margin-top: 35px;
          margin-bottom: 15px;
          border-left: 4px solid #3b82f6;
          padding-left: 15px;
        }
        h3 {
          color: #475569;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        .info { 
          margin: 25px 0;
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .info-item { 
          margin: 8px 0;
          display: flex;
          gap: 10px;
        }
        .info-item strong {
          min-width: 120px;
          color: #475569;
        }
        .agenda-section {
          margin: 30px 0;
        }
        .agenda-item { 
          margin: 20px 0;
          padding: 15px;
          background: #f0f9ff;
          border-left: 4px solid #3b82f6;
          border-radius: 4px;
        }
        .agenda-item strong {
          color: #1e40af;
          font-size: 1.1em;
        }
        .agenda-item p {
          margin: 8px 0;
          color: #475569;
        }
        .section { 
          margin: 35px 0;
          page-break-inside: avoid;
        }
        .attendees-list {
          background: #f8fafc;
          padding: 15px;
          border-radius: 4px;
          margin: 10px 0;
        }
        .discussion-text {
          background: #ffffff;
          padding: 15px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          white-space: pre-wrap;
          margin: 10px 0;
        }
        .decision-item, .action-item {
          margin: 10px 0;
          padding: 12px;
          background: #f8fafc;
          border-left: 3px solid #10b981;
          border-radius: 4px;
        }
        .action-item {
          border-left-color: #f59e0b;
        }
        ul {
          margin: 10px 0;
          padding-left: 25px;
        }
        li {
          margin: 8px 0;
        }
        .meta-info {
          color: #64748b;
          font-size: 0.9em;
          margin-top: 5px;
        }
      </style>
    </head>
    <body>
      <h1>${meeting.title}</h1>
      
      <div class="info">
        <div class="info-item">
          <strong>Date:</strong>
          <span>${format(new Date(meeting.date), 'PPPP')}</span>
        </div>
        <div class="info-item">
          <strong>Time:</strong>
          <span>${format(new Date(meeting.date), 'p')}</span>
        </div>
        <div class="info-item">
          <strong>Organizer:</strong>
          <span>${meeting.user.name}</span>
        </div>
        <div class="info-item">
          <strong>Mode:</strong>
          <span style="text-transform: capitalize;">${meeting.meetingMode || 'Offline'}</span>
        </div>
        ${meeting.meetingLink ? `
          <div class="info-item">
            <strong>Meeting Link:</strong>
            <span>${meeting.meetingLink}</span>
          </div>
        ` : ''}
      </div>

      ${agendaData ? `
        <div class="section agenda-section">
          <h2>Meeting Agenda</h2>
          
          ${agendaData.objectives ? `
            <h3>Objectives</h3>
            <div class="discussion-text">${agendaData.objectives}</div>
          ` : ''}

          ${agendaData.preparationRequired && agendaData.preparationRequired.length > 0 ? `
            <h3>Preparation Required</h3>
            <ul>
              ${agendaData.preparationRequired.map((item: string) => `<li>${item}</li>`).join('')}
            </ul>
          ` : ''}

          ${agendaData.agendaItems && agendaData.agendaItems.length > 0 ? `
            <h3>Agenda Items</h3>
            ${agendaData.agendaItems.map((item: any, index: number) => `
              <div class="agenda-item">
                <strong>${index + 1}. ${item.topic}</strong>
                ${item.description ? `<p>${item.description}</p>` : ''}
                <div class="meta-info">
                  ${item.presenter ? `Presenter: ${item.presenter}` : ''}
                  ${item.duration ? ` | Duration: ${item.duration} minutes` : ''}
                </div>
              </div>
            `).join('')}
          ` : ''}

          ${agendaData.actionItems && agendaData.actionItems.length > 0 ? `
            <h3>Pre-Meeting Action Items</h3>
            <ul>
              ${agendaData.actionItems.map((item: string) => `<li>${item}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      ` : ''}

      ${minutesData ? `
        <div class="section">
          <h2>Meeting Minutes</h2>
          
          ${minutesData.attendees && minutesData.attendees.length > 0 ? `
            <h3>Attendees (${minutesData.attendees.length})</h3>
            <div class="attendees-list">
              ${minutesData.attendees.join(', ')}
            </div>
          ` : ''}
          
          ${minutesData.discussions ? `
            <h3>Discussions</h3>
            <div class="discussion-text">${minutesData.discussions}</div>
          ` : ''}
          
          ${minutesData.decisions && minutesData.decisions.length > 0 ? `
            <h3>Decisions Made</h3>
            ${minutesData.decisions.map((decision: string) => `
              <div class="decision-item">${decision}</div>
            `).join('')}
          ` : ''}
          
          ${minutesData.actionItems && minutesData.actionItems.length > 0 ? `
            <h3>Action Items</h3>
            ${minutesData.actionItems.map((item: any) => `
              <div class="action-item">
                <strong>${item.task}</strong>
                <div class="meta-info">
                  ${item.assignedTo ? `Assigned to: ${item.assignedTo}` : ''}
                  ${item.dueDate ? ` | Due: ${format(new Date(item.dueDate), 'PP')}` : ''}
                </div>
              </div>
            `).join('')}
          ` : ''}

          ${minutesData.nextMeeting ? `
            <h3>Next Meeting</h3>
            <div class="info-item">
              <strong>Scheduled:</strong>
              <span>${format(new Date(minutesData.nextMeeting), 'PPPp')}</span>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #64748b; font-size: 0.9em;">
        <p>Report generated on ${format(new Date(), 'PPPp')}</p>
      </div>
    </body>
    </html>
  `;
}
