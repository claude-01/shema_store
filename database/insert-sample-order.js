const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function run() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'shema_store';

  const conn = await mysql.createConnection({ host, user, password, database });
  try {
    // Create a sample user
    const pwHash = await bcrypt.hash('password123', 10);
    const [userRes] = await conn.execute(
      'INSERT INTO users (first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?)',
      ['Test', 'User', 'testuser@example.com', '0700000000', pwHash]
    );
    const userId = userRes.insertId;

    // Create a category
    const [catRes] = await conn.execute(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      ['TestCategory', 'Created by seed script']
    );
    const categoryId = catRes.insertId;

    // Create a product
    const [prodRes] = await conn.execute(
      'INSERT INTO products (category_id, name, description, price, stock) VALUES (?, ?, ?, ?, ?)',
      [categoryId, 'Sample Product', 'Seeded sample product', 100.00, 10]
    );
    const productId = prodRes.insertId;

    // Create an order
    const totalAmount = 100.00;
    const [orderRes] = await conn.execute(
      'INSERT INTO orders (user_id, customer_name, customer_phone, delivery_location, notes, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, 'Test User', '0700000000', '123 Test Street', 'Seed order', totalAmount, 'pending']
    );
    const orderId = orderRes.insertId;

    // Create order item
    await conn.execute(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, productId, 1, 100.00]
    );

    console.log('Sample data inserted. Order ID:', orderId);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message || err);
    process.exit(1);
  } finally {
    try { await conn.end(); } catch(e){}
  }
}

run();
