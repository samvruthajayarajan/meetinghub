import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    console.log('=== TEST LOGIN ===');
    console.log('Email:', email);
    console.log('Password:', password);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User found:', user.email);
    console.log('Stored hash:', user.password.substring(0, 30) + '...');

    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValid);

    return NextResponse.json({
      success: isValid,
      user: isValid ? { id: user.id, email: user.email, name: user.name } : null
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
