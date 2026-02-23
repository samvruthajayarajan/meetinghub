// Puppeteer configuration for PDF generation
// Using @sparticuz/chromium for better Vercel compatibility

export async function getBrowser() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    try {
      // Vercel/Production environment
      const chromium = await import('@sparticuz/chromium');
      const puppeteerCore = await import('puppeteer-core');
      
      console.log('Launching Chromium on Vercel...');
      
      return await puppeteerCore.default.launch({
        args: [
          ...chromium.default.args,
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-first-run',
          '--no-sandbox',
          '--no-zygote',
          '--single-process',
        ],
        defaultViewport: chromium.default.defaultViewport,
        executablePath: await chromium.default.executablePath(),
        headless: chromium.default.headless,
        timeout: 30000, // 30 second timeout
      });
    } catch (error) {
      console.error('Failed to launch Chromium:', error);
      throw new Error(`Chromium launch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else {
    // Local development
    const puppeteerLocal = await import('puppeteer');
    return puppeteerLocal.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
}
