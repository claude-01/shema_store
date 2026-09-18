/**
 * SHEMA STORE - Application Configuration
 */

module.exports = {
    app: {
        name: 'SHEMA STORE',
        version: '1.0.0'
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shema_store'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your_jwt_secret',
        expiresIn: '24h'
    },
    uploads: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp']
    }
};
