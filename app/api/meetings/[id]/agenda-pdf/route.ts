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
        body { 
          font-family: Arial, sans-serif; 
          padding: 40px; 
          line-height: 1.6;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #3b82f6;
        }
        h1 { 
          color: #1e40af; 
          margin-bottom: 10px;
          font-size: 32px;
        }
        .subtitle {
          color: #64748b;
          font-size: 18px;
          font-weight: 600;
        }
        h2 { 
          color: #1e40af; 
          margin-top: 35px;
          margin-bottom: 15px;
          border-left: 4px solid #3b82f6;
          padding-left: 15px;
          font-size: 24px;
        }
        h3 {
          color: #475569;
          margin-top: 20px;
          margin-bottom: 10px;
          font-size: 18px;
        }
        .info { 
          margin: 25px 0;
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .info-item { 
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
          page-break-inside: avoid;
        }
        .agenda-item strong {
          color: #1e40af;
          font-size: 1.1em;
          display: block;
          margin-bottom: 8px;
        }
        .agenda-item p {
          margin: 8px 0;
          color: #475569;
        }
        .meta-info {
          color: #64748b;
          font-size: 0.9em;
          margin-top: 8px;
        }
        ul {
          margin: 10px 0;
          padding-left: 25px;
        }
        li {
          margin: 8px 0;
          color: #475569;
        }
        .objectives-box {
          background: #eff6ff;
          padding: 20px;
          border-radius: 8px;
          border: 2px solid #3b82f6;
          margin: 20px 0;
          white-space: pre-wrap;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
          color: #64748b;
          font-size: 0.9em;
          text-align: center;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 12px;
          font-size: 0.85em;
          font-weight: 600;
          margin-left: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${meeting.title}</h1>
        <div class="subtitle">Meeting Agenda</div>
      </div>
      
      <div class="info">
        <div class="info-grid">
          <div class="info-item">
            <strong>📅 Date:</strong>
            <span>${format(new Date(meeting.date), 'PPPP')}</span>
          </div>
          <div class="info-item">
            <strong>🕐 Time:</strong>
            <span>${format(new Date(meeting.date), 'p')}</span>
          </div>
          <div class="info-item">
            <strong>👤 Organizer:</strong>
            <span>${meeting.user.name}</span>
          </div>
          <div class="info-item">
            <strong>📍 Mode:</strong>
            <span style="text-transform: capitalize;">${meeting.meetingMode || 'Offline'}</span>
          </div>
        </div>
        ${meeting.meetingLink ? `
          <div class="info-item" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
            <strong>🔗 Meeting Link:</strong>
            <span style="word-break: break-all;">${meeting.meetingLink}</span>
          </div>
        ` : ''}
      </div>

      ${agendaData ? `
        <div class="agenda-section">
          ${agendaData.objectives ? `
            <h2>🎯 Meeting Objectives</h2>
            <div class="objectives-box">${agendaData.objectives}</div>
          ` : ''}

          ${agendaData.preparationRequired && agendaData.preparationRequired.length > 0 ? `
            <h2>📋 Preparation Required</h2>
            <ul>
              ${agendaData.preparationRequired.map((item: string) => `<li>${item}</li>`).join('')}
            </ul>
          ` : ''}

          ${agendaData.agendaItems && agendaData.agendaItems.length > 0 ? `
            <h2>📝 Agenda Items</h2>
            ${agendaData.agendaItems.map((item: any, index: number) => `
              <div class="agenda-item">
                <strong>${index + 1}. ${item.topic}</strong>
                ${item.description ? `<p>${item.description}</p>` : ''}
                <div class="meta-info">
                  ${item.presenter ? `👤 Presenter: ${item.presenter}` : ''}
                  ${item.duration ? ` | ⏱️ Duration: ${item.duration} minutes` : ''}
                </div>
              </div>
            `).join('')}
          ` : ''}

          ${agendaData.actionItems && agendaData.actionItems.length > 0 ? `
            <h2>✅ Pre-Meeting Action Items</h2>
            <ul>
              ${agendaData.actionItems.map((item: string) => `<li>${item}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      ` : `
        <div style="text-align: center; padding: 60px 20px; color: #94a3b8;">
          <h2 style="color: #64748b;">No Agenda Available</h2>
          <p>The agenda for this meeting has not been created yet.</p>
        </div>
      `}

      <div class="footer">
        <p>Agenda generated on ${format(new Date(), 'PPPp')}</p>
        <p style="margin-top: 5px; font-size: 0.85em;">Please review the agenda before the meeting and prepare accordingly.</p>
      </div>
    </body>
    </html>
  `;
}
