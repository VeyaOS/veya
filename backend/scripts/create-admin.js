const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('❌  ADMIN_EMAIL and ADMIN_PASSWORD must be set as environment variables.');
    console.error('    Example: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=StrongPass123!');
    process.exit(1);
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (existing) {
      if (existing.role !== 'SUPER_ADMIN') {
        await prisma.user.update({ where: { id: existing.id }, data: { role: 'SUPER_ADMIN' } });
        console.log(`✅ Upgraded ${adminEmail} to SUPER_ADMIN`);
      } else {
        console.log(`✅ ${adminEmail} is already SUPER_ADMIN`);
      }
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Veya',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        emailVerified: true,
        merchant: {
          create: {
            storeName: 'Veya Executive Store',
            slug: 'veya-executive',
            plan: 'ENTERPRISE'
          }
        }
      }
    });

    console.log(`✅ SUPER_ADMIN created: ${adminEmail}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
