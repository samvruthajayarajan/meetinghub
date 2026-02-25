import PDFDocument from 'pdfkit';
import { format } from 'date-fns';

export function generateAgendaPDF(meeting: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Parse agenda data
      let agendaData: any = null;
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

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text(meeting.title.toUpperCase(), { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica').text('Meeting Agenda', { align: 'center' });
      doc.moveDown(1);
      
      // Line separator
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      // Meeting Info
      doc.fontSize(11).font('Helvetica-Bold');
      
      const infoY = doc.y;
      doc.text('Date:', 50, infoY);
      doc.font('Helvetica').text(format(new Date(meeting.date), 'PPPP'), 150, infoY);
      
      doc.font('Helvetica-Bold').text('Time:', 50, doc.y + 5);
      doc.font('Helvetica').text(format(new Date(meeting.date), 'p'), 150, doc.y);
      
      doc.font('Helvetica-Bold').text('Organizer:', 50, doc.y + 5);
      doc.font('Helvetica').text(meeting.user.name, 150, doc.y);
      
      doc.font('Helvetica-Bold').text('Mode:', 50, doc.y + 5);
      doc.font('Helvetica').text(meeting.meetingMode || 'Offline', 150, doc.y);
      
      if (meeting.meetingLink) {
        doc.font('Helvetica-Bold').text('Link:', 50, doc.y + 5);
        doc.font('Helvetica').fillColor('blue').text(meeting.meetingLink, 150, doc.y, { 
          link: meeting.meetingLink,
          underline: true 
        });
        doc.fillColor('black');
      }
      
      doc.moveDown(2);

      if (agendaData) {
        // Objectives
        if (agendaData.objectives) {
          doc.fontSize(14).font('Helvetica-Bold').text('MEETING OBJECTIVES');
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica').text(agendaData.objectives, {
            align: 'justify'
          });
          doc.moveDown(1.5);
        }

        // Preparation Required
        if (agendaData.preparationRequired && agendaData.preparationRequired.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('PREPARATION REQUIRED');
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica');
          agendaData.preparationRequired.forEach((item: string) => {
            doc.text(`• ${item}`, { indent: 20 });
          });
          doc.moveDown(1.5);
        }

        // Agenda Items
        if (agendaData.agendaItems && agendaData.agendaItems.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('AGENDA ITEMS');
          doc.moveDown(1);
          
          agendaData.agendaItems.forEach((item: any, index: number) => {
            // Check if we need a new page
            if (doc.y > 700) {
              doc.addPage();
            }
            
            doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${item.topic}`);
            doc.moveDown(0.3);
            
            if (item.description) {
              doc.fontSize(11).font('Helvetica').text(item.description, {
                indent: 20,
                align: 'justify'
              });
              doc.moveDown(0.3);
            }
            
            doc.fontSize(10).font('Helvetica-Oblique').fillColor('#666');
            const metaInfo = [];
            if (item.presenter) metaInfo.push(`Presenter: ${item.presenter}`);
            if (item.duration) metaInfo.push(`Duration: ${item.duration} minutes`);
            if (metaInfo.length > 0) {
              doc.text(metaInfo.join(' | '), { indent: 20 });
            }
            doc.fillColor('black');
            doc.moveDown(1);
          });
        }

        // Action Items
        if (agendaData.actionItems && agendaData.actionItems.length > 0) {
          if (doc.y > 650) {
            doc.addPage();
          }
          doc.fontSize(14).font('Helvetica-Bold').text('PRE-MEETING ACTION ITEMS');
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica');
          agendaData.actionItems.forEach((item: string) => {
            doc.text(`• ${item}`, { indent: 20 });
          });
          doc.moveDown(1.5);
        }
      } else {
        doc.fontSize(12).font('Helvetica-Oblique').fillColor('#666')
          .text('No agenda available for this meeting.', { align: 'center' });
        doc.fillColor('black');
      }

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(9).font('Helvetica').fillColor('#666');
        doc.text(
          `Generated on ${format(new Date(), 'PPPp')} | Page ${i + 1} of ${pageCount}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
        doc.fillColor('black');
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function generateMinutesPDF(meeting: any, minutes: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text(meeting.title.toUpperCase(), { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica').text('Meeting Minutes', { align: 'center' });
      doc.moveDown(1);
      
      // Line separator
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      // Meeting Info
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Date:', 50, doc.y);
      doc.font('Helvetica').text(format(new Date(meeting.date), 'PPPP'), 150, doc.y);
      
      doc.font('Helvetica-Bold').text('Organizer:', 50, doc.y + 5);
      doc.font('Helvetica').text(meeting.user.name, 150, doc.y);
      
      doc.moveDown(2);

      // Minutes content
      if (minutes) {
        doc.fontSize(11).font('Helvetica').text(minutes, {
          align: 'justify'
        });
      } else {
        doc.fontSize(12).font('Helvetica-Oblique').fillColor('#666')
          .text('No minutes recorded for this meeting.', { align: 'center' });
        doc.fillColor('black');
      }

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(9).font('Helvetica').fillColor('#666');
        doc.text(
          `Generated on ${format(new Date(), 'PPPp')} | Page ${i + 1} of ${pageCount}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
        doc.fillColor('black');
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}


// Generic HTML to PDF converter (simplified - for basic HTML only)
// For complex HTML, consider using an external service
export function generatePDFFromHTML(html: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Strip HTML tags and render as plain text
      // This is a simplified version - for complex HTML, use a proper HTML parser
      const text = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      doc.fontSize(11).font('Helvetica').text(text, {
        align: 'justify'
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
