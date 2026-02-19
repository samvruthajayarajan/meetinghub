import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupAgendaData() {
  try {
    console.log('Starting cleanup...');
    
    // Get all meetings
    const meetings = await prisma.meeting.findMany();
    console.log(`Found ${meetings.length} meetings`);
    
    // Update each meeting to remove agendaData field
    for (const meeting of meetings) {
      console.log(`Processing meeting: ${meeting.title}`);
      
      // Use raw MongoDB query to unset the agendaData field
      await prisma.$runCommandRaw({
        update: 'Meeting',
        updates: [
          {
            q: { _id: { $oid: meeting.id } },
            u: { $unset: { agendaData: "" } }
          }
        ]
      });
      
      console.log(`✓ Cleaned up meeting: ${meeting.title}`);
    }
    
    console.log('Cleanup completed successfully!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAgendaData();
