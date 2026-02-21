import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export async function getBrowser() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Vercel/Production environment
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
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
