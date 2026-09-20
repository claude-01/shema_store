/**
 * SHEMA STORE - Application Configuration
 */

function getDatabaseConfig() {
    const sslEnabled = ['true', '1', 'yes'].includes(String(process.env.DB_SSL || '').toLowerCase());
    const cleverAddonConfigured = !!(
        process.env.MYSQL_ADDON_URI ||
        process.env.MYSQL_ADDON_HOST ||
        process.env.MYSQL_ADDON_DB ||
        process.env.MYSQL_ADDON_USER ||
        process.env.MYSQL_ADDON_PASSWORD
    );

    if (cleverAddonConfigured || process.env.MYSQL_ADDON_URI) {
        const uri = process.env.MYSQL_ADDON_URI;
        if (uri) {
            const parsed = new URL(uri);
            return {
                host: parsed.hostname || process.env.MYSQL_ADDON_HOST || 'localhost',
                port: Number(parsed.port || process.env.MYSQL_ADDON_PORT || 3306),
                user: decodeURIComponent(parsed.username || process.env.MYSQL_ADDON_USER || 'root'),
                password: decodeURIComponent(parsed.password || process.env.MYSQL_ADDON_PASSWORD || ''),
                database: decodeURIComponent(parsed.pathname.replace(/^\//, '') || process.env.MYSQL_ADDON_DB || 'shema_store'),
                ssl: sslEnabled || /clever-cloud|mysql\.services/i.test(parsed.hostname || '') ? { rejectUnauthorized: false } : undefined
            };
        }

        return {
            host: process.env.MYSQL_ADDON_HOST || 'localhost',
            port: Number(process.env.MYSQL_ADDON_PORT || 3306),
            user: process.env.MYSQL_ADDON_USER || 'root',
            password: process.env.MYSQL_ADDON_PASSWORD || '',
            database: process.env.MYSQL_ADDON_DB || 'shema_store',
            ssl: sslEnabled || /clever-cloud|mysql\.services/i.test(process.env.MYSQL_ADDON_HOST || '') ? { rejectUnauthorized: false } : undefined
        };
    }

    const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_URI;
    if (connectionUrl) {
        const parsed = new URL(connectionUrl);
        const params = parsed.searchParams || {};
        const needsSsl = sslEnabled || params.get('ssl') === 'true' || params.get('sslmode') === 'require' || parsed.hostname.includes('clever') || parsed.hostname.includes('cloud') || parsed.hostname.includes('sql') || parsed.hostname.includes('render');

        return {
            host: parsed.hostname,
            port: Number(parsed.port || 3306),
            user: decodeURIComponent(parsed.username),
            password: decodeURIComponent(parsed.password),
            database: decodeURIComponent(parsed.pathname.replace(/^\//, '')),
            ssl: needsSsl ? { rejectUnauthorized: false } : undefined
        };
    }

    return {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shema_store',
        ssl: sslEnabled ? { rejectUnauthorized: false } : undefined
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
