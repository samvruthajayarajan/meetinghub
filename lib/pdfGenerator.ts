import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { format } from 'date-fns';

export async function generateAgendaPDF(meeting: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.addPage([595, 842]);
  page.drawText(meeting.title, { x: 50, y: 750, size: 20, font, color: rgb(0, 0, 0) });
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generateMinutesPDF(meeting: any, minutes: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.addPage([595, 842]);
  page.drawText(meeting.title, { x: 50, y: 750, size: 20, font, color: rgb(0, 0, 0) });
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generatePDFFromHTML(html: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.addPage([595, 842]);
  page.drawText('Report', { x: 50, y: 750, size: 20, font, color: rgb(0, 0, 0) });
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
