const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function run() {
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'shema_store';

    const conn = await mysql.createConnection({ host, user, password, database });
    try {
        // Insert categories
        const categories = [
            { name: 'Electronics', description: 'Electronics and gadgets' },
            { name: 'Fashion', description: 'Clothing and accessories' },
            { name: 'Home', description: 'Home and garden items' },
            { name: 'Grocery & Supermarket', description: 'Everyday household groceries and essentials' },
            { name: 'Food & Beverages', description: 'Food, drinks and local favourites' },
            { name: 'Baby & Kids', description: 'Clothing, care and essentials for children' },
            { name: 'Books & Stationery', description: 'Books, school and office supplies' },
            { name: 'Automotive', description: 'Car, motorcycle and transport essentials' },
            { name: 'Agriculture & Garden', description: 'Farming, gardening and outdoor supplies' }
        ];

        for (const cat of categories) {
            const [cRes] = await conn.execute('INSERT INTO categories (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = name', [cat.name, cat.description]);
            cat.id = cRes.insertId || (await conn.execute('SELECT id FROM categories WHERE name = ? LIMIT 1', [cat.name]))[0][0].id;
        }

        // Insert products
        const products = [
            { category_id: categories[0].id, name: 'Smartphone X', description: 'Latest Smartphone X with features', price: 499.99, stock: 25 },
            { category_id: categories[1].id, name: 'Casual T-Shirt', description: 'Comfortable cotton t-shirt', price: 19.99, stock: 200 },
            { category_id: categories[2].id, name: 'Ceramic Vase', description: 'Handmade ceramic vase', price: 29.99, stock: 50 }
        ];

        for (const p of products) {
            const [pRes] = await conn.execute(
                'INSERT INTO products (category_id, name, description, price, stock, is_active) VALUES (?, ?, ?, ?, ?, 1)',
                [p.category_id, p.name, p.description, p.price, p.stock]
            );
            const productId = pRes.insertId;

            // Use an asset that is always available in the project.
            const imagePath = '/images/download.jpg';
            await conn.execute('INSERT INTO product_images (product_id, image_path, is_main, order_position) VALUES (?, ?, 1, 0)', [productId, imagePath]);
        }

        console.log('Products seeded successfully');
        process.exit(0);
    } catch (err) {
        console.error('Seeding products failed:', err.message || err);
        process.exit(1);
    } finally {
        try { await conn.end(); } catch(e){}
    }
}

run();
