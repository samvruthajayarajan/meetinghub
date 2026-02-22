import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getBrowser } from '@/lib/puppeteerConfig';
import { format } from 'date-fns';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.error('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    console.log('Generating agenda PDF for meeting:', id);

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    if (!meeting) {
      console.error('Meeting not found:', id);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    console.log('Meeting found, generating HTML...');
    console.log('Using Buffer.from for PDF conversion');

    const html = generateAgendaHTML(meeting);

    console.log('Launching puppeteer...');
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    console.log('PDF generated successfully');

    // Save to reports automatically
    try {
      // Get the current highest version number for this meeting
      const existingReports = await prisma.report.findMany({
        where: { meetingId: id },
        orderBy: { version: 'desc' },
        take: 1
      });

      const nextVersion = existingReports.length > 0 ? existingReports[0].version + 1 : 1;

      // Create a new report entry
      await prisma.report.create({
        data: {
          meetingId: id,
          version: nextVersion,
          emailedTo: []
        }
      });

      console.log(`Agenda PDF saved to reports as version ${nextVersion}`);
    } catch (reportError) {
      console.error('Error saving to reports:', reportError);
      // Don't fail the PDF generation if report saving fails
    }

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="agenda-${meeting.title.replace(/[^a-zA-Z0-9-_]/g, '-')}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error in agenda PDF generation:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = {
      error: 'Failed to generate agenda PDF',
      details: errorMessage,
      type: error?.constructor?.name || 'Unknown'
    };
    
    console.error('Returning error:', errorDetails);
    
    return NextResponse.json(errorDetails, { status: 500 });
  }
}

function generateAgendaHTML(meeting: any) {
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
          padding: 0; 
          line-height: 1.6;
          color: #000;
          font-size: 11pt;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #000;
        }
        h1 { 
          color: #000; 
          margin-bottom: 10px;
          font-size: 18pt;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .subtitle {
          color: #333;
          font-size: 12pt;
          font-weight: 600;
        }
        h2 { 
          color: #000; 
          margin-top: 30px;
          margin-bottom: 15px;
          border-bottom: 1px solid #000;
          padding-bottom: 5px;
          font-size: 14pt;
          font-weight: bold;
          text-transform: uppercase;
        }
        h3 {
          color: #000;
          margin-top: 20px;
          margin-bottom: 10px;
          font-size: 12pt;
          font-weight: bold;
        }
        .info { 
          margin: 20px 0;
          border: 1px solid #000;
          padding: 0;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
        }
        .info-table td {
          padding: 8px 12px;
          border: 1px solid #000;
        }
        .info-table td:first-child {
          font-weight: bold;
          width: 150px;
          background: #f5f5f5;
        }
        .agenda-section {
          margin: 25px 0;
        }
        .agenda-item { 
          margin: 15px 0;
          padding: 12px;
          border: 1px solid #000;
          background: #fafafa;
          page-break-inside: avoid;
        }
        .agenda-item strong {
          color: #000;
          font-size: 11pt;
          display: block;
          margin-bottom: 8px;
        }
        .agenda-item p {
          margin: 8px 0 8px 20px;
          color: #333;
        }
        .meta-info {
          color: #666;
          font-size: 9pt;
          margin-top: 8px;
          font-style: italic;
        }
        ul {
          margin: 10px 0;
          padding-left: 30px;
        }
        li {
          margin: 6px 0;
          color: #000;
        }
        .objectives-box {
          background: #f9f9f9;
          padding: 15px;
          border: 1px solid #000;
          margin: 15px 0;
          white-space: pre-wrap;
        }
        .footer {
          margin-top: 40px;
          padding-top: 15px;
          border-top: 1px solid #000;
          color: #666;
          font-size: 9pt;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${meeting.title}</h1>
        <div class="subtitle">Meeting Agenda</div>
      </div>
      
      <div class="info">
        <table class="info-table">
          <tr>
            <td>Date</td>
            <td>${format(new Date(meeting.date), 'PPPP')}</td>
          </tr>
          <tr>
            <td>Time</td>
            <td>${format(new Date(meeting.date), 'p')}</td>
          </tr>
          <tr>
            <td>Organizer</td>
            <td>${meeting.user.name}</td>
          </tr>
          <tr>
            <td>Mode</td>
            <td style="text-transform: capitalize;">${meeting.meetingMode || 'Offline'}</td>
          </tr>
          ${meeting.meetingLink ? `
            <tr>
              <td>Meeting Link</td>
              <td style="word-break: break-all;">${meeting.meetingLink}</td>
            </tr>
          ` : ''}
        </table>
      </div>

      ${agendaData ? `
        <div class="agenda-section">
          ${agendaData.objectives ? `
            <h2>Meeting Objectives</h2>
            <div class="objectives-box">${agendaData.objectives}</div>
          ` : ''}

          ${agendaData.preparationRequired && agendaData.preparationRequired.length > 0 ? `
            <h2>Preparation Required</h2>
            <ul>
              ${agendaData.preparationRequired.map((item: string) => `<li>${item}</li>`).join('')}
            </ul>
          ` : ''}

          ${agendaData.agendaItems && agendaData.agendaItems.length > 0 ? `
            <h2>Agenda Items</h2>
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
            <h2>Pre-Meeting Action Items</h2>
            <ul>
              ${agendaData.actionItems.map((item: string) => `<li>${item}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      ` : `
        <div style="text-align: center; padding: 40px 20px; color: #666;">
          <h2 style="color: #333;">No Agenda Available</h2>
          <p>The agenda for this meeting has not been created yet.</p>
        </div>
      `}

      <div class="footer">
        <p>Agenda generated on ${format(new Date(), 'PPPp')}</p>
        <p style="margin-top: 5px;">Please review the agenda before the meeting and prepare accordingly.</p>
      </div>
    </body>
    </html>
  `;
}
