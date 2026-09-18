const db = require('../config/database');

// Ensure delivery_zones table exists
async function ensureTable() {
    await db.query(`CREATE TABLE IF NOT EXISTS delivery_zones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        city VARCHAR(100) NOT NULL UNIQUE,
        fee DECIMAL(10,2) DEFAULT 0,
        min_days INT DEFAULT 1,
        max_days INT DEFAULT 3,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
}

async function ensureSeed() {
    const rows = await db.query('SELECT COUNT(*) as cnt FROM delivery_zones');
    const count = rows && rows[0] ? rows[0].cnt : 0;
    if (count === 0) {
        const defaults = [
            ['Kigali', 2000, 1, 2, 1],
            ['Huye', 5000, 2, 4, 1],
            ['Musanze', 4000, 2, 3, 1],
            ['Rubavu', 4500, 2, 3, 1],
            ['Muhanga', 3500, 2, 3, 1],
            ['Nyagatare', 6000, 3, 5, 1],
            ['Rusizi', 6000, 3, 5, 1],
            ['Kayonza', 5000, 3, 4, 1],
            ['Nyamasheke', 5500, 3, 5, 1],
            ['Kibungo', 4500, 2, 4, 1]
        ];
        for (const d of defaults) {
            await db.query('INSERT INTO delivery_zones (city, fee, min_days, max_days, is_active) VALUES (?, ?, ?, ?, ?)', d);
        }
    }
}

exports.listZones = async (req, res) => {
    try {
        await ensureTable();
        await ensureSeed();
        const rows = await db.query('SELECT * FROM delivery_zones ORDER BY city ASC');
        return res.json({ success: true, zones: rows });
    } catch (error) {
        console.error('listZones error:', error);
        return res.status(500).json({ success: false, message: 'Failed to list delivery zones' });
    }
};

exports.createZone = async (req, res) => {
    try {
        await ensureTable();
        const { city, fee, min_days, max_days, is_active } = req.body;
        if (!city) return res.status(400).json({ success: false, message: 'city is required' });
        const result = await db.query('INSERT INTO delivery_zones (city, fee, min_days, max_days, is_active) VALUES (?, ?, ?, ?, ?)', [city, fee || 0, min_days || 1, max_days || 3, is_active ? 1 : 0]);
        const inserted = await db.query('SELECT * FROM delivery_zones WHERE id = ? LIMIT 1', [result.insertId]);
        return res.json({ success: true, zone: inserted[0] });
    } catch (error) {
        console.error('createZone error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create zone' });
    }
};

exports.updateZone = async (req, res) => {
    try {
        await ensureTable();
        const { id } = req.params;
        const fields = req.body || {};
        if (!id) return res.status(400).json({ success: false, message: 'id is required' });
        const setters = Object.keys(fields).map(k => `${k} = ?`).join(', ');
        const values = Object.values(fields);
        values.push(id);
        if (setters.length) await db.query(`UPDATE delivery_zones SET ${setters} WHERE id = ?`, values);
        const updated = await db.query('SELECT * FROM delivery_zones WHERE id = ? LIMIT 1', [id]);
        return res.json({ success: true, zone: updated[0] });
    } catch (error) {
        console.error('updateZone error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update zone' });
    }
};

exports.deleteZone = async (req, res) => {
    try {
        await ensureTable();
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'id is required' });
        await db.query('DELETE FROM delivery_zones WHERE id = ?', [id]);
        return res.json({ success: true });
    } catch (error) {
        console.error('deleteZone error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete zone' });
    }
};

exports.getZoneByCity = async (req, res) => {
    try {
        await ensureTable();
        await ensureSeed();
        const { city } = req.params;
        if (!city) return res.status(400).json({ success: false, message: 'city is required' });
        const rows = await db.query('SELECT * FROM delivery_zones WHERE city = ? LIMIT 1', [city]);
        return res.json({ success: true, zone: rows && rows[0] ? rows[0] : null });
    } catch (error) {
        console.error('getZoneByCity error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch zone' });
    }
};
