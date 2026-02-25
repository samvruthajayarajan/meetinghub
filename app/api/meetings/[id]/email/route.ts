import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmailViaGmail, checkGmailConnection } from '@/lib/gmailApi';
import nodemailer from 'nodemailer';
import { generateMinutesPDF, generateAgendaPDF } from '@/lib/pdfGenerator';
import { format } from 'date-fns';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { recipients } = body;

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: { 
      agendaItems: true, 
      minutes: true,
      user: { 
        select: { 
          name: true, 
          email: true,
          smtpHost: true,
          smtpPort: true,
          smtpUser: true,
          smtpPassword: true
        } 
      }
    }
  });

  if (!meeting) {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  }

  // Check if user has Gmail connected
  const hasGmail = await checkGmailConnection(session.user.email);

  if (!hasGmail) {
    // Check if user has SMTP configured as fallback
    if (!meeting.user.smtpHost || !meeting.user.smtpUser || !meeting.user.smtpPassword) {
      return NextResponse.json({ 
        error: 'Please connect your Gmail account in Profile to send emails from your account.',
        configured: false,
        needsGmailAuth: true
      }, { status: 400 });
    }
  }

  // Parse agenda data from description
  let agendaData: any = null;
  if (meeting.description) {
    try {
      const parsed = JSON.parse(meeting.description);
      if (parsed.savedAgendas && parsed.savedAgendas.length > 0) {
        agendaData = parsed.savedAgendas[parsed.savedAgendas.length - 1];
      }
    } catch (e) {
      // Not JSON
    }
  }

  try {
    // Generate PDFs
    const reportPdf = await generateMinutesPDF(meeting, meeting.minutes?.discussions || null);
    const agendaPdf = await generateAgendaPDF(meeting);

    // Generate email HTML (simplified since PDFs are attached)
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">
          Meeting: ${meeting.title}
        </h2>
        
        <div style="margin: 20px 0; background: #F3F4F6; padding: 15px; border-radius: 8px;">
          <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          <p style="margin: 5px 0;"><strong>👤 Organizer:</strong> ${meeting.user.name}</p>
          ${meeting.meetingMode ? `<p style="margin: 5px 0;"><strong>📍 Mode:</strong> <span style="text-transform: capitalize;">${meeting.meetingMode}</span></p>` : ''}
          ${meeting.meetingLink ? `<p style="margin: 5px 0;"><strong>🔗 Link:</strong> <a href="${meeting.meetingLink}" style="color: #4F46E5;">${meeting.meetingLink}</a></p>` : ''}
        </div>

        <div style="margin: 30px 0; padding: 20px; background: #EFF6FF; border-radius: 8px; border-left: 4px solid #3B82F6;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #1F2937;">📎 Attached Documents:</p>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            <li><strong>Meeting Report PDF</strong> - Complete meeting details with agenda and minutes</li>
            <li><strong>Agenda PDF</strong> - Meeting agenda for quick reference</li>
          </ul>
        </div>

        <div style="margin-top: 40px; padding: 20px; background: #EFF6FF; border-radius: 8px; border-left: 4px solid #3B82F6;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #1F2937;">📌 Important Notes:</p>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            <li>Please review the attached PDFs before the meeting</li>
            <li>Complete any pre-meeting action items</li>
            <li>Prepare questions or discussion points</li>
            <li>Join on time using the meeting link above</li>
          </ul>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #9CA3AF; font-size: 12px; text-align: center;">
          <p style="margin: 5px 0;">This is an automated email from Meeting Management System</p>
          <p style="margin: 5px 0;">Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    const sanitizedTitle = meeting.title.replace(/[^a-zA-Z0-9-_]/g, '-');

    const attachments = [
      {
        filename: `meeting-report-${sanitizedTitle}.pdf`,
        content: Buffer.from(reportPdf),
        contentType: 'application/pdf'
      },
      {
        filename: `agenda-${sanitizedTitle}.pdf`,
        content: Buffer.from(agendaPdf),
        contentType: 'application/pdf'
      }
    ];

    // Try Gmail API first, fallback to SMTP
    if (hasGmail) {
      await sendEmailViaGmail(
        session.user.email,
        recipients,
        `Meeting: ${meeting.title} - ${new Date(meeting.date).toLocaleDateString()}`,
        emailHtml,
        attachments
      );
    } else {
      // Fallback to SMTP
      const smtpConfig = {
        host: meeting.user.smtpHost!,
        port: meeting.user.smtpPort || 587,
        secure: false,
        auth: {
          user: meeting.user.smtpUser!,
          pass: meeting.user.smtpPassword!
        }
      };

      const transporter = nodemailer.createTransport(smtpConfig);

      await transporter.sendMail({
        from: `"${meeting.user.name}" <${meeting.user.smtpUser}>`,
        replyTo: meeting.user.email,
        to: recipients.join(', '),
        subject: `Meeting: ${meeting.title} - ${new Date(meeting.date).toLocaleDateString()}`,
        html: emailHtml,
        attachments: attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType
        }))
      });
    }

    await prisma.report.updateMany({
      where: { meetingId: id },
      data: { emailedTo: recipients }
    });

    return NextResponse.json({ 
      message: 'Email sent successfully from your Gmail account with PDF attachments',
      configured: true,
      method: hasGmail ? 'gmail' : 'smtp'
    });
  } catch (error: any) {
    console.error('Email error:', error);
    return NextResponse.json({ 
      error: `Failed to send email: ${error.message}`,
      configured: true
    }, { status: 500 });
  }
}


// Helper function to generate Meeting Report PDF HTML
function generateMeetingReportHTML(meeting: any) {
  // Parse agenda from description field
  let agendaData: any = null;
  if (meeting.description) {
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
        minutesData = parsed.savedMinutes[parsed.savedMinutes.length - 1];
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
        <div class="section">
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

// Helper function to generate Agenda PDF HTML
function generateAgendaPDFHTML(meeting: any, agendaData: any) {
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
        .objectives-box {
          background: #ffffff;
          padding: 15px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          white-space: pre-wrap;
          margin: 10px 0;
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
      <h1>Meeting Agenda</h1>
      <h2>${meeting.title}</h2>
      
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
        ${agendaData.objectives ? `
          <h3>Meeting Objectives</h3>
          <div class="objectives-box">${agendaData.objectives}</div>
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
              ${item.description ? `<p style="margin: 8px 0; color: #475569;">${item.description}</p>` : ''}
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
      ` : `
        <div style="text-align: center; padding: 40px; background: #f9fafb; border-radius: 8px; margin: 30px 0;">
          <p style="color: #6b7280;">No agenda has been created for this meeting yet.</p>
        </div>
      `}

      <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #64748b; font-size: 0.9em;">
        <p>Agenda generated on ${format(new Date(), 'PPPp')}</p>
      </div>
    </body>
    </html>
  `;
}
