import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export async function GET() {
  try {
    console.log('Test PDF endpoint called');
    
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    
    doc.on('data', (chunk) => chunks.push(chunk));
    
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
    
    doc.fontSize(25).text('Test PDF Generation', 100, 100);
    doc.fontSize(12).text('This is a test PDF generated with PDFKit', 100, 150);
    doc.end();
    
    const pdfBuffer = await pdfPromise;
    console.log('PDF generated successfully');
    
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test.pdf"'
      }
    });
  } catch (error) {
    console.error('Test PDF error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
