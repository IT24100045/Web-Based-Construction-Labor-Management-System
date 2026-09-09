const { pool } = require('./db');
const { initializeSchema } = require('./schema');

async function testConnection() {
  try {
    console.log('[Test] Connecting to TiDB Cloud...');
    const [rows] = await pool.query('SELECT VERSION() as version, DATABASE() as current_db');
    console.log('[Test] TiDB Version & DB:', rows[0]);

    await initializeSchema();

    const [tables] = await pool.query('SHOW TABLES');
    console.log('[Test] Existing tables in database:', tables);

    process.exit(0);
  } catch (err) {
    console.error('[Test] Error connecting to TiDB Cloud:', err);
    process.exit(1);
  }
}

testConnection();
