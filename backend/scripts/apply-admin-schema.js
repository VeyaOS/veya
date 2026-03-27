require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  console.log('Connected to Database. Altering AdminAction constraint...');

  try {
    // 1. Drop the existing CASCADE constraint
    try {
      await client.query(`ALTER TABLE "AdminAction" DROP CONSTRAINT "AdminAction_adminId_fkey";`);
      console.log('Dropped old cascading constraint');
    } catch(e) { console.log('Constraint might not exist or alternate name', e.message); }

    // 2. Make adminId optional
    try {
      await client.query(`ALTER TABLE "AdminAction" ALTER COLUMN "adminId" DROP NOT NULL;`);
      console.log('Made adminId optional');
    } catch(e) { console.log('Error making adminId optional', e.message); }

    // 3. Add the new SET NULL constraint
    try {
      await client.query(`
        ALTER TABLE "AdminAction" 
        ADD CONSTRAINT "AdminAction_adminId_fkey" 
        FOREIGN KEY ("adminId") REFERENCES "User"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
      `);
      console.log('Added new SET NULL constraint successfully!');
    } catch(e) { console.log('Error adding new constraint', e.message); }

    console.log('✅ Manual Migration complete');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
