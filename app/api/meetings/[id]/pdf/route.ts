import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getBrowser } from '@/lib/puppeteerConfig';
import { format } from 'date-fns';

// Increase Vercel function limits for PDF generation
export const maxDuration = 60; // 60 seconds
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
        agendaItems: { orderBy: { order: 'asc' } },
        minutes: true,
        user: { select: { name: true, email: true } }
      }
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const html = generateMeetingHTML(meeting);

    const browser = await getBrowser();
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

    return new NextResponse(Buffer.from(pdf), {
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
        @page {
          margin: 2cm;
        }
        body { 
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.6;
          color: #000;
          margin: 0;
          padding: 0;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #000;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 20pt;
          font-weight: bold;
          margin: 0 0 10px 0;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .header .subtitle {
          font-size: 14pt;
          color: #333;
          font-weight: 600;
          margin-top: 10px;
        }
        .info-table { 
          width: 100%;
          border-collapse: collapse;
          margin: 25px 0;
          border: 2px solid #000;
        }
        .info-table td {
          padding: 10px 15px;
          border: 1px solid #000;
        }
        .info-table td:first-child {
          font-weight: bold;
          width: 180px;
          background: #f0f0f0;
        }
        h2 { 
          font-size: 14pt;
          font-weight: bold;
          margin: 35px 0 15px 0;
          padding: 8px 0;
          border-bottom: 2px solid #000;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        h3 {
          font-size: 12pt;
          font-weight: bold;
          margin: 25px 0 12px 0;
          text-decoration: underline;
        }
        .section {
          margin: 30px 0;
          page-break-inside: avoid;
        }
        .content-box {
          border: 1px solid #000;
          padding: 15px;
          background: #fafafa;
          margin: 15px 0;
          white-space: pre-wrap;
          line-height: 1.8;
        }
        .item-box { 
          margin: 12px 0;
          padding: 12px 15px;
          border: 1px solid #333;
          background: #f9f9f9;
          page-break-inside: avoid;
        }
        .item-number {
          font-weight: bold;
          font-size: 11pt;
          margin-bottom: 8px;
          display: block;
        }
        .item-content {
          margin-left: 20px;
          color: #222;
          line-height: 1.7;
        }
        .meta-info {
          color: #555;
          font-size: 9pt;
          font-style: italic;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px dotted #999;
        }
        .attendees-list {
          border: 1px solid #000;
          padding: 15px;
          background: #f5f5f5;
          margin: 15px 0;
          line-height: 1.8;
        }
        ul {
          margin: 15px 0;
          padding-left: 40px;
          line-height: 1.8;
        }
        li {
          margin: 10px 0;
          padding-left: 5px;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #000;
          text-align: center;
          font-size: 9pt;
          color: #555;
        }
        .no-data {
          text-align: center;
          padding: 20px;
          color: #666;
          font-style: italic;
          background: #f9f9f9;
          border: 1px dashed #999;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Meeting Report</h1>
        <div class="subtitle">${meeting.title}</div>
      </div>
      
      <!-- 1. MEETING DETAILS -->
      <h2>1. Meeting Details</h2>
      <table class="info-table">
        <tr>
          <td>Meeting Title</td>
          <td>${meeting.title}</td>
        </tr>
        <tr>
          <td>Date</td>
          <td>${format(new Date(meeting.date), 'EEEE, MMMM d, yyyy')}</td>
        </tr>
        <tr>
          <td>Time</td>
          <td>${format(new Date(meeting.date), 'h:mm a')}</td>
        </tr>
        <tr>
          <td>Organizer</td>
          <td>${meeting.user.name} (${meeting.user.email})</td>
        </tr>
        <tr>
          <td>Meeting Mode</td>
          <td style="text-transform: capitalize;">${meeting.meetingMode || 'Offline'}</td>
        </tr>
        ${meeting.meetingLink ? `
          <tr>
            <td>Meeting Link</td>
            <td>${meeting.meetingLink}</td>
          </tr>
        ` : ''}
        ${minutesData?.attendees && minutesData.attendees.length > 0 ? `
          <tr>
            <td>Total Attendees</td>
            <td>${minutesData.attendees.length} participants</td>
          </tr>
        ` : ''}
      </table>

      ${minutesData?.attendees && minutesData.attendees.length > 0 ? `
        <h3>Attendees</h3>
        <div class="attendees-list">
          ${minutesData.attendees.join(', ')}
        </div>
      ` : ''}

      <!-- 2. EXECUTIVE SUMMARY -->
      <div class="section">
        <h2>2. Executive Summary</h2>
        ${minutesData?.discussions ? `
          <div class="content-box">${minutesData.discussions}</div>
        ` : `
          <div class="no-data">No executive summary available</div>
        `}
      </div>

      <!-- 3. OBJECTIVES -->
      <div class="section">
        <h2>3. Meeting Objectives</h2>
        ${agendaData?.objectives ? `
          <div class="content-box">${agendaData.objectives}</div>
        ` : `
          <div class="no-data">No objectives specified</div>
        `}
      </div>

      <!-- 4. KEY DISCUSSION POINTS -->
      <div class="section">
        <h2>4. Key Discussion Points</h2>
        ${agendaData?.agendaItems && agendaData.agendaItems.length > 0 ? `
          ${agendaData.agendaItems.map((item: any, index: number) => `
            <div class="item-box">
              <span class="item-number">${index + 1}. ${item.topic}</span>
              ${item.description ? `<div class="item-content">${item.description}</div>` : ''}
              ${item.presenter || item.duration ? `
                <div class="meta-info">
                  ${item.presenter ? `Presenter: ${item.presenter}` : ''}
                  ${item.duration ? ` | Duration: ${item.duration} minutes` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
        ` : `
          <div class="no-data">No discussion points recorded</div>
        `}
      </div>

      <!-- 5. DECISIONS TAKEN -->
      <div class="section">
        <h2>5. Decisions Taken</h2>
        ${minutesData?.decisions && minutesData.decisions.length > 0 ? `
          <ul>
            ${minutesData.decisions.map((decision: string) => `
              <li>${decision}</li>
            `).join('')}
          </ul>
        ` : `
          <div class="no-data">No decisions recorded</div>
        `}
      </div>

      <!-- 6. ACTION ITEMS -->
      <div class="section">
        <h2>6. Action Items</h2>
        ${minutesData?.actionItems && minutesData.actionItems.length > 0 ? `
          ${minutesData.actionItems.map((item: any, index: number) => `
            <div class="item-box">
              <span class="item-number">${index + 1}. ${item.task}</span>
              ${item.assignedTo || item.dueDate ? `
                <div class="meta-info">
                  ${item.assignedTo ? `Assigned to: ${item.assignedTo}` : ''}
                  ${item.dueDate ? ` | Due Date: ${format(new Date(item.dueDate), 'MMMM d, yyyy')}` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
        ` : agendaData?.actionItems && agendaData.actionItems.length > 0 ? `
          <h3>Pre-Meeting Action Items</h3>
          <ul>
            ${agendaData.actionItems.map((item: string) => `<li>${item}</li>`).join('')}
          </ul>
        ` : `
          <div class="no-data">No action items recorded</div>
        `}
      </div>

      <!-- 7. RISKS IDENTIFIED -->
      <div class="section">
        <h2>7. Risks Identified</h2>
        ${agendaData?.preparationRequired && agendaData.preparationRequired.length > 0 ? `
          <h3>Preparation Requirements & Potential Risks</h3>
          <ul>
            ${agendaData.preparationRequired.map((item: string) => `<li>${item}</li>`).join('')}
          </ul>
        ` : `
          <div class="no-data">No risks identified</div>
        `}
      </div>

      <!-- 8. CONCLUSION -->
      <div class="section">
        <h2>8. Conclusion</h2>
        ${minutesData?.nextMeeting ? `
          <div class="content-box">
            <strong>Next Meeting Scheduled:</strong><br/>
            ${format(new Date(minutesData.nextMeeting), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
          </div>
        ` : ''}
        <div class="content-box">
          This meeting report summarizes the key discussions, decisions, and action items from the ${meeting.title}. 
          All participants are requested to review their assigned action items and complete them by the specified due dates.
          ${minutesData?.nextMeeting ? ' Please mark your calendars for the next meeting as scheduled above.' : ''}
        </div>
      </div>

      <div class="footer">
        <p><strong>Report Generated:</strong> ${format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}</p>
        <p style="margin-top: 10px;">Meeting Management System</p>
        <p style="margin-top: 5px; font-size: 8pt;">This is a computer-generated document and does not require a signature.</p>
      </div>
    </body>
    </html>
  `;
}
