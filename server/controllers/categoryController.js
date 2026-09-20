/**
 * SHEMA STORE - Category Controller
 */

const db = require('../config/database');

const CATEGORY_CACHE_TTL_MS = 5 * 60 * 1000;
let categoryCache = { expiresAt: 0, value: null };

function invalidateCategoryCache() {
    categoryCache = { expiresAt: 0, value: null };
}

const DEFAULT_CATEGORIES = [
    { id: 1, name: 'Electronics', description: 'Technology and smart devices' },
    { id: 2, name: 'Fashion', description: 'Style for every occasion' },
    { id: 3, name: 'Home & Living', description: 'Everything for your home' },
    { id: 4, name: 'Beauty', description: 'Beauty and personal care' },
    { id: 5, name: 'Sports & Outdoors', description: 'Move, play and explore' },
    { id: 6, name: 'Toys & Games', description: 'Fun for every age' },
    { id: 7, name: 'Health & Wellness', description: 'Products for a healthier lifestyle' },
    { id: 8, name: 'Grocery & Supermarket', description: 'Everyday household groceries and essentials' },
    { id: 9, name: 'Food & Beverages', description: 'Food, drinks and local favourites' },
    { id: 10, name: 'Baby & Kids', description: 'Clothing, care and essentials for children' },
    { id: 11, name: 'Books & Stationery', description: 'Books, school and office supplies' },
    { id: 12, name: 'Automotive', description: 'Car, motorcycle and transport essentials' },
    { id: 13, name: 'Agriculture & Garden', description: 'Farming, gardening and outdoor supplies' }
];

exports.getAllCategories = async (req, res) => {
    try {
        const includeInactive = req.query.includeInactive === 'true' || Boolean(req.session && req.session.adminId);
        const query = includeInactive
            ? 'SELECT id, name, description, image, is_active FROM categories ORDER BY name ASC'
            : 'SELECT id, name, description, image, is_active FROM categories WHERE is_active = 1 ORDER BY name ASC';

        if (!includeInactive && Date.now() < categoryCache.expiresAt && categoryCache.value) {
            return res.json({ success: true, categories: categoryCache.value });
        }

        const categories = await db.query(query);
        if (!includeInactive) {
            categoryCache = {
                expiresAt: Date.now() + CATEGORY_CACHE_TTL_MS,
                value: categories
            };
        }
        return res.json({ success: true, categories });
    } catch (error) {
        console.error('getAllCategories error:', error);
        return res.json({ success: true, categories: DEFAULT_CATEGORIES, fallback: true });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await db.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        return res.json({ success: true, category: rows[0] });
    } catch (error) {
        console.error('getCategoryById error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch category' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, description = '', image = '', is_active = true } = req.body || {};
        const cleanName = String(name || '').trim();

        if (!cleanName) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }

        const result = await db.query(
            'INSERT INTO categories (name, description, image, is_active) VALUES (?, ?, ?, ?)',
            [cleanName, description || '', image || '', is_active === false ? 0 : 1]
        );

        const rows = await db.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [result.insertId]);
        invalidateCategoryCache();
        return res.status(201).json({ success: true, category: rows[0] });
    } catch (error) {
        console.error('createCategory error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'A category with this name already exists' });
        }
        return res.status(500).json({ success: false, message: 'Failed to create category' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, image, is_active } = req.body || {};
        const existing = await db.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [id]);
        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        const updateData = { ...existing[0], ...(name !== undefined ? { name: String(name).trim() } : {}), ...(description !== undefined ? { description: String(description) } : {}), ...(image !== undefined ? { image: String(image) } : {}), ...(is_active !== undefined ? { is_active: is_active === false ? 0 : 1 } : {}) };

        if (!updateData.name) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }

        await db.query(
            'UPDATE categories SET name = ?, description = ?, image = ?, is_active = ? WHERE id = ?',
            [updateData.name, updateData.description || '', updateData.image || '', updateData.is_active ? 1 : 0, id]
        );

        const updated = await db.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [id]);
        invalidateCategoryCache();
        return res.json({ success: true, category: updated[0] });
    } catch (error) {
        console.error('updateCategory error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'A category with this name already exists' });
        }
        return res.status(500).json({ success: false, message: 'Failed to update category' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const exists = await db.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [id]);
        if (!exists || exists.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        const fallback = await db.query('SELECT id FROM categories WHERE id != ? ORDER BY id ASC LIMIT 1', [id]);
        if (fallback && fallback.length) {
            await db.query('UPDATE products SET category_id = ? WHERE category_id = ?', [fallback[0].id, id]);
        }

        await db.query('DELETE FROM categories WHERE id = ?', [id]);
        invalidateCategoryCache();
        return res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        console.error('deleteCategory error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete category' });
    }
};
