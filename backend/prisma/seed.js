require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ;
  const adminPassword = process.env.ADMIN_PASSWORD ;

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log('Admin already exists:', adminEmail);
    return;
  }

  const hashed = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      name: 'System Admin',
      email: adminEmail,
      password: hashed,
      role: 'ADMIN',
      isApproved: true,
    },
  });

  console.log('Default admin created:', adminEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
