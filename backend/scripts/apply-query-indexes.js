require('dotenv').config();
const { Pool } = require('pg');

const statements = [
  'CREATE INDEX IF NOT EXISTS "Invoice_merchantId_createdAt_idx" ON "Invoice"("merchantId", "createdAt");',
  'CREATE INDEX IF NOT EXISTS "Invoice_merchantId_status_createdAt_idx" ON "Invoice"("merchantId", "status", "createdAt");',
  'CREATE INDEX IF NOT EXISTS "Invoice_merchantId_status_settledAt_idx" ON "Invoice"("merchantId", "status", "settledAt");',
  'CREATE INDEX IF NOT EXISTS "Invoice_customerId_idx" ON "Invoice"("customerId");',
  'CREATE INDEX IF NOT EXISTS "Customer_merchantId_idx" ON "Customer"("merchantId");',
  'CREATE INDEX IF NOT EXISTS "Customer_merchantId_createdAt_idx" ON "Customer"("merchantId", "createdAt");',
  'CREATE INDEX IF NOT EXISTS "Customer_merchantId_name_idx" ON "Customer"("merchantId", "name");',
  'CREATE INDEX IF NOT EXISTS "StaffMember_merchantId_idx" ON "StaffMember"("merchantId");',
  'CREATE INDEX IF NOT EXISTS "StaffMember_merchantId_createdAt_idx" ON "StaffMember"("merchantId", "createdAt");',
  'CREATE INDEX IF NOT EXISTS "StaffMember_merchantId_email_idx" ON "StaffMember"("merchantId", "email");',
  'CREATE INDEX IF NOT EXISTS "AdminAction_adminId_createdAt_idx" ON "AdminAction"("adminId", "createdAt");',
  'CREATE INDEX IF NOT EXISTS "SupportTicket_merchantId_createdAt_idx" ON "SupportTicket"("merchantId", "createdAt");',
  'CREATE INDEX IF NOT EXISTS "SupportTicket_merchantId_status_idx" ON "SupportTicket"("merchantId", "status");',
  'CREATE INDEX IF NOT EXISTS "system_logs_created_at_idx" ON "system_logs"("created_at");'
];

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  try {
    console.log('Connected to Supabase. Applying query indexes...');
    for (const statement of statements) {
      await client.query(statement);
    }
    console.log('Query indexes applied successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Failed to apply query indexes:', error);
  process.exitCode = 1;
});
