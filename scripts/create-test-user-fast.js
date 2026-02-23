const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'test@test.com';
  const password = 'test123';
  const name = 'Test User';

  // Hash with 1 round (matching current config)
  const hashedPassword = await bcrypt.hash(password, 1);

  // Delete existing user if exists
  await prisma.user.deleteMany({
    where: { email }
  });

  // Create new user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'USER'
    }
  });

  console.log('✅ Test user created successfully!');
  console.log('📧 Email:', email);
  console.log('🔑 Password:', password);
  console.log('👤 User ID:', user.id);
  console.log('\nYou can now login with these credentials.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
