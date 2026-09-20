/**
 * SHEMA STORE - Server Entry Point
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const app = require('./app');

const PORT = process.env.PORT || 7070;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`SHEMA STORE server listening on port ${PORT}`);
});
