/**
 * SHEMA STORE - Database Seeder
 * Populate database with sample data (optional)
 */

const db = require('../server/config/database');

async function seed() {
    try {
        console.log('Starting database seed...');
        
        // Sample categories
        const categories = [
            { name: 'Electronics', description: 'Electronics and gadgets' },
            { name: 'Fashion', description: 'Clothing and accessories' },
            { name: 'Home', description: 'Home and garden items' },
            { name: 'Beauty', description: 'Beauty and personal care' }
        ];

        // Sample products
        const products = [
            { 
                category_id: 1, 
                name: 'Smartphone', 
                description: 'Latest smartphone',
                price: 500000,
                stock: 50
            },
            { 
                category_id: 2, 
                name: 'T-Shirt', 
                description: 'Comfortable cotton t-shirt',
                price: 15000,
                stock: 100
            }
        ];

        console.log('Seed data ready to insert');
        console.log('Note: Implement seed() function to insert sample data');
        
    } catch (error) {
        console.error('Seeding error:', error);
    }
}

// Run seed if called directly
if (require.main === module) {
    seed().then(() => process.exit(0));
}

module.exports = seed;
