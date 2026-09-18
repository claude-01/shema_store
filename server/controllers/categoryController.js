/**
 * SHEMA STORE - Category Controller
 */

const db = require('../config/database');

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
        const categories = await db.query('SELECT id, name, description, image, is_active FROM categories WHERE is_active = 1 ORDER BY name ASC');
        return res.json({ success: true, categories });
    } catch (error) {
        console.error('getAllCategories error:', error);
        return res.json({ success: true, categories: DEFAULT_CATEGORIES, fallback: true });
    }
};

exports.getCategoryById = async (req, res) => {
    // To be implemented
    res.json({ message: 'Get category by ID' });
};

exports.createCategory = async (req, res) => {
    // To be implemented
    res.json({ message: 'Create category' });
};

exports.updateCategory = async (req, res) => {
    // To be implemented
    res.json({ message: 'Update category' });
};

exports.deleteCategory = async (req, res) => {
    // To be implemented
    res.json({ message: 'Delete category' });
};
