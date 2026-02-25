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
    // Generate PDF
    const pdfBuffer = await generateAgendaPDF(meeting);

    // Send email with PDF attachment
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📋 Meeting Agenda</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">${meeting.title}</h2>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Please find attached the detailed agenda for our upcoming meeting scheduled on 
            <strong>${format(new Date(meeting.date), 'PPPP')}</strong> at 
            <strong>${format(new Date(meeting.date), 'p')}</strong>.
          </p>

          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #065f46; font-weight: 600;">📎 Attachment Included</p>
            <p style="margin: 5px 0 0 0; color: #047857;">The PDF contains the complete agenda with objectives, preparation requirements, agenda items, and action items.</p>
          </div>

          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: 600;">Please review:</p>
            <ul style="margin: 0; padding-left: 20px; color: #1f2937;">
              <li style="margin: 5px 0;">Read through all agenda items</li>
              <li style="margin: 5px 0;">Complete any pre-meeting preparation</li>
              <li style="margin: 5px 0;">Prepare questions or discussion points</li>
              <li style="margin: 5px 0;">Be ready to contribute to the meeting</li>
            </ul>
          </div>

          ${meeting.meetingLink ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${meeting.meetingLink}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
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

    const attachments = [{
      filename: `agenda-${meeting.title.replace(/[^a-zA-Z0-9-_]/g, '-')}.pdf`,
      content: Buffer.from(pdfBuffer),
      contentType: 'application/pdf'
    }];

    // Try Gmail API first, fallback to SMTP
    if (hasGmail) {
      await sendEmailViaGmail(
        session.user.email,
        recipients,
        `Meeting Agenda: ${meeting.title}`,
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
        subject: `Meeting Agenda: ${meeting.title}`,
        html: emailHtml,
        attachments: attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType
        }))
      });
    }

    return NextResponse.json({ 
      message: 'Agenda PDF sent successfully from your Gmail account',
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

function generateAgendaHTML(meeting: any) {
  let agendaData: any = null;
  
  if (meeting.description) {
    try {
      const parsed = JSON.parse(meeting.description);
      if (parsed.savedAgendas && parsed.savedAgendas.length > 0) {
        agendaData = parsed.savedAgendas[parsed.savedAgendas.length - 1];
      }
    } catch (e) {
      console.error('Error parsing description:', e);
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; color: #333; }
        h1 { color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 15px; margin-bottom: 30px; }
        h2 { color: #1e40af; margin-top: 35px; margin-bottom: 15px; border-left: 4px solid #3b82f6; padding-left: 15px; }
        .info { margin: 25px 0; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .info-item { margin: 8px 0; }
        .agenda-item { margin: 20px 0; padding: 15px; background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px; }
        ul { margin: 10px 0; padding-left: 25px; }
        li { margin: 8px 0; }
      </style>
    </head>
    <body>
      <h1>${meeting.title}</h1>
      <div class="info">
        <div class="info-item"><strong>Date:</strong> ${format(new Date(meeting.date), 'PPPP')}</div>
        <div class="info-item"><strong>Time:</strong> ${format(new Date(meeting.date), 'p')}</div>
        <div class="info-item"><strong>Organizer:</strong> ${meeting.user.name}</div>
        <div class="info-item"><strong>Mode:</strong> ${meeting.meetingMode || 'Offline'}</div>
        ${meeting.meetingLink ? `<div class="info-item"><strong>Link:</strong> ${meeting.meetingLink}</div>` : ''}
      </div>

      ${agendaData ? `
        ${agendaData.objectives ? `<h2>Objectives</h2><p>${agendaData.objectives}</p>` : ''}
        ${agendaData.preparationRequired?.length > 0 ? `<h2>Preparation Required</h2><ul>${agendaData.preparationRequired.map((item: string) => `<li>${item}</li>`).join('')}</ul>` : ''}
        ${agendaData.agendaItems?.length > 0 ? `<h2>Agenda Items</h2>${agendaData.agendaItems.map((item: any, i: number) => `<div class="agenda-item"><strong>${i + 1}. ${item.topic}</strong>${item.description ? `<p>${item.description}</p>` : ''}<div><em>Presenter: ${item.presenter || 'TBD'} | Duration: ${item.duration || 0} min</em></div></div>`).join('')}` : ''}
        ${agendaData.actionItems?.length > 0 ? `<h2>Action Items</h2><ul>${agendaData.actionItems.map((item: string) => `<li>${item}</li>`).join('')}</ul>` : ''}
      ` : '<p>No agenda available</p>'}
    </body>
    </html>
  `;
}
