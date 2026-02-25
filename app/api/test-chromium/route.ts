import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Testing Chromium availability...');
    console.log('Environment:', process.env.NODE_ENV);
    
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      console.log('Production mode - testing @sparticuz/chromium');
      
      try {
        const chromium = await import('@sparticuz/chromium');
        console.log('Chromium imported successfully');
        
        const executablePath = await chromium.default.executablePath();
        console.log('Executable path:', executablePath);
        
        const puppeteerCore = await import('puppeteer-core');
        console.log('Puppeteer-core imported successfully');
        
        console.log('Attempting to launch browser...');
        const browser = await puppeteerCore.default.launch({
          args: chromium.default.args,
          defaultViewport: chromium.default.defaultViewport,
          executablePath: executablePath,
          headless: chromium.default.headless,
        });
        
        console.log('Browser launched successfully!');
        
        const version = await browser.version();
        console.log('Browser version:', version);
        
        await browser.close();
        console.log('Browser closed successfully');
        
        return NextResponse.json({
          success: true,
          message: 'Chromium is working!',
          version: version,
          executablePath: executablePath
        });
        
      } catch (error: any) {
        console.error('Chromium error:', error);
        return NextResponse.json({
          success: false,
          error: error.message,
          stack: error.stack,
          type: error.constructor.name
        }, { status: 500 });
      }
    } else {
      console.log('Development mode - testing puppeteer');
      
      try {
        const puppeteer = await import('puppeteer');
        console.log('Puppeteer imported successfully');
        
        const browser = await puppeteer.default.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        console.log('Browser launched successfully!');
        const version = await browser.version();
        await browser.close();
        
        return NextResponse.json({
          success: true,
          message: 'Puppeteer is working!',
          version: version
        });
        
      } catch (error: any) {
        console.error('Puppeteer error:', error);
        return NextResponse.json({
          success: false,
          error: error.message,
          stack: error.stack
        }, { status: 500 });
      }
    }
    
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
