/* eslint-disable no-console */
import * as bcryptjs from 'bcryptjs';

import { AdminRole, PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function seedAdmin() {
  console.log('👤 Seeding admin user...');

  // Get admin credentials from environment variables
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Validate that required environment variables are set
  if (!adminEmail) {
    console.error('❌ ADMIN_EMAIL environment variable is not set');
    process.exit(1);
  }

  if (!adminPassword) {
    console.error('❌ ADMIN_PASSWORD environment variable is not set');
    process.exit(1);
  }

  if (adminPassword.length < 6) {
    console.error('❌ ADMIN_PASSWORD must be at least 6 characters long');
    process.exit(1);
  }

  // Check if super admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  let superAdmin = existingAdmin;

  if (existingAdmin) {
    console.log(`⚠️  Super admin user with email ${adminEmail} already exists`);
    console.log(`   User ID: ${existingAdmin.id}`);
    console.log(`   Role: ${existingAdmin.role}`);
  } else {
    // Hash the password
    const hashedPassword = await bcryptjs.hash(adminPassword, 10);

    // Create super admin user
    superAdmin = await prisma.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Admin',
        role: AdminRole.ADMIN,
        isSuper: true,
      },
    });

    console.log('✅ Super admin user created successfully');
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Role: ${superAdmin.role}`);
  }
}

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    await seedAdmin();

    console.log('\n🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
