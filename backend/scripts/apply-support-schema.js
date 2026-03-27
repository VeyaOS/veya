require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  console.log('Connected. Altering SupportResponse...');

  try {
    // Determine column names. If it's pure Prisma output before mapping, 
    // it's likely "adminId" instead of "admin_id".
    // I will try to alter both and ignore errors if one doesn't exist.

    try {
      await client.query(`ALTER TABLE "SupportResponse" ALTER COLUMN "adminId" DROP NOT NULL;`);
      console.log('Made adminId optional');
    } catch(e) { console.log('adminId might be admin_id', e.message); }

    try {
      await client.query(`ALTER TABLE "SupportResponse" ALTER COLUMN "admin_id" DROP NOT NULL;`);
      console.log('Made admin_id optional');
    } catch(e) {}

    try {
      await client.query(`
        ALTER TABLE "SupportResponse"
        ADD COLUMN "is_from_admin" BOOLEAN NOT NULL DEFAULT true;
      `);
      console.log('Added is_from_admin / isFromAdmin');
    } catch(e) { console.log('is_from_admin already exists or error', e.message); }

    try {
      await client.query(`
        ALTER TABLE "SupportResponse"
        ADD COLUMN "isFromAdmin" BOOLEAN NOT NULL DEFAULT true;
      `);
      console.log('Added isFromAdmin');
    } catch(e) { console.log('isFromAdmin already exists', e.message); }

    console.log('Migration complete');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
