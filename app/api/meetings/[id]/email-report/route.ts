import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmailViaGmail, checkGmailConnection } from '@/lib/gmailApi';
import nodemailer from 'nodemailer';
import { generateMinutesPDF, generatePDFFromHTML } from '@/lib/pdfGenerator';
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
  let { recipients, reportData } = body;

  // Ensure recipients is an array
  if (typeof recipients === 'string') {
    recipients = recipients.split(',').map((email: string) => email.trim()).filter((email: string) => email);
  } else if (!Array.isArray(recipients)) {
    return NextResponse.json({ error: 'Recipients must be an array or comma-separated string' }, { status: 400 });
  }

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
    // Generate Report PDF
    const html = generateCustomReportHTML(meeting, reportData);
    const pdfBuffer = await generatePDFFromHTML(html, `Meeting Report: ${meeting.title}`);

    // Generate email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📊 Meeting Report</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">${meeting.title}</h2>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Please find attached the comprehensive meeting report for our meeting held on 
            <strong>${format(new Date(meeting.date), 'PPPP')}</strong> at 
            <strong>${format(new Date(meeting.date), 'p')}</strong>.
          </p>

          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #065f46; font-weight: 600;">📎 Report Attached</p>
            <p style="margin: 5px 0 0 0; color: #047857;">The PDF contains the complete meeting report with all sections including executive summary, objectives, discussions, decisions, action items, and more.</p>
          </div>

          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: 600;">Report Sections:</p>
            <ul style="margin: 0; padding-left: 20px; color: #1f2937;">
              <li style="margin: 5px 0;">Meeting Details & Information</li>
              <li style="margin: 5px 0;">Executive Summary</li>
              <li style="margin: 5px 0;">Meeting Objectives</li>
              <li style="margin: 5px 0;">Key Discussion Points</li>
              <li style="margin: 5px 0;">Decisions Taken</li>
              <li style="margin: 5px 0;">Action Items</li>
              <li style="margin: 5px 0;">Risks Identified</li>
              <li style="margin: 5px 0;">Conclusion</li>
            </ul>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 5px 0;">This is an automated email from Meeting Management System</p>
          <p style="margin: 5px 0;">Sent on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    const attachments = [{
      filename: `meeting-report-${meeting.title.replace(/[^a-zA-Z0-9-_]/g, '-')}.pdf`,
      content: Buffer.from(pdfBuffer),
      contentType: 'application/pdf'
    }];

    // Try Gmail API first, fallback to SMTP
    if (hasGmail) {
      await sendEmailViaGmail(
        session.user.email,
        recipients,
        `Meeting Report: ${meeting.title}`,
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
        subject: `Meeting Report: ${meeting.title}`,
        html: emailHtml,
        attachments: attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType
        }))
      });
    }

    return NextResponse.json({ 
      message: 'Report sent successfully from your Gmail account',
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

function generateCustomReportHTML(meeting: any, reportData: any) {
  const {
    executiveSummary,
    objectives,
    keyDiscussionPoints,
    decisionsTaken,
    actionItems,
    risksIdentified,
    conclusion
  } = reportData;

  // Parse minutes for attendees
  let attendees: string[] = [];
  if (meeting.minutes?.discussions) {
    try {
      const parsed = JSON.parse(meeting.minutes.discussions);
      if (parsed.savedMinutes && parsed.savedMinutes.length > 0) {
        const minutesData = parsed.savedMinutes[parsed.savedMinutes.length - 1];
        attendees = minutesData.attendees || [];
      }
    } catch (e) {
      // Not JSON
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
        ${attendees.length > 0 ? `
          <tr>
            <td>Total Attendees</td>
            <td>${attendees.length} participants</td>
          </tr>
        ` : ''}
      </table>

      ${attendees.length > 0 ? `
        <h3>Attendees</h3>
        <div class="attendees-list">
          ${attendees.join(', ')}
        </div>
      ` : ''}

      <!-- 2. EXECUTIVE SUMMARY -->
      <div class="section">
        <h2>2. Executive Summary</h2>
        ${executiveSummary ? `
          <div class="content-box">${executiveSummary}</div>
        ` : `
          <div class="no-data">No executive summary provided</div>
        `}
      </div>

      <!-- 3. OBJECTIVES -->
      <div class="section">
        <h2>3. Meeting Objectives</h2>
        ${objectives ? `
          <div class="content-box">${objectives}</div>
        ` : `
          <div class="no-data">No objectives specified</div>
        `}
      </div>

      <!-- 4. KEY DISCUSSION POINTS -->
      <div class="section">
        <h2>4. Key Discussion Points</h2>
        ${keyDiscussionPoints && keyDiscussionPoints.length > 0 ? `
          ${keyDiscussionPoints.map((item: any, index: number) => `
            <div class="item-box">
              <span class="item-number">${index + 1}. ${item.topic || 'Untitled'}</span>
              ${item.description ? `<div class="item-content">${item.description}</div>` : ''}
            </div>
          `).join('')}
        ` : `
          <div class="no-data">No discussion points recorded</div>
        `}
      </div>

      <!-- 5. DECISIONS TAKEN -->
      <div class="section">
        <h2>5. Decisions Taken</h2>
        ${decisionsTaken && decisionsTaken.length > 0 ? `
          <ul>
            ${decisionsTaken.map((decision: string) => `
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
        ${actionItems && actionItems.length > 0 ? `
          ${actionItems.map((item: any, index: number) => `
            <div class="item-box">
              <span class="item-number">${index + 1}. ${item.task || 'Untitled'}</span>
              ${item.assignedTo || item.dueDate ? `
                <div class="meta-info">
                  ${item.assignedTo ? `Assigned to: ${item.assignedTo}` : ''}
                  ${item.dueDate ? ` | Due Date: ${format(new Date(item.dueDate), 'MMMM d, yyyy')}` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
        ` : `
          <div class="no-data">No action items recorded</div>
        `}
      </div>

      <!-- 7. RISKS IDENTIFIED -->
      <div class="section">
        <h2>7. Risks Identified</h2>
        ${risksIdentified && risksIdentified.length > 0 ? `
          <ul>
            ${risksIdentified.map((risk: string) => `<li>${risk}</li>`).join('')}
          </ul>
        ` : `
          <div class="no-data">No risks identified</div>
        `}
      </div>

      <!-- 8. CONCLUSION -->
      <div class="section">
        <h2>8. Conclusion</h2>
        ${conclusion ? `
          <div class="content-box">${conclusion}</div>
        ` : `
          <div class="no-data">No conclusion provided</div>
        `}
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
