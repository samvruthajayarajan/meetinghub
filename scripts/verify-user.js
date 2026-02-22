const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'test@example.com';
  const password = 'password123';

  console.log('Looking for user:', email);
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log('❌ User not found!');
    return;
  }

  console.log('✓ User found');
  console.log('  ID:', user.id);
  console.log('  Email:', user.email);
  console.log('  Name:', user.name);
  console.log('  Role:', user.role);
  console.log('  Password hash:', user.password.substring(0, 20) + '...');

  console.log('\nTesting password:', password);
  const isValid = await bcrypt.compare(password, user.password);
  console.log('Password valid:', isValid ? '✓ YES' : '❌ NO');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
