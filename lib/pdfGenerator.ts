import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateMeetingDetailsPDF(meeting: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let yPosition = 750;
  const leftMargin = 50;
  page.drawText('Meeting Details', { x: leftMargin, y: yPosition, size: 24, font: boldFont, color: rgb(0, 0, 0) });
  yPosition -= 40;
  page.drawText('Title:', { x: leftMargin, y: yPosition, size: 12, font: boldFont, color: rgb(0, 0, 0) });
  page.drawText(meeting.title || 'N/A', { x: leftMargin + 100, y: yPosition, size: 12, font: font, color: rgb(0, 0, 0) });
  yPosition -= 25;
  const dateStr = meeting.date ? new Date(meeting.date).toLocaleDateString() : 'N/A';
  page.drawText('Date:', { x: leftMargin, y: yPosition, size: 12, font: boldFont, color: rgb(0, 0, 0) });
  page.drawText(dateStr, { x: leftMargin + 100, y: yPosition, size: 12, font: font, color: rgb(0, 0, 0) });
  yPosition -= 25;
  const timeStr = meeting.date ? new Date(meeting.date).toLocaleTimeString() : 'N/A';
  page.drawText('Time:', { x: leftMargin, y: yPosition, size: 12, font: boldFont, color: rgb(0, 0, 0) });
  page.drawText(timeStr, { x: leftMargin + 100, y: yPosition, size: 12, font: font, color: rgb(0, 0, 0) });
  yPosition -= 25;
  const mode = meeting.meetingMode ? meeting.meetingMode.charAt(0).toUpperCase() + meeting.meetingMode.slice(1) : 'Offline';
  page.drawText('Mode:', { x: leftMargin, y: yPosition, size: 12, font: boldFont, color: rgb(0, 0, 0) });
  page.drawText(mode, { x: leftMargin + 100, y: yPosition, size: 12, font: font, color: rgb(0, 0, 0) });
  yPosition -= 25;
  if (meeting.location) {
    page.drawText('Presenter:', { x: leftMargin, y: yPosition, size: 12, font: boldFont, color: rgb(0, 0, 0) });
    page.drawText(meeting.location, { x: leftMargin + 100, y: yPosition, size: 12, font: font, color: rgb(0, 0, 0) });
  }
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generateAgendaPDF(meeting: any, agendaData: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let yPosition = 750;
  const leftMargin = 50;
  page.drawText('Meeting Agenda', { x: leftMargin, y: yPosition, size: 24, font: boldFont, color: rgb(0, 0, 0) });
  yPosition -= 40;
  page.drawText(meeting.title || 'Meeting', { x: leftMargin, y: yPosition, size: 16, font: boldFont, color: rgb(0.2, 0.2, 0.2) });
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generateMinutesPDF(meeting: any, minutesData: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let yPosition = 750;
  const leftMargin = 50;
  page.drawText('Meeting Minutes', { x: leftMargin, y: yPosition, size: 24, font: boldFont, color: rgb(0, 0, 0) });
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generatePDFFromHTML(htmlContent: string, title: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let yPosition = 750;
  const leftMargin = 50;
  page.drawText(title, { x: leftMargin, y: yPosition, size: 24, font: boldFont, color: rgb(0, 0, 0) });
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
