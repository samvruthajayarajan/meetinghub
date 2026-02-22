import { NextResponse } from 'next/server';
import { readdir, unlink, stat } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const tempDir = join(process.cwd(), 'public', 'temp-pdfs');
    const fs = require('fs');
    
    // Check if directory exists
    if (!fs.existsSync(tempDir)) {
      return NextResponse.json({ 
        message: 'No temp directory found',
        deleted: 0 
      });
    }

    const files = await readdir(tempDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    let deletedCount = 0;

    for (const file of files) {
      if (file.endsWith('.pdf')) {
        const filePath = join(tempDir, file);
        const stats = await stat(filePath);
        const fileAge = now - stats.mtimeMs;

        // Delete files older than 24 hours
        if (fileAge > maxAge) {
          await unlink(filePath);
          deletedCount++;
          console.log(`Deleted old PDF: ${file}`);
        }
      }
    }

    return NextResponse.json({ 
      message: `Cleanup completed. Deleted ${deletedCount} old PDF(s)`,
      deleted: deletedCount 
    });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ 
      error: `Cleanup failed: ${error.message}`,
      deleted: 0
    }, { status: 500 });
  }
}
