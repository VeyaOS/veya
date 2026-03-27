require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    console.log(res.rows.map(r => r.tablename));
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}
run();
