/**
 * SHEMA STORE - Server Entry Point
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const app = require('./app');
const { ensureDatabaseDefaults } = require('./config/database');

const PORT = process.env.PORT || 7070;

async function startServer() {
    try {
        await ensureDatabaseDefaults();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`SHEMA STORE server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start SHEMA STORE server:', error);
        process.exit(1);
    }
}

startServer();
