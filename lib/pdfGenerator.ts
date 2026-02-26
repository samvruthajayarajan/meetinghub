import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  const avgCharWidth = fontSize * 0.5;
  const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function generateMeetingDetailsPDF(meeting: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let yPosition = height - 80;
  page.drawText('Meeting Details', { x: 50, y: yPosition, size: 24, font: fontBold, color: rgb(0, 0, 0) });
  yPosition -= 50;
  page.drawText('Meeting Title:', { x: 50, y: yPosition, size: 12, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
  yPosition -= 20;
  const titleLines = wrapText(meeting.title || 'N/A', width - 100, 14);
  for (const line of titleLines) {
    page.drawText(line, { x: 50, y: yPosition, size: 14, font: fontRegular, color: rgb(0, 0, 0) });
    yPosition -= 20;
  }
  yPosition -= 10;
  page.drawText('Date:', { x: 50, y: yPosition, size: 12, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
  yPosition -= 20;
  const dateStr = meeting.date ? new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  page.drawText(dateStr, { x: 50, y: yPosition, size: 14, font: fontRegular, color: rgb(0, 0, 0) });
  yPosition -= 30;
  page.drawText('Time:', { x: 50, y: yPosition, size: 12, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
  yPosition -= 20;
  const timeStr = meeting.date ? new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
  page.drawText(timeStr, { x: 50, y: yPosition, size: 14, font: fontRegular, color: rgb(0, 0, 0) });
  yPosition -= 30;
  page.drawText('Mode:', { x: 50, y: yPosition, size: 12, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
  yPosition -= 20;
  page.drawText((meeting.meetingMode || 'Offline').charAt(0).toUpperCase() + (meeting.meetingMode || 'Offline').slice(1), { x: 50, y: yPosition, size: 14, font: fontRegular, color: rgb(0, 0, 0) });
  yPosition -= 30;
  if (meeting.location) {
    page.drawText('Location:', { x: 50, y: yPosition, size: 12, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    yPosition -= 20;
    const locationLines = wrapText(meeting.location, width - 100, 14);
    for (const line of locationLines) {
      page.drawText(line, { x: 50, y: yPosition, size: 14, font: fontRegular, color: rgb(0, 0, 0) });
      yPosition -= 20;
    }
    yPosition -= 10;
  }
  if (meeting.meetingLink && (meeting.meetingMode === 'online' || meeting.meetingMode === 'hybrid')) {
    page.drawText('Meeting Link:', { x: 50, y: yPosition, size: 12, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    yPosition -= 20;
    const linkLines = wrapText(meeting.meetingLink, width - 100, 12);
    for (const line of linkLines) {
      page.drawText(line, { x: 50, y: yPosition, size: 12, font: fontRegular, color: rgb(0, 0.4, 0.8) });
      yPosition -= 18;
    }
  }
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generateAgendaPDF(meeting: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let yPosition = height - 80;
  page.drawText('Meeting Agenda', { x: 50, y: yPosition, size: 24, font: fontBold, color: rgb(0, 0, 0) });
  yPosition -= 40;
  let savedAgendas: any[] = [];
  if (meeting.description) {
    try {
      const parsed = JSON.parse(meeting.description);
      if (parsed.savedAgendas && Array.isArray(parsed.savedAgendas)) savedAgendas = parsed.savedAgendas;
    } catch (e) {}
  }
  if (savedAgendas.length === 0) {
    page.drawText('No agenda available', { x: 50, y: yPosition, size: 14, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
  } else {
    const latestAgenda = savedAgendas[savedAgendas.length - 1];
    if (latestAgenda.objectives) {
      page.drawText('Objectives:', { x: 50, y: yPosition, size: 14, font: fontBold, color: rgb(0, 0, 0) });
      yPosition -= 20;
      const objectiveLines = wrapText(latestAgenda.objectives, width - 100, 12);
      for (const line of objectiveLines) {
        page.drawText(line, { x: 50, y: yPosition, size: 12, font: fontRegular, color: rgb(0, 0, 0) });
        yPosition -= 18;
      }
      yPosition -= 10;
    }
    if (latestAgenda.preparationRequired && latestAgenda.preparationRequired.length > 0) {
      page.drawText('Preparation Required:', { x: 50, y: yPosition, size: 14, font: fontBold, color: rgb(0, 0, 0) });
      yPosition -= 20;
      for (let i = 0; i < latestAgenda.preparationRequired.length; i++) {
        const item = latestAgenda.preparationRequired[i];
        const itemLines = wrapText(`${i + 1}. ${item}`, width - 100, 12);
        for (const line of itemLines) {
          page.drawText(line, { x: 50, y: yPosition, size: 12, font: fontRegular, color: rgb(0, 0, 0) });
          yPosition -= 18;
        }
      }
      yPosition -= 10;
    }
    if (latestAgenda.agendaItems && latestAgenda.agendaItems.length > 0) {
      page.drawText('Agenda Items:', { x: 50, y: yPosition, size: 14, font: fontBold, color: rgb(0, 0, 0) });
      yPosition -= 20;
      for (let i = 0; i < latestAgenda.agendaItems.length; i++) {
        const item = latestAgenda.agendaItems[i];
        page.drawText(`${i + 1}. ${item.topic}`, { x: 50, y: yPosition, size: 12, font: fontBold, color: rgb(0, 0, 0) });
        yPosition -= 18;
        if (item.description) {
          const descLines = wrapText(item.description, width - 100, 11);
          for (const line of descLines) {
            page.drawText(line, { x: 60, y: yPosition, size: 11, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
            yPosition -= 16;
          }
        }
        if (item.presenter) {
          page.drawText(`Presenter: ${item.presenter}`, { x: 60, y: yPosition, size: 11, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
          yPosition -= 16;
        }
        if (item.duration) {
          page.drawText(`Duration: ${item.duration} minutes`, { x: 60, y: yPosition, size: 11, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
          yPosition -= 16;
        }
        yPosition -= 10;
      }
    }
    if (latestAgenda.actionItems && latestAgenda.actionItems.length > 0) {
      page.drawText('Action Items:', { x: 50, y: yPosition, size: 14, font: fontBold, color: rgb(0, 0, 0) });
      yPosition -= 20;
      for (let i = 0; i < latestAgenda.actionItems.length; i++) {
        const item = latestAgenda.actionItems[i];
        const itemLines = wrapText(`${i + 1}. ${item}`, width - 100, 12);
        for (const line of itemLines) {
          page.drawText(line, { x: 50, y: yPosition, size: 12, font: fontRegular, color: rgb(0, 0, 0) });
          yPosition -= 18;
        }
      }
    }
  }
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generateMinutesPDF(meeting: any, minutes: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let yPosition = height - 80;
  page.drawText('Meeting Minutes', { x: 50, y: yPosition, size: 24, font: fontBold, color: rgb(0, 0, 0) });
  yPosition -= 40;
  if (!minutes || Object.keys(minutes).length === 0) {
    page.drawText('No minutes available', { x: 50, y: yPosition, size: 14, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
  } else {
    if (minutes.attendees && minutes.attendees.length > 0) {
      page.drawText('Attendees:', { x: 50, y: yPosition, size: 14, font: fontBold, color: rgb(0, 0, 0) });
      yPosition -= 20;
      for (const attendee of minutes.attendees) {
        page.drawText(`• ${attendee}`, { x: 60, y: yPosition, size: 12, font: fontRegular, color: rgb(0, 0, 0) });
        yPosition -= 18;
      }
      yPosition -= 10;
    }
    if (minutes.discussionPoints && minutes.discussionPoints.length > 0) {
      page.drawText('Discussion Points:', { x: 50, y: yPosition, size: 14, font: fontBold, color: rgb(0, 0, 0) });
      yPosition -= 20;
      for (let i = 0; i < minutes.discussionPoints.length; i++) {
        const point = minutes.discussionPoints[i];
        const pointLines = wrapText(`${i + 1}. ${point}`, width - 100, 12);
        for (const line of pointLines) {
          page.drawText(line, { x: 50, y: yPosition, size: 12, font: fontRegular, color: rgb(0, 0, 0) });
          yPosition -= 18;
        }
      }
      yPosition -= 10;
    }
    if (minutes.decisions && minutes.decisions.length > 0) {
      page.drawText('Decisions Made:', { x: 50, y: yPosition, size: 14, font: fontBold, color: rgb(0, 0, 0) });
      yPosition -= 20;
      for (let i = 0; i < minutes.decisions.length; i++) {
        const decision = minutes.decisions[i];
        const decisionLines = wrapText(`${i + 1}. ${decision}`, width - 100, 12);
        for (const line of decisionLines) {
          page.drawText(line, { x: 50, y: yPosition, size: 12, font: fontRegular, color: rgb(0, 0, 0) });
          yPosition -= 18;
        }
      }
      yPosition -= 10;
    }
    if (minutes.actionItems && minutes.actionItems.length > 0) {
      page.drawText('Action Items:', { x: 50, y: yPosition, size: 14, font: fontBold, color: rgb(0, 0, 0) });
      yPosition -= 20;
      for (let i = 0; i < minutes.actionItems.length; i++) {
        const item = minutes.actionItems[i];
        const itemLines = wrapText(`${i + 1}. ${item}`, width - 100, 12);
        for (const line of itemLines) {
          page.drawText(line, { x: 50, y: yPosition, size: 12, font: fontRegular, color: rgb(0, 0, 0) });
          yPosition -= 18;
        }
      }
      yPosition -= 10;
    }
    if (minutes.notes) {
      page.drawText('Additional Notes:', { x: 50, y: yPosition, size: 14, font: fontBold, color: rgb(0, 0, 0) });
      yPosition -= 20;
      const notesLines = wrapText(minutes.notes, width - 100, 12);
      for (const line of notesLines) {
        page.drawText(line, { x: 50, y: yPosition, size: 12, font: fontRegular, color: rgb(0, 0, 0) });
        yPosition -= 18;
      }
    }
  }
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generatePDFFromHTML(html: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let yPosition = height - 80;
  page.drawText('Meeting Report', { x: 50, y: yPosition, size: 24, font: fontBold, color: rgb(0, 0, 0) });
  yPosition -= 40;
  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!textContent) {
    page.drawText('No report content available', { x: 50, y: yPosition, size: 14, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
  } else {
    const contentLines = wrapText(textContent, width - 100, 12);
    for (const line of contentLines) {
      if (yPosition < 50) break;
      page.drawText(line, { x: 50, y: yPosition, size: 12, font: fontRegular, color: rgb(0, 0, 0) });
      yPosition -= 18;
    }
  }
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
