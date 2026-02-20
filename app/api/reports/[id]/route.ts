import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Get the report to verify ownership
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        meeting: {
          select: {
            createdBy: true
          }
        }
      }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Check if user owns the meeting (or is admin)
    if (session.user.role !== 'ADMIN' && report.meeting.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the report
    await prisma.report.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Report deleted successfully' });
  } catch (error: any) {
    console.error('Delete report error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete report',
      details: error.message 
    }, { status: 500 });
  }
}

