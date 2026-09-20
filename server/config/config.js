/**
 * SHEMA STORE - Application Configuration
 */

function getDatabaseConfig() {
    const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_URI;
    if (connectionUrl) {
        const parsed = new URL(connectionUrl);
        return {
            host: parsed.hostname,
            port: Number(parsed.port || 3306),
            user: decodeURIComponent(parsed.username),
            password: decodeURIComponent(parsed.password),
            database: decodeURIComponent(parsed.pathname.replace(/^\//, '')),
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
        };
    }

    return {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shema_store',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    };
}

module.exports = {
    app: {
        name: 'SHEMA STORE',
        version: '1.0.0'
    },
    database: getDatabaseConfig(),
    jwt: {
        secret: process.env.JWT_SECRET || '',
        expiresIn: '24h'
    },
    uploads: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp']
    }
};
