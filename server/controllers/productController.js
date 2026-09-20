/**
 * SHEMA STORE - Product Controller
 */

const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', '..', 'images');
const PRODUCT_LIST_CACHE_TTL_MS = 60 * 1000;
let productListCache = { expiresAt: 0, value: null };

function getCachedProductList() {
    return Date.now() < productListCache.expiresAt ? productListCache.value : null;
}

function setProductListCache(value) {
    productListCache = { expiresAt: Date.now() + PRODUCT_LIST_CACHE_TTL_MS, value };
}

function invalidateProductListCache() {
    productListCache = { expiresAt: 0, value: null };
}

function listProjectImages() {
    try {
        if (!fs.existsSync(IMAGES_DIR)) return [];
        return fs.readdirSync(IMAGES_DIR).filter(f => /\.(jpe?g|png|gif|webp|avif)$/i.test(f));
    } catch (err) {
        console.error('listProjectImages error', err);
        return [];
    }
}

function findImageForProduct(name) {
    if (!name) return null;

    const imgs = listProjectImages();
    if (!imgs || imgs.length === 0) return null;

    const productName = String(name).toLowerCase();
    const tokens = productName.split(/[^a-z0-9]+/).filter(Boolean).slice(0, 8);

    for (const token of tokens) {
        const found = imgs.find(file => file.toLowerCase().includes(token));
        if (found) return `/images/${encodeURI(found)}`;
    }

    const synonymGroups = [
        ['phone', 'iphone', 'mobile', 'pixel', 'galaxy', 'poco', 'xiaomi'],
        ['laptop', 'computer', 'notebook'],
        ['watch', 'smartwatch'],
        ['shoe', 'sneaker', 'boot'],
        ['bag', 'backpack', 'school'],
        ['speaker', 'audio', 'wifi'],
        ['camera', 'webcam'],
        ['skincare', 'beauty', 'nivea', 'cream', 'cosmetic'],
        ['kitchen', 'fryer', 'blender', 'pressure cooker', 'storage'],
        ['sport', 'fitness', 'trail', 'running', 'gym']
    ];

    for (const group of synonymGroups) {
        if (!tokens.some(token => group.some(keyword => token === keyword || productName.includes(keyword)))) {
            continue;
        }

        for (const keyword of group) {
            const found = imgs.find(file => file.toLowerCase().includes(keyword));
            if (found) return `/images/${encodeURI(found)}`;
        }
    }

    return null;
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

function parseSizes(value) {
    if (Array.isArray(value)) return value.map(size => String(size).trim()).filter(Boolean);
    return String(value || '').split(',').map(size => size.trim()).filter(Boolean);
}

function normalizeProductVariantKey(name = '') {
    const value = String(name || '').toLowerCase();
    const withColorRemoved = value
        .replace(/\s*[-–—:]\s*(black|white|red|blue|green|gold|silver|pink|purple|orange|brown|beige|grey|gray|navy|cream|charcoal|rose|olive|maroon|ivory|multicolor|tan)\b/gi, '')
        .replace(/\b(black|white|red|blue|green|gold|silver|pink|purple|orange|brown|beige|grey|gray|navy|cream|charcoal|rose|olive|maroon|ivory|multicolor|tan)\b/gi, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return withColorRemoved || value.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractColorFromName(name = '') {
    const colorMatch = String(name || '').match(/\b(black|white|red|blue|green|gold|silver|pink|purple|orange|brown|beige|grey|gray|navy|cream|charcoal|rose|olive|maroon|ivory|multicolor|tan)\b/i);
    return colorMatch ? colorMatch[1] : 'Default';
}

function productDisplayName(name = '') {
    return String(name || '').replace(/\s*[-–—:]\s*(black|white|red|blue|green|gold|silver|pink|purple|orange|brown|beige|grey|gray|navy|cream|charcoal|rose|olive|maroon|ivory|multicolor|tan)\b/gi, '').replace(/\s+/g, ' ').trim() || String(name || '').trim();
}

function mergeDuplicateVariants(products) {
    const groups = new Map();

    for (const product of products) {
        const key = normalizeProductVariantKey(product.name || '');
        if (!groups.has(key)) {
            groups.set(key, {
                ...product,
                name: productDisplayName(product.name),
                color_options: [],
                variants: []
            });
        }

        const group = groups.get(key);
        const colorName = extractColorFromName(product.name);
        if (!group.color_options.some(color => color.name === colorName)) {
            group.color_options.push({ name: colorName, image: product.image || null });
        }
        group.variants.push({
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            image: product.image || null,
            color: colorName,
            description: product.description || ''
        });
    }

    return Array.from(groups.values()).map(group => ({
        ...group,
        description: group.description || 'Premium product designed for comfort, style, and everyday use.',
        color_options: group.color_options.slice(0, 6),
        variants: group.variants.slice(0, 8)
    }));
}

exports.getAllProducts = async (req, res) => {
    try {
        const includeInactive = req.query.includeInactive === 'true' || Boolean(req.session && req.session.adminId);

        const cacheKey = includeInactive ? 'all' : 'active';
        const cachedResult = getCachedProductList();
        if (cachedResult && cacheKey === 'active') {
            return res.json({ success: true, products: cachedResult });
        }

        const products = await db.query(`
            SELECT p.*, c.name AS category_name, (
                SELECT image_path FROM product_images pi WHERE pi.product_id = p.id AND pi.is_main = 1 LIMIT 1
            ) AS image
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            ${includeInactive ? '' : 'WHERE p.is_active = 1'}
            ORDER BY p.created_at DESC
        `);

        const mapped = products.map(p => {
            try {
                if (!imageExists(p.image) || p.image.includes('placeholder')) {
                    const match = findImageForProduct(p.name || '');
                    if (match) p.image = match;
                }
            } catch (e) { }
            return addCategoryFields(p);
        });

        const result = mergeDuplicateVariants(mapped);
        if (!includeInactive) {
            setProductListCache(result);
        }
        return res.json({ success: true, products: result });
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
        product.sizes = await db.query('SELECT id, size FROM product_sizes WHERE product_id = ? ORDER BY id ASC', [id]);
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
        const { category_id, name, description, price, stock, available_sizes, discount_percent, is_featured, is_best_seller, is_new_arrival } = req.body;

        if (!category_id || !name) {
            return res.status(400).json({ success: false, message: 'Product name and category are required' });
        }

        const result = await db.query(
            'INSERT INTO products (category_id, name, description, price, stock, discount_percent, is_featured, is_best_seller, is_new_arrival) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [category_id, name, description || '', price || 0, stock || 0, discount_percent || 0, is_featured ? 1 : 0, is_best_seller ? 1 : 0, is_new_arrival ? 1 : 0]
        );

        const inserted = await db.query('SELECT * FROM products WHERE id = ? LIMIT 1', [result.insertId]);
        for (const size of parseSizes(available_sizes)) {
            await db.query('INSERT INTO product_sizes (product_id, size) VALUES (?, ?)', [result.insertId, size]);
        }
        inserted[0].sizes = await db.query('SELECT id, size FROM product_sizes WHERE product_id = ? ORDER BY id ASC', [result.insertId]);
        invalidateProductListCache();
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
        const { available_sizes, ...fields } = req.body;

        const setters = Object.keys(fields).map(k => `${k} = ?`).join(', ');
        const values = Object.values(fields);
        values.push(id);

        if (setters) await db.query(`UPDATE products SET ${setters} WHERE id = ?`, values);
        if (available_sizes !== undefined) {
            await db.query('DELETE FROM product_sizes WHERE product_id = ?', [id]);
            for (const size of parseSizes(available_sizes)) {
                await db.query('INSERT INTO product_sizes (product_id, size) VALUES (?, ?)', [id, size]);
            }
        }
        const updated = await db.query('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
        updated[0].sizes = await db.query('SELECT id, size FROM product_sizes WHERE product_id = ? ORDER BY id ASC', [id]);
        invalidateProductListCache();
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
        invalidateProductListCache();
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
        invalidateProductListCache();

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
              WHERE p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?
              LIMIT 50
          `, [`%${q}%`, `%${q}%`, `%${q}%`]);

        return res.json({ success: true, products: products.map(addCategoryFields) });
    } catch (error) {
        console.error('searchProducts error:', error);
        return res.status(500).json({ success: false, message: 'Search failed' });
    }
};
