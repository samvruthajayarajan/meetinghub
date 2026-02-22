const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'john@gmail.com'; // Change this to your email
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      email: true,
      name: true,
      smtpHost: true,
      smtpPort: true,
      smtpUser: true,
      smtpPassword: true,
      gmailAccessToken: true,
      gmailRefreshToken: true
    }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('=== Email Configuration ===');
  console.log('User:', user.name, `(${user.email})`);
  console.log('\nSMTP Configuration:');
  console.log('  Host:', user.smtpHost || '❌ Not configured');
  console.log('  Port:', user.smtpPort || '❌ Not configured');
  console.log('  User:', user.smtpUser || '❌ Not configured');
  console.log('  Password:', user.smtpPassword ? '✓ Configured' : '❌ Not configured');
  
  console.log('\nGmail OAuth:');
  console.log('  Access Token:', user.gmailAccessToken ? '✓ Configured' : '❌ Not configured');
  console.log('  Refresh Token:', user.gmailRefreshToken ? '✓ Configured' : '❌ Not configured');
  
  console.log('\n=== Status ===');
  const hasSmtp = user.smtpHost && user.smtpUser && user.smtpPassword;
  const hasGmail = user.gmailRefreshToken;
  
  if (hasGmail) {
    console.log('✅ Gmail OAuth is configured - emails will be sent via Gmail API');
  } else if (hasSmtp) {
    console.log('✅ SMTP is configured - emails will be sent via SMTP');
  } else {
    console.log('❌ No email method configured!');
    console.log('\nTo fix:');
    console.log('1. Go to http://localhost:3000/user');
    console.log('2. Configure SMTP settings OR connect Gmail');
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
