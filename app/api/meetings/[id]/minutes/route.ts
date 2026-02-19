import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const minutes = await prisma.minutes.upsert({
    where: { meetingId: id },
    update: {
      discussions: body.discussions,
      decisions: body.decisions,
      actionItems: body.actionItems,
      attendees: body.attendees
    },
    create: {
      meetingId: id,
      discussions: body.discussions,
      decisions: body.decisions,
      actionItems: body.actionItems,
      attendees: body.attendees
    }
  });

  return NextResponse.json(minutes);
}
