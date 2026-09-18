/**
 * SHEMA STORE - Settings Controller
 */

const db = require('../config/database');

exports.getSettings = async (req, res) => {
    try {
        const rows = await db.query('SELECT * FROM store_settings LIMIT 1');
        let settings = rows && rows[0] ? rows[0] : {};

        // Prefer environment variable for WhatsApp business number if provided
        if (process.env.WHATSAPP_BUSINESS_NUMBER) {
            settings.whatsapp_number = process.env.WHATSAPP_BUSINESS_NUMBER;
        }

        return res.json(settings);
    } catch (error) {
        console.error('getSettings error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const fields = req.body || {};

        // Ensure settings row exists
        const rows = await db.query('SELECT id FROM store_settings LIMIT 1');
        if (!rows || rows.length === 0) {
            // insert defaults
            await db.query('INSERT INTO store_settings (id, store_name, whatsapp_number) VALUES (1, ?, ?)', [fields.store_name || 'SHEMA STORE', fields.whatsapp_number || null]);
        }

        // Build update set
        const setters = Object.keys(fields).map(k => `${k} = ?`).join(', ');
        const values = Object.values(fields);
        if (setters.length) {
            values.push(1);
            await db.query(`UPDATE store_settings SET ${setters} WHERE id = ?`, values);
        }

        const updated = await db.query('SELECT * FROM store_settings LIMIT 1');
        return res.json(updated && updated[0] ? updated[0] : {});
    } catch (error) {
        console.error('updateSettings error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
};
