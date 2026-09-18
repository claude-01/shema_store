/**
 * SHEMA STORE - Product Model
 */

const db = require('../config/database');

class Product {
    static async create(data) {
        // To be implemented
    }

    static async findById(id) {
        // To be implemented
    }

    static async getAll(filters = {}) {
        // To be implemented
    }

    static async search(query) {
        // To be implemented
    }

    static async update(id, data) {
        // To be implemented
    }

    static async delete(id) {
        // To be implemented
    }

    static async getByCategoryId(categoryId) {
        // To be implemented
    }
}

module.exports = Product;
