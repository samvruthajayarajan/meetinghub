import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function wrapText(text: string, maxWidth: number, fontSize: number, font: any): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function generateMeetingDetailsPDF(meeting: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let yPosition = 750;
  const leftMargin = 50;
  const pageWidth = 595;
  page.drawText('Meeting Details', { x: leftMargin, y: yPosition, size: 24, font: boldFont, color: rgb(0, 0, 0) });
  yPosition -= 40;
  page.drawText('Title:', { x: leftMargin, y: yPosition, size: 12, font: boldFont, color: rgb(0, 0, 0) });
  page.drawText(meeting.title || 'N/A', { x: leftMargin + 100, y: yPosition, size: 12, font: font, color: rgb(0, 0, 0) });
  yPosition -= 25;
  const dateStr = meeting.date ? new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  page.drawText('Date:', { x: leftMargin, y: yPosition, size: 12, font: boldFont, color: rgb(0, 0, 0) });
  page.drawText(dateStr, { x: leftMargin + 100, y: yPosition, size: 12, font: font, color: rgb(0, 0, 0) });
  yPosition -= 25;
  const timeStr = meeting.date ? new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
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
    yPosition -= 25;
  }
  if (meeting.meetingLink && (meeting.meetingMode === 'online' || meeting.meetingMode === 'hybrid')) {
    page.drawText('Meeting Link:', { x: leftMargin, y: yPosition, size: 12, font: boldFont, color: rgb(0, 0, 0) });
    const linkLines = wrapText(meeting.meetingLink, pageWidth - leftMargin - 150, 12, font);
    for (const line of linkLines) {
      page.drawText(line, { x: leftMargin + 100, y: yPosition, size: 12, font: font, color: rgb(0, 0.4, 0.8) });
      yPosition -= 15;
    }
  }
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generateAgendaPDF(meeting: any, agendaData: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let yPosition = 750;
  const leftMargin = 50;
  const pageWidth = 595;
  const lineHeight = 20;
  const checkAndAddPage = (requiredSpace: number) => {
    if (yPosition - requiredSpace < 50) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = 750;
      return true;
    }
    return false;
  };
  page.drawText('Meeting Agenda', { x: leftMargin, y: yPosition, size: 24, font: boldFont, color: rgb(0, 0, 0) });
  yPosition -= 40;
  page.drawText(meeting.title || 'Untitled Meeting', { x: leftMargin, y: yPosition, size: 16, font: boldFont, color: rgb(0.2, 0.2, 0.2) });
  yPosition -= 30;
  if (agendaData.objectives) {
    checkAndAddPage(60);
    page.drawText('Objectives:', { x: leftMargin, y: yPosition, size: 14, font: boldFont, color: rgb(0, 0, 0) });
    yPosition -= lineHeight;
    const objectiveLines = wrapText(agendaData.objectives, pageWidth - leftMargin - 50, 12, font);
    for (const line of objectiveLines) {
      checkAndAddPage(lineHeight);
      page.drawText(line, { x: leftMargin + 10, y: yPosition, size: 12, font: font, color: rgb(0, 0, 0) });
      yPosition -= lineHeight;
    }
    yPosition -= 10;
  }
  if (agendaData.preparationRequired && agendaData.preparationRequired.length > 0) {
    checkAndAddPage(60);
    page.drawText('Preparation Required:', { x: leftMargin, y: yPosition, size: 14, font: boldFont, color: rgb(0, 0, 0) });
    yPosition -= lineHeight;
    agendaData.preparationRequired.forEach((item: string, index: number) => {
      checkAndAddPage(lineHeight);
      const itemLines = wrapText(`${index + 1}. ${item}`, pageWidth - leftMargin - 60, 12, font);
      for (const line of itemLines) {
        checkAndAddPage(lineHeight);
        page.drawText(line, { x: leftMargin + 10, y: yPosition, size: 12, font: font, color: rgb(0, 0, 0) });
        yPosition -= lineHeight;
      }
    });
    yPosition -= 10;
  }
  if (agendaData.agendaItems && agendaData.agendaItems.length > 0) {
    checkAndAddPage(60);
    page.drawText('Agenda Items:', { x: leftMargin, y: yPosition, size: 14, font: boldFont, color: rgb(0, 0, 0) });
    yPosition -= lineHeight;
    agendaData.agendaItems.forEach((item: any, index: number) => {
      checkAndAddPage(80);
      page.drawText(`${index + 1}. ${item.topic}`, { x: leftMargin + 10, y: yPosition, size: 12, font: boldFont, color: rgb(0, 0, 0) });
      yPosition -= lineHeight;
      if (item.description) {
        const descLines = wrapText(item.description, pageWidth - leftMargin - 70, 11, font);
        for (const line of descLines) {
          checkAndAddPage(lineHeight);
          page.drawText(line, { x: leftMargin + 20, y: yPosition, size: 11, font: font, color: rgb(0.2, 0.2, 0.2) });
          yPosition -= lineHeight;
        }
      }
      if (item.presenter || item.duration) {
        checkAndAddPage(lineHeight);
        const details = [];
        if (item.presenter) details.push(`Presenter: ${item.presenter}`);
        if (item.duration) details.push(`Duration: ${item.duration} min`);
        page.drawText(details.join(' | '), { x: leftMargin + 20, y: yPosition, size: 10, font: font, color: rgb(0.4, 0.4, 0.4) });
        yPosition -= lineHeight;
      }
      yPosition -= 5;
    });
    yPosition -= 10;
  }
  if (agendaData.actionItems && agendaData.actionItems.length > 0) {
    checkAndAddPage(60);
    page.drawText('Action Items:', { x: leftMargin, y: yPosition, size: 14, font: boldFont, color: rgb(0, 0, 0) });
    yPosition -= lineHeight;
    agendaData.actionItems.forEach((item: string, index: number) => {
      checkAndAddPage(lineHeight);
      const itemLines = wrapText(`${index + 1}. ${item}`, pageWidth - leftMargin - 60, 12, font);
      for (const line of itemLines) {
        checkAndAddPage(lineHeight);
        page.drawText(line, { x: leftMargin + 10, y: yPosition, size: 12, font: font, color: rgb(0, 0, 0) });
        yPosition -= lineHeight;
      }
    });
  }
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generateMinutesPDF(meeting: any, minutesData: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let yPosition = 750;
  const leftMargin = 50;
  const pageWidth = 595;
  const lineHeight = 20;
  const checkAndAddPage = (requiredSpace: number) => {
    if (yPosition - requiredSpace < 50) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = 750;
      return true;
    }
    return false;
  };
  page.drawText('Meeting Minutes', { x: leftMargin, y: yPosition, size: 24, font: boldFont, color: rgb(0, 0, 0) });
  yPosition -= 40;
  page.drawText(meeting.title || 'Untitled Meeting', { x: leftMargin, y: yPosition, size: 16, font: boldFont, color: rgb(0.2, 0.2, 0.2) });
  yPosition -= 30;
  let parsedMinutes = minutesData;
  if (typeof minutesData === 'string') {
    try {
      const parsed = JSON.parse(minutesData);
      if (parsed.savedMinutes && parsed.savedMinutes.length > 0) {
        parsedMinutes = parsed.savedMinutes[parsed.savedMinutes.length - 1];
      }
    } catch (e) {
      parsedMinutes = {};
    }
  }
  if (parsedMinutes?.attendees) {
    checkAndAddPage(60);
    page.drawText('Attendees:', { x: leftMargin, y: yPosition, size: 14, font: boldFont, color: rgb(0, 0, 0) });
    yPosition -= lineHeight;
    const attendeeText = typeof parsedMinutes.attendees === 'string' ? parsedMinutes.attendees : parsedMinutes.attendees.join(', ');
    const attendeeLines = wrapText(attendeeText, pageWidth - leftMargin - 50, 12, font);
    for (const line of attendeeLines) {
      checkAndAddPage(lineHeight);
      page.drawText(line, { x: leftMargin + 10, y: yPosition, size: 12, font: font, color: rgb(0, 0, 0) });
      yPosition -= lineHeight;
    }
    yPosition -= 10;
  }
  if (parsedMinutes?.discussion) {
    checkAndAddPage(60);
    page.drawText('Discussion:', { x: leftMargin, y: yPosition, size: 14, font: boldFont, color: rgb(0, 0, 0) });
    yPosition -= lineHeight;
    const discussionLines = wrapText(parsedMinutes.discussion, pageWidth - leftMargin - 50, 12, font);
    for (const line of discussionLines) {
      checkAndAddPage(lineHeight);
      page.drawText(line, { x: leftMargin + 10, y: yPosition, size: 12, font: font, color: rgb(0, 0, 0) });
      yPosition -= lineHeight;
    }
    yPosition -= 10;
  }
  if (parsedMinutes?.decisions) {
    checkAndAddPage(60);
    page.drawText('Decisions:', { x: leftMargin, y: yPosition, size: 14, font: boldFont, color: rgb(0, 0, 0) });
    yPosition -= lineHeight;
    const decisionLines = wrapText(parsedMinutes.decisions, pageWidth - leftMargin - 50, 12, font);
    for (const line of decisionLines) {
      checkAndAddPage(lineHeight);
      page.drawText(line, { x: leftMargin + 10, y: yPosition, size: 12, font: font, color: rgb(0, 0, 0) });
      yPosition -= lineHeight;
    }
    yPosition -= 10;
  }
  if (parsedMinutes?.actionItems && parsedMinutes.actionItems.length > 0) {
    checkAndAddPage(60);
    page.drawText('Action Items:', { x: leftMargin, y: yPosition, size: 14, font: boldFont, color: rgb(0, 0, 0) });
    yPosition -= lineHeight;
    parsedMinutes.actionItems.forEach((item: string, index: number) => {
      checkAndAddPage(lineHeight);
      const itemLines = wrapText(`${index + 1}. ${item}`, pageWidth - leftMargin - 60, 12, font);
      for (const line of itemLines) {
        checkAndAddPage(lineHeight);
        page.drawText(line, { x: leftMargin + 10, y: yPosition, size: 12, font: font, color: rgb(0, 0, 0) });
        yPosition -= lineHeight;
      }
    });
    yPosition -= 10;
  }
  if (parsedMinutes?.notes) {
    checkAndAddPage(60);
    page.drawText('Additional Notes:', { x: leftMargin, y: yPosition, size: 14, font: boldFont, color: rgb(0, 0, 0) });
    yPosition -= lineHeight;
    const notesLines = wrapText(parsedMinutes.notes, pageWidth - leftMargin - 50, 12, font);
    for (const line of notesLines) {
      checkAndAddPage(lineHeight);
      page.drawText(line, { x: leftMargin + 10, y: yPosition, size: 12, font: font, color: rgb(0, 0, 0) });
      yPosition -= lineHeight;
    }
  }
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generatePDFFromHTML(htmlContent: string, title: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let yPosition = 750;
  const leftMargin = 50;
  const pageWidth = 595;
  const lineHeight = 20;
  const checkAndAddPage = (requiredSpace: number) => {
    if (yPosition - requiredSpace < 50) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = 750;
      return true;
    }
    return false;
  };
  page.drawText(title, { x: leftMargin, y: yPosition, size: 24, font: boldFont, color: rgb(0, 0, 0) });
  yPosition -= 40;
  const plainText = htmlContent.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
  const paragraphs = plainText.split('\n').filter(p => p.trim());
  for (const paragraph of paragraphs) {
    const lines = wrapText(paragraph, pageWidth - leftMargin - 50, 12, font);
    for (const line of lines) {
      checkAndAddPage(lineHeight);
      page.drawText(line, { x: leftMargin, y: yPosition, size: 12, font: font, color: rgb(0, 0, 0) });
      yPosition -= lineHeight;
    }
    yPosition -= 5;
  }
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
