const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'sp151048@gmail.com' }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('User:', user.email);
  console.log('Hash:', user.password);
  
  // Test with the password we set
  const test1 = await bcrypt.compare('password123', user.password);
  console.log('Compare "password123":', test1);
  
  // Test what the form might be sending
  const test2 = await bcrypt.compare('password123 ', user.password);
  console.log('Compare "password123 " (with space):', test2);
  
  // Generate a new hash and compare
  const newHash = await bcrypt.hash('password123', 10);
  console.log('\nNew hash:', newHash);
  const test3 = await bcrypt.compare('password123', newHash);
  console.log('New hash works:', test3);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
