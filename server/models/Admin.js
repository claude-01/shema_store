/**
 * SHEMA STORE - Admin Model
 */

const db = require('../config/database');

class Admin {
    static async create(data) {
        const result = await db.query(
            'INSERT INTO admins (username, password, email) VALUES (?, ?, ?)',
            [data.username, data.password, data.email || null]
        );
        return this.findById(result.insertId);
    }

    static async findById(id) {
        const rows = await db.query('SELECT id, username, email, password FROM admins WHERE id = ? LIMIT 1', [id]);
        return rows[0] || null;
    }

    static async findByUsername(username) {
        const rows = await db.query('SELECT id, username, email, password FROM admins WHERE username = ? LIMIT 1', [username]);
        return rows[0] || null;
    }

    static async update(id, data) {
        const fields = Object.keys(data);
        if (!fields.length) return this.findById(id);
        const setters = fields.map(field => `${field} = ?`).join(', ');
        await db.query(`UPDATE admins SET ${setters} WHERE id = ?`, [...fields.map(field => data[field]), id]);
        return this.findById(id);
    }

    static async delete(id) {
        return db.query('DELETE FROM admins WHERE id = ?', [id]);
    }
}

module.exports = Admin;
