/**
 * SHEMA STORE - Admin Controller
 */

const db = require('../config/database');
const Admin = require('../models/Admin');
const { comparePassword } = require('../utils/password');

exports.adminLogin = async (req, res) => {
    try {
        const body = req.body && typeof req.body === 'object' ? req.body : {};
        const username = String(body.username || '').trim();
        const password = String(body.password || '');
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }

        const admin = await Admin.findByUsername(username);
        const valid = admin ? await comparePassword(password, admin.password) : false;
        if (!valid) {
            return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
        }

        req.session.adminId = admin.id;
        req.session.adminUsername = admin.username;
        return res.json({ success: true, admin: { id: admin.id, username: admin.username, email: admin.email } });
    } catch (error) {
        console.error('adminLogin error:', error);
        return res.status(503).json({ success: false, message: 'Admin login is temporarily unavailable' });
    }
};

exports.adminLogout = async (req, res) => {
    req.session.destroy((error) => {
        if (error) return res.status(500).json({ success: false, message: 'Unable to log out' });
        res.clearCookie('connect.sid');
        return res.json({ success: true, message: 'Logged out' });
    });
};

exports.getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.session.adminId);
        if (!admin) return res.status(401).json({ success: false, message: 'Admin session is invalid' });
        return res.json({ id: admin.id, username: admin.username, email: admin.email });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to load admin profile' });
    }
};

exports.updateAdminCredentials = async (req, res) => {
    return res.status(501).json({ success: false, message: 'Credential updates are not enabled yet' });
};

exports.getDashboardOverview = async (req, res) => {
    try {
        const queries = await Promise.all([
            db.query('SELECT COALESCE(SUM(total_amount), 0) AS revenue, COUNT(*) AS orders FROM orders'),
            db.query('SELECT COUNT(*) AS customers FROM users WHERE is_active = 1'),
            db.query('SELECT COUNT(*) AS products, SUM(stock <= 5) AS low_stock FROM products WHERE is_active = 1'),
            db.query("SELECT COUNT(*) AS pending_returns FROM orders WHERE status = 'cancelled'"),
            db.query('SELECT id, customer_name, total_amount, status, created_at FROM orders ORDER BY created_at DESC LIMIT 8'),
            db.query(`SELECT p.id, p.name, p.price, p.stock, c.name AS category_name,
                COALESCE(SUM(oi.quantity), 0) AS units_sold,
                COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue,
                (SELECT image_path FROM product_images pi WHERE pi.product_id = p.id AND pi.is_main = 1 LIMIT 1) AS image
                FROM products p LEFT JOIN categories c ON c.id = p.category_id
                LEFT JOIN order_items oi ON oi.product_id = p.id
                GROUP BY p.id, p.name, p.price, p.stock, c.name
                ORDER BY units_sold DESC LIMIT 5`),
            db.query(`SELECT p.id, p.name, p.stock,
                (SELECT image_path FROM product_images pi WHERE pi.product_id = p.id AND pi.is_main = 1 LIMIT 1) AS image
                FROM products p WHERE p.is_active = 1 AND p.stock <= 5 ORDER BY p.stock ASC LIMIT 6`),
            db.query(`SELECT c.name AS category_name, COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
                FROM categories c LEFT JOIN products p ON p.category_id = c.id
                LEFT JOIN order_items oi ON oi.product_id = p.id
                GROUP BY c.id, c.name ORDER BY revenue DESC`),
            db.query(`SELECT DAYNAME(created_at) AS day, COALESCE(SUM(total_amount), 0) AS revenue, COUNT(*) AS orders
                FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                GROUP BY DATE(created_at), DAYNAME(created_at) ORDER BY DATE(created_at)`)
        ]);

        const [summary, customers, products, returns, recentOrders, topProducts, lowStock, categorySales, salesTrend] = queries;
        return res.json({ success: true, summary: { ...summary[0], ...customers[0], ...products[0], ...returns[0] }, recentOrders, topProducts, lowStock, categorySales, salesTrend });
    } catch (error) {
        console.error('getDashboardOverview error:', error);
        return res.status(500).json({ success: false, message: 'Failed to load dashboard overview' });
    }
};
