import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export async function getBrowser() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Vercel/Production environment
    const executablePath = await chromium.executablePath();
    
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: {
        width: 1280,
        height: 720,
      },
      executablePath,
      headless: true,
    });
  } else {
    // Local development
    const puppeteerLocal = await import('puppeteer');
    return puppeteerLocal.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
}
