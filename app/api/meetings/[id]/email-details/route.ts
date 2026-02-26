import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmailViaGmail, checkGmailConnection } from '@/lib/gmailApi';
import nodemailer from 'nodemailer';
import { generateAgendaPDF } from '@/lib/pdfGenerator';
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

  try {
    // Parse agenda data
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

    // Generate Agenda PDF
    let agendaData = { objectives: '', preparationRequired: [], agendaItems: [], actionItems: [] };
    if (meeting.description) {
      try {
        const parsed = JSON.parse(meeting.description);
        if (parsed.savedAgendas && parsed.savedAgendas.length > 0) {
          agendaData = parsed.savedAgendas[parsed.savedAgendas.length - 1];
        }
      } catch (e) {}
    }
    const agendaPdf = await generateAgendaPDF(meeting, agendaData);

    // Generate email HTML - ONLY meeting details, NO agenda
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📅 Meeting Invitation</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">${meeting.title}</h2>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-weight: 600; width: 120px;">📅 Date:</td>
                <td style="padding: 10px 0; color: #1f2937;">${new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">🕐 Time:</td>
                <td style="padding: 10px 0; color: #1f2937;">${new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">👤 Organizer:</td>
                <td style="padding: 10px 0; color: #1f2937;">${meeting.user.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">📍 Mode:</td>
                <td style="padding: 10px 0; color: #1f2937; text-transform: capitalize;">${meeting.meetingMode || 'Offline'}</td>
              </tr>
              ${meeting.meetingLink ? `
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">🔗 Join Link:</td>
                  <td style="padding: 10px 0;">
                    <a href="${meeting.meetingLink}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">${meeting.meetingLink}</a>
                  </td>
                </tr>
              ` : ''}
            </table>
          </div>

          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #1e40af; font-weight: 600;">📎 Attached Document:</p>
            <p style="margin: 5px 0 0 0; color: #1f2937;">Please review the attached agenda PDF before the meeting.</p>
          </div>

          ${meeting.meetingMode === 'online' && meeting.meetingLink ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${meeting.meetingLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Join Meeting
              </a>
            </div>
          ` : ''}
        </div>

        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 5px 0;">This is an automated email from Meeting Management System</p>
          <p style="margin: 5px 0;">Sent on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    const sanitizedTitle = meeting.title.replace(/[^a-zA-Z0-9-_]/g, '-');

    const attachments = [{
      filename: `agenda-${sanitizedTitle}.pdf`,
      content: Buffer.from(agendaPdf),
      contentType: 'application/pdf'
    }];

    // Try Gmail API first, fallback to SMTP
    if (hasGmail) {
      await sendEmailViaGmail(
        session.user.email,
        recipients,
        `Meeting Invitation: ${meeting.title} - ${new Date(meeting.date).toLocaleDateString()}`,
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
        subject: `Meeting Invitation: ${meeting.title} - ${new Date(meeting.date).toLocaleDateString()}`,
        html: emailHtml,
        attachments: attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType
        }))
      });
    }

    return NextResponse.json({ 
      message: 'Meeting invitation sent successfully from your Gmail account with agenda PDF',
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
