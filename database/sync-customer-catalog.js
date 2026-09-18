const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const categories = [
    { name: 'Electronics', description: 'Electronics and gadgets' },
    { name: 'Fashion', description: 'Clothing and accessories' },
    { name: 'Home', description: 'Home and garden items' },
    { name: 'Beauty', description: 'Beauty and personal care' },
    { name: 'Grocery & Supermarket', description: 'Everyday household groceries and essentials' },
    { name: 'Food & Beverages', description: 'Food, drinks and local favourites' },
    { name: 'Baby & Kids', description: 'Clothing, care and essentials for children' },
    { name: 'Books & Stationery', description: 'Books, school and office supplies' },
    { name: 'Automotive', description: 'Car, motorcycle and transport essentials' },
    { name: 'Agriculture & Garden', description: 'Farming, gardening and outdoor supplies' }
];

const products = [
    { category: 'Electronics', name: 'Samsung Galaxy A15', price: 280000, stock: 20, image: '/images/phone.jpg' },
    { category: 'Fashion', name: 'Nike Air Force 1', price: 180000, stock: 15, image: '/images/shoes.jpg' },
    { category: 'Electronics', name: 'HP Laptop 15.6"', price: 1050000, stock: 8, image: '/images/laptop.jpg' },
    { category: 'Home', name: 'Air Fryer 5.5L', price: 95000, stock: 12, image: '/images/tv.jpg' },
    { category: 'Beauty', name: 'Nivea Skincare Set', price: 45000, stock: 25, image: '/images/jampa.jpg' },
    { category: 'Electronics', name: 'Smart Watch', price: 120000, stock: 18, image: '/images/watch.jpg' }
];

async function syncCatalog() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shema_store'
    });

    try {
        const categoryIds = {};
        for (const category of categories) {
            await connection.execute(
                'INSERT INTO categories (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE description = VALUES(description)',
                [category.name, category.description]
            );
            const [rows] = await connection.execute('SELECT id FROM categories WHERE name = ? LIMIT 1', [category.name]);
            categoryIds[category.name] = rows[0].id;
        }

        for (const product of products) {
            await connection.execute(
                `INSERT INTO products (category_id, name, description, price, stock, is_active, is_featured)
                 VALUES (?, ?, ?, ?, ?, 1, 1)
                 ON DUPLICATE KEY UPDATE category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), stock = VALUES(stock), is_active = 1`,
                [categoryIds[product.category], product.name, product.name, product.price, product.stock]
            );
            const [rows] = await connection.execute('SELECT id FROM products WHERE name = ? LIMIT 1', [product.name]);
            const productId = rows[0].id;
            const [images] = await connection.execute('SELECT id FROM product_images WHERE product_id = ? LIMIT 1', [productId]);
            if (images.length === 0) {
                await connection.execute(
                    'INSERT INTO product_images (product_id, image_path, is_main, order_position) VALUES (?, ?, 1, 0)',
                    [productId, product.image]
                );
            }
        }

        const [count] = await connection.execute('SELECT COUNT(*) AS total FROM products WHERE is_active = 1');
        console.log(`Customer catalog synchronized. Active products: ${count[0].total}`);
    } finally {
        await connection.end();
    }
}

syncCatalog().catch((error) => {
    console.error('Customer catalog sync failed:', error.message || error);
    process.exitCode = 1;
});