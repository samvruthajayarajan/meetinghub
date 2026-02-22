// Puppeteer configuration for PDF generation
// Dynamic imports to avoid build issues with Next.js Turbopack

export async function getBrowser() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Vercel/Production environment - dynamically import to avoid build issues
    const chromium = await import('chrome-aws-lambda');
    const puppeteerCore = await import('puppeteer-core');
    
    return puppeteerCore.default.launch({
      args: chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath: await chromium.default.executablePath,
      headless: chromium.default.headless,
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
