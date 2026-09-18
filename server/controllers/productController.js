/**
 * SHEMA STORE - Product Controller
 */

const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', '..', 'images');

function listProjectImages() {
    try {
        if (!fs.existsSync(IMAGES_DIR)) return [];
        return fs.readdirSync(IMAGES_DIR).filter(f => /\.(jpe?g|png|gif|webp)$/i.test(f));
    } catch (err) {
        console.error('listProjectImages error', err);
        return [];
    }
}

function findImageForProduct(name) {
    if (!name) return null;
    const imgs = listProjectImages();
    if (!imgs || imgs.length === 0) return null;

    const n = name.toLowerCase();
    // token priorities
    const tokens = n.split(/[^a-z0-9]+/).filter(Boolean).slice(0, 6);

    // check for direct token matches
    for (const t of tokens) {
        const found = imgs.find(f => f.toLowerCase().includes(t));
        if (found) return `/images/${encodeURI(found)}`;
    }

    // fallback heuristics
    const heuristics = ['phone', 'mobile', 'smart', 'laptop', 'tv', 'television', 'shoe', 'shoes', 'watch', 'bag', 'backpack', 'school', 'jampa'];
    for (const h of heuristics) {
        const found = imgs.find(f => f.toLowerCase().includes(h));
        if (found) return `/images/${encodeURI(found)}`;
    }

    // return first image as last resort
    return imgs.length ? `/images/${encodeURI(imgs[0])}` : null;
}

