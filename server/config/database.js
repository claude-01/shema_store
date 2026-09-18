/**
 * SHEMA STORE - Database Configuration
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shema_store',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * Get Database Connection
 */
async function getConnection() {
    return await pool.getConnection();
}

/**
 * Execute Query
 */
async function query(sql, values) {
    const connection = await getConnection();
    try {
        const [results] = await connection.execute(sql, values);
        return results;
    } finally {
        connection.release();
    }
}

module.exports = {
    pool,
    getConnection,
    query
};
