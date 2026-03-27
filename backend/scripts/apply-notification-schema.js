require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  console.log('Connected to Supabase. Creating Notification table...');
  
  try {
    // Note: DDL in generic pooler should avoid complex transactions if they lock or fail.
    // Creating table and index.
    
    console.log('Creating Notification table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "body" TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "link" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log('Adding foreign key constraint...');
    await client.query(`
      ALTER TABLE "Notification" 
      DROP CONSTRAINT IF EXISTS "Notification_userId_fkey";
      
      ALTER TABLE "Notification" 
      ADD CONSTRAINT "Notification_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    // Concurrent index creation should not be inside an explicit transaction block
    console.log('Creating indexes (concurrently)...');
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS "Notification_userId_isRead_createdAt_idx" 
      ON "Notification"("userId", "isRead", "createdAt" DESC);
    `);

    console.log('✅ Notification schema successfully created!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