function imageExists(imagePath) {
    if (!imagePath || /^https?:\/\//i.test(imagePath)) return Boolean(imagePath);

    const cleanPath = imagePath.split('?')[0];
    if (cleanPath.startsWith('/images/')) {
        return fs.existsSync(path.join(IMAGES_DIR, decodeURIComponent(cleanPath.slice('/images/'.length))));
    }
    if (cleanPath.startsWith('/uploads/')) {
        return fs.existsSync(path.join(__dirname, '..', cleanPath.replace(/^\//, '')));
    }

    return fs.existsSync(path.join(IMAGES_DIR, cleanPath.replace(/^\/+/, '')));
}

function categorySlug(name, productName = '') {
    const category = String(name || '').toLowerCase();
    const product = String(productName || '').toLowerCase();

    // Prefer the assigned database category so product names do not override it.
    if (/beauty|skin|makeup|cosmetic|perfume|hair|nivea/.test(category)) return 'beauty';
    if (/sport|outdoor|fitness|gym|football/.test(category)) return 'sports-outdoors';
    if (/toy|game|puzzle|doll|children/.test(category)) return 'toys-games';
    if (/health|wellness|self-care|personal care/.test(category)) return 'health-wellness';
    if (/grocery|supermarket|groceries|household/.test(category)) return 'grocery-supermarket';
    if (/food|beverage|drink|restaurant|snack/.test(category)) return 'food-beverages';
    if (/baby|kid|child|infant/.test(category)) return 'baby-kids';
    if (/book|stationery|school|office/.test(category)) return 'books-stationery';
    if (/automotive|car|motorcycle|vehicle|spare parts/.test(category)) return 'automotive';
    if (/agriculture|garden|farming|farm|seed|fertilizer/.test(category)) return 'agriculture-garden';
    if (/fashion|clothing|shirt|trouser|dress|jacket|bag|watch|shoe/.test(category)) return 'fashion';
    if (/home|living|furniture|kitchen|vase|storage|lighting|appliance/.test(category)) return 'home-living';
    if (category) return 'electronics';

    if (/beauty|skin|makeup|cosmetic|perfume|hair|nivea/.test(product)) return 'beauty';
    if (/sport|outdoor|fitness|gym|football|shoe|sneaker/.test(product)) return 'sports-outdoors';
    if (/toy|game|puzzle|doll|children/.test(product)) return 'toys-games';
    if (/health|wellness|self-care|personal care/.test(product)) return 'health-wellness';
    if (/grocery|supermarket|groceries|household/.test(product)) return 'grocery-supermarket';
    if (/food|beverage|drink|restaurant|snack/.test(product)) return 'food-beverages';
    if (/baby|kid|child|infant/.test(product)) return 'baby-kids';
    if (/book|stationery|school|office/.test(product)) return 'books-stationery';
    if (/automotive|car|motorcycle|vehicle|spare parts/.test(product)) return 'automotive';
    if (/agriculture|garden|farming|farm|seed|fertilizer/.test(product)) return 'agriculture-garden';
    if (/fashion|clothing|shirt|trouser|dress|jacket|bag|watch/.test(product)) return 'fashion';
    if (/home|living|furniture|kitchen|vase|storage|lighting|appliance/.test(product)) return 'home-living';
    return 'electronics';
}

function addCategoryFields(product) {
    const categoryName = product.category_name || product.category || '';
    product.category = categorySlug(categoryName, product.name);
    product.category_name = categoryName || product.category;
    return product;
}

exports.getAllProducts = async (req, res) => {
    try {
        const products = await db.query(`
            SELECT p.*, c.name AS category_name, (
                SELECT image_path FROM product_images pi WHERE pi.product_id = p.id AND pi.is_main = 1 LIMIT 1
            ) AS image
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.is_active = 1
            ORDER BY p.created_at DESC
        `);

        // map missing images to files in /images if possible
        const mapped = products.map(p => {
            try {
                if (!imageExists(p.image) || p.image.includes('placeholder')) {
                    const match = findImageForProduct(p.name || '');
                    if (match) p.image = match;
                }
            } catch (e) { }
            return addCategoryFields(p);
        });

        return res.json({ success: true, products: mapped });
    } catch (error) {
        console.error('getAllProducts error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const products = await db.query('SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ? LIMIT 1', [id]);
        if (!products || products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const product = products[0];
        let images = await db.query('SELECT id, image_path, is_main, order_position FROM product_images WHERE product_id = ? ORDER BY order_position ASC', [id]);
        images = (images || []).filter(image => imageExists(image.image_path));
        if (images.length === 0 && product && product.name) {
            const match = findImageForProduct(product.name);
            if (match) {
                images = [{ id: null, image_path: match, is_main: 1, order_position: 0 }];
            }
        }

        product.image = images[0]?.image_path || null;
        addCategoryFields(product);

        return res.json({ success: true, product, images });
    } catch (error) {
        console.error('getProductById error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch product' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { category_id, name, description, price, stock, discount_percent, is_featured, is_best_seller, is_new_arrival } = req.body;

        if (!category_id || !name) {
            return res.status(400).json({ success: false, message: 'Product name and category are required' });
        }

        const result = await db.query(
            'INSERT INTO products (category_id, name, description, price, stock, discount_percent, is_featured, is_best_seller, is_new_arrival) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [category_id, name, description || '', price || 0, stock || 0, discount_percent || 0, is_featured ? 1 : 0, is_best_seller ? 1 : 0, is_new_arrival ? 1 : 0]
        );

        const inserted = await db.query('SELECT * FROM products WHERE id = ? LIMIT 1', [result.insertId]);
        return res.status(201).json({ success: true, product: inserted[0] });
    } catch (error) {
        console.error('createProduct error:', error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(400).json({ success: false, message: 'The selected category does not exist' });
        }
        return res.status(500).json({ success: false, message: 'Failed to create product' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const fields = req.body;

        const setters = Object.keys(fields).map(k => `${k} = ?`).join(', ');
        const values = Object.values(fields);
        values.push(id);

        await db.query(`UPDATE products SET ${setters} WHERE id = ?`, values);
        const updated = await db.query('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
        return res.json({ success: true, product: updated[0] });
    } catch (error) {
        console.error('updateProduct error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update product' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        console.error('deleteProduct error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
};

exports.addProductImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { image_path, is_main } = req.body;

        if (!image_path) {
            return res.status(400).json({ success: false, message: 'image_path is required' });
        }

        await db.query('INSERT INTO product_images (product_id, image_path, is_main, order_position) VALUES (?, ?, ?, 0)', [id, image_path, is_main ? 1 : 0]);

        return res.json({ success: true, message: 'Image added' });
    } catch (error) {
        console.error('addProductImage error:', error);
        return res.status(500).json({ success: false, message: 'Failed to add product image' });
    }
};

exports.searchProducts = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) return res.json({ success: true, products: [] });

        const products = await db.query(`
            SELECT p.*, c.name AS category_name, (
                SELECT image_path FROM product_images pi WHERE pi.product_id = p.id AND pi.is_main = 1 LIMIT 1
            ) AS image
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.name LIKE ? OR p.description LIKE ?
            LIMIT 50
        `, [`%${q}%`, `%${q}%`]);

        return res.json({ success: true, products: products.map(addCategoryFields) });
    } catch (error) {
        console.error('searchProducts error:', error);
        return res.status(500).json({ success: false, message: 'Search failed' });
    }
};
