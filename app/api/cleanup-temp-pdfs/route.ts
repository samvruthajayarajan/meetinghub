import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// This route can be called manually or via a cron job to clean up old PDFs
export async function POST(req: NextRequest) {
  try {
    const publicDir = path.join(process.cwd(), 'public', 'temp-pdfs');
    
    // Check if directory exists
    if (!fs.existsSync(publicDir)) {
      return NextResponse.json({ 
        message: 'No temp-pdfs directory found',
        deleted: 0
      });
    }

    const files = fs.readdirSync(publicDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(publicDir, file);
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtimeMs;

      // Delete files older than 24 hours
      if (fileAge > maxAge) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }

    return NextResponse.json({ 
      message: `Cleanup completed. Deleted ${deletedCount} old PDF(s)`,
      deleted: deletedCount,
      remaining: files.length - deletedCount
    });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ 
      error: `Cleanup failed: ${error.message}`
    }, { status: 500 });
  }
}

// GET method for manual testing
export async function GET(req: NextRequest) {
  return POST(req);
}
