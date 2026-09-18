const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function runImport() {
  const sqlPath = path.join(__dirname, 'database.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('database.sql not found at', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';

  console.log('Connecting to MySQL at', host, 'as', user);

  const connection = await mysql.createConnection({ host, user, password, multipleStatements: true });
  try {
    console.log('Running SQL import (this may take a moment)...');
    await connection.query(sql);
    console.log('Database import completed successfully.');
  } catch (err) {
    console.error('Database import failed:', err.message || err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runImport();
