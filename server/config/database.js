/**
 * SHEMA STORE - Database Configuration
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const databaseConfig = require('./config').database;

const pool = mysql.createPool({
    ...databaseConfig,
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0,
    multipleStatements: false
});

/**
 * Get Database Connection
 */
async function getConnection() {
    return await pool.getConnection();
}

async function ensureDatabaseDefaults() {
    const connection = await getConnection();

    try {
        const [rows] = await connection.query('SHOW TABLES');
        const tableNames = rows.map(row => Object.values(row)[0]);

        if (!tableNames.includes('store_settings')) {
            await connection.query(`
                CREATE TABLE store_settings (
                    id INT PRIMARY KEY DEFAULT 1,
                    store_name VARCHAR(100) DEFAULT 'SHEMA STORE',
                    whatsapp_number VARCHAR(20) DEFAULT '0793087491',
                    phone VARCHAR(20),
                    email VARCHAR(100),
                    address TEXT,
                    description TEXT,
                    opening_hours VARCHAR(255),
                    delivery_info TEXT,
                    logo_path VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
        }

        if (!tableNames.includes('categories')) {
            await connection.query(`
                CREATE TABLE categories (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) UNIQUE NOT NULL,
                    description TEXT,
                    image VARCHAR(255),
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
        }

        if (!tableNames.includes('products')) {
            await connection.query(`
                CREATE TABLE products (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    category_id INT NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    price DECIMAL(10, 2) NOT NULL,
                    discount_percent INT DEFAULT 0,
                    stock INT DEFAULT 0,
                    is_active BOOLEAN DEFAULT TRUE,
                    is_featured BOOLEAN DEFAULT FALSE,
                    is_best_seller BOOLEAN DEFAULT FALSE,
                    is_new_arrival BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
        }

        if (!tableNames.includes('product_images')) {
            await connection.query(`
                CREATE TABLE product_images (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    product_id INT NOT NULL,
                    image_path VARCHAR(255) NOT NULL,
                    is_main BOOLEAN DEFAULT FALSE,
                    order_position INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        }

        const [settingsRows] = await connection.query('SELECT id FROM store_settings LIMIT 1');
        if (!settingsRows.length) {
            await connection.query('INSERT INTO store_settings (id, store_name, whatsapp_number) VALUES (1, ?, ?)', ['SHEMA STORE', '0793087491']);
        }

        const [categoryRows] = await connection.query('SELECT COUNT(*) AS total FROM categories');
        if (!categoryRows[0].total) {
            const categories = [
                ['Electronics', 'Technology and smart devices'],
                ['Fashion', 'Style for every occasion'],
                ['Home & Living', 'Everything for your home'],
                ['Beauty', 'Beauty and personal care'],
                ['Sports & Outdoors', 'Move, play and explore'],
                ['Toys & Games', 'Fun for every age'],
                ['Health & Wellness', 'Products for a healthier lifestyle'],
                ['Grocery & Supermarket', 'Everyday household groceries and essentials'],
                ['Food & Beverages', 'Food, drinks and local favourites'],
                ['Baby & Kids', 'Clothing, care and essentials for children'],
                ['Books & Stationery', 'Books, school and office supplies'],
                ['Automotive', 'Car, motorcycle and transport essentials'],
                ['Agriculture & Garden', 'Farming, gardening and outdoor supplies']
            ];

            for (const [name, description] of categories) {
                await connection.query('INSERT INTO categories (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE description = VALUES(description)', [name, description]);
            }
        }

        const [productRows] = await connection.query('SELECT COUNT(*) AS total FROM products');
        if (!productRows[0].total) {
            const productCatalog = [
                ['Electronics', 'Samsung Galaxy A15', 'Android smartphone with 128GB storage and 6.5-inch display.', 280000.00, 20],
                ['Fashion', 'Nike Air Force 1', 'Lightweight everyday sneaker with premium cushioning.', 180000.00, 15],
                ['Electronics', 'HP Laptop 15.6', 'Reliable laptop for productivity, study, and entertainment.', 1050000.00, 8],
                ['Home & Living', 'Air Fryer 5.5L', 'Crispy cooking in minutes with adjustable temperature control.', 95000.00, 12],
                ['Beauty', 'Nivea Skincare Set', 'Hydrating skincare essentials for daily care.', 45000.00, 25],
                ['Electronics', 'Smart Watch Pro', 'Track fitness, calls, and notifications on the go.', 120000.00, 18],
                ['Sports & Outdoors', 'Trail Running Backpack', 'Comfortable and durable backpack for daily movement.', 65000.00, 10]
            ];

            for (const [categoryName, name, description, price, stock] of productCatalog) {
                const [category] = await connection.query('SELECT id FROM categories WHERE name = ? LIMIT 1', [categoryName]);
                if (category && category[0]) {
                    await connection.query(
                        'INSERT INTO products (category_id, name, description, price, stock, is_active, is_featured) VALUES (?, ?, ?, ?, ?, 1, 1)',
                        [category[0].id, name, description, price, stock]
                    );
                }
            }
        }
    } catch (error) {
        console.error('Database bootstrap failed:', error);
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * Execute Query
 */
async function query(sql, values) {
    const connection = await getConnection();
    try {
        const [results] = await connection.execute(sql, values);
        return results;
    } finally {
        connection.release();
    }
}

module.exports = {
    pool,
    getConnection,
    query,
    ensureDatabaseDefaults
};
