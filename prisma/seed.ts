import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.create({
      data: {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        is_active: true,
      },
    });

    console.log('Created admin user:', adminUser.email);
  } else {
    console.log('Admin user already exists:', existingUser.email);
  }

  const userCount = await prisma.user.count();
  console.log(`Total users in database: ${userCount}`);

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });