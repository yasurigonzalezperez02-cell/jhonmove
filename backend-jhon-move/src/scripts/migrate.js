const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { pool } = require('../config/db');

async function migrate() {
  const schemaPath = path.join(__dirname, '../../sql/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8')
    .replace(/--.*$/gm, '');
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const conn = await pool.getConnection();
  try {
    for (const statement of statements) {
      await conn.query(statement);
      console.log('OK:', statement.slice(0, 60).replace(/\s+/g, ' ') + '...');
    }
    console.log('Migración completada.');
  } finally {
    conn.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Error en migración:', err.message);
  process.exit(1);
});
