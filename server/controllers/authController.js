/**
 * SHEMA STORE - Authentication Controller
 */

const db = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
        const users = await db.query('SELECT id, first_name, last_name, email, password FROM users WHERE email = ? AND is_active = 1 LIMIT 1', [email.trim().toLowerCase()]);
        if (!users.length || !(await comparePassword(password, users[0].password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const user = users[0];
        req.session.userId = user.id;
        delete user.password;
        return res.json({ success: true, user });
    } catch (error) {
        console.error('login error:', error);
        return res.status(500).json({ success: false, message: 'Login failed' });
    }
};

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;
        if (!firstName || !lastName || !email || !password) return res.status(400).json({ success: false, message: 'First name, last name, email, and password are required' });
        if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        const passwordHash = await hashPassword(password);
        const result = await db.query(
            'INSERT INTO users (first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?)',
            [firstName.trim(), lastName.trim(), email.trim().toLowerCase(), phone || null, passwordHash]
        );
        return res.status(201).json({ success: true, userId: result.insertId, message: 'Registration successful' });
    } catch (error) {
        console.error('register error:', error);
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'An account with this email already exists' });
        return res.status(500).json({ success: false, message: 'Registration failed' });
    }
};

exports.logout = async (req, res) => {
    req.session.destroy(() => res.json({ success: true, message: 'Logged out' }));
};

exports.getCurrentUser = async (req, res) => {
    if (!req.session?.userId) return res.json({ success: true, user: null, authenticated: false });
    const users = await db.query('SELECT id, first_name, last_name, email, phone FROM users WHERE id = ? LIMIT 1', [req.session.userId]);
    if (!users.length) return res.json({ success: true, user: null, authenticated: false });
    return res.json({ success: true, user: users[0] });
};
