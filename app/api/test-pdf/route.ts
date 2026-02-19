import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Test PDF endpoint called');
    
    // Test if puppeteer is available
    const puppeteer = await import('puppeteer');
    console.log('Puppeteer imported successfully');
    
    const browser = await puppeteer.launch({ headless: true });
    console.log('Browser launched');
    
    const page = await browser.newPage();
    await page.setContent('<html><body><h1>Test PDF</h1></body></html>');
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();
    console.log('PDF generated successfully');
    
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test.pdf"'
      }
    });
  } catch (error) {
    console.error('Test PDF error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 });
  }
}
