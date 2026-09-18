/**
 * SHEMA STORE - Password Utility
 * Secure password hashing with bcrypt
 */

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Hash password
 */
async function hashPassword(password) {
    try {
        return await bcrypt.hash(password, SALT_ROUNDS);
    } catch (error) {
        throw new Error('Error hashing password');
    }
}

/**
 * Compare password with hash
 */
async function comparePassword(password, hash) {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        throw new Error('Error comparing password');
    }
}

module.exports = {
    hashPassword,
    comparePassword
};
