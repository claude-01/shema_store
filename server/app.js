/**
 * SHEMA STORE - Express Application Setup
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const crypto = require('crypto');
const path = require('path');
const { requireAdmin } = require('./middleware/authMiddleware');
const databaseConfig = require('./config/config').database;

const app = express();

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            'connect-src': ["'self'", 'https://nominatim.openstreetmap.org']
        }
    }
}));
const corsOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
if (corsOrigins.length) {
    app.use(cors({
        origin: (origin, callback) => {
            if (!origin || corsOrigins.includes(origin)) return callback(null, true);
            return callback(new Error('CORS origin is not allowed'));
        },
        credentials: true
    }));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

const sessionStore = new MySQLStore({
    host: databaseConfig.host,
    port: databaseConfig.port,
    user: databaseConfig.user,
    password: databaseConfig.password,
    database: databaseConfig.database,
    ssl: databaseConfig.ssl,
    createDatabaseTable: true,
    connectionLimit: 1,
    waitForConnections: true,
    queueLimit: 0
});

const sessionSecret = process.env.SESSION_SECRET || (
    process.env.NODE_ENV === 'production'
        ? crypto.randomBytes(32).toString('hex')
        : 'local-development-session-secret'
);
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
    console.warn('SESSION_SECRET is not configured; sessions will reset when the service restarts. Set it in Render environment variables.');
}

// Session configuration
app.use(session({
    store: sessionStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Static files
app.use(express.static(path.join(__dirname, '../client')));
app.use('/admin', (req, res, next) => {
    const publicAdminAsset = req.path === '/login.html' || req.path.startsWith('/assets/');
    if (publicAdminAsset || (req.session && req.session.adminId)) return next();
    return res.redirect('/admin/login.html');
}, express.static(path.join(__dirname, '../admin')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../admin/dashboard.html')));
app.get('/admin/', (req, res) => res.sendFile(path.join(__dirname, '../admin/dashboard.html')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/category/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/category.html'));
});
app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/product.html'));
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/images', require('./routes/imagesRoutes'));
app.use('/api/delivery-zones', require('./routes/deliveryRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

module.exports = app;
