import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user's SMTP config
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
        smtpPassword: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if SMTP is configured
    if (!user.smtpHost || !user.smtpUser || !user.smtpPassword) {
      return NextResponse.json({ 
        error: 'SMTP not configured',
        details: {
          hasHost: !!user.smtpHost,
          hasUser: !!user.smtpUser,
          hasPassword: !!user.smtpPassword
        }
      }, { status: 400 });
    }

    // Log configuration (without password)
    console.log('=== SMTP Test Configuration ===');
    console.log('Host:', user.smtpHost);
    console.log('Port:', user.smtpPort);
    console.log('User:', user.smtpUser);
    console.log('Password length:', user.smtpPassword.length);
    console.log('Password first 4 chars:', user.smtpPassword.substring(0, 4));
    console.log('Password last 4 chars:', user.smtpPassword.substring(user.smtpPassword.length - 4));
    console.log('Has whitespace:', /\s/.test(user.smtpPassword));
    console.log('===============================');

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: user.smtpHost,
      port: user.smtpPort || 587,
      secure: false,
      auth: {
        user: user.smtpUser,
        pass: user.smtpPassword
      },
      debug: true, // Enable debug output
      logger: true // Enable logging
    });

    // Verify connection
    await transporter.verify();

    return NextResponse.json({ 
      success: true,
      message: 'SMTP configuration is valid!',
      config: {
        host: user.smtpHost,
        port: user.smtpPort,
        user: user.smtpUser,
        passwordLength: user.smtpPassword.length
      }
    });

  } catch (error: any) {
    console.error('SMTP Test Error:', error);
    return NextResponse.json({ 
      error: 'SMTP test failed',
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}
