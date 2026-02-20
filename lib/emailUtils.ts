// Utility functions for email sharing via mailto links

export function generateMailtoLink(params: {
  to?: string;
  subject?: string;
  body?: string;
  cc?: string;
  bcc?: string;
}): string {
  const { to = '', subject = '', body = '', cc = '', bcc = '' } = params;
  
  const mailtoParams: string[] = [];
  
  if (subject) mailtoParams.push(`subject=${encodeURIComponent(subject)}`);
  if (body) mailtoParams.push(`body=${encodeURIComponent(body)}`);
  if (cc) mailtoParams.push(`cc=${encodeURIComponent(cc)}`);
  if (bcc) mailtoParams.push(`bcc=${encodeURIComponent(bcc)}`);
  
  const queryString = mailtoParams.length > 0 ? '?' + mailtoParams.join('&') : '';
  
  return `mailto:${encodeURIComponent(to)}${queryString}`;
}

export function openEmailClient(params: {
  to?: string;
  subject?: string;
  body?: string;
  cc?: string;
  bcc?: string;
}): void {
  const mailtoLink = generateMailtoLink(params);
  window.location.href = mailtoLink;
}

export function generateMeetingEmailBody(meeting: any, includeAgenda: boolean = false): string {
  let body = `Meeting: ${meeting.title}\n\n`;
  body += `Date: ${new Date(meeting.date).toLocaleDateString()}\n`;
  body += `Time: ${meeting.time}\n`;
  body += `Location: ${meeting.location || 'TBD'}\n\n`;
  
  if (meeting.description) {
    body += `Description:\n${meeting.description}\n\n`;
  }
  
  if (includeAgenda && meeting.agenda) {
    body += `Agenda:\n${meeting.agenda}\n\n`;
  }
  
  body += `---\nSent from Meeting Hub`;
  
  return body;
}

export function generateReportEmailBody(meeting: any, reportContent: string): string {
  let body = `Meeting Report: ${meeting.title}\n\n`;
  body += `Date: ${new Date(meeting.date).toLocaleDateString()}\n`;
  body += `Time: ${meeting.time}\n\n`;
  body += `${reportContent}\n\n`;
  body += `---\nSent from Meeting Hub`;
  
  return body;
}
