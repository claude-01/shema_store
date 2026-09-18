/**
 * SHEMA STORE - Validation Utility
 */

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (Rwanda format)
 */
function isValidPhone(phone) {
    const phoneRegex = /^(\+?250|0)7\d{8}$/;
    return phoneRegex.test(phone);
}

/**
 * Validate password strength
 */
function isValidPassword(password) {
    return password && password.length >= 6;
}

module.exports = {
    isValidEmail,
    isValidPhone,
    isValidPassword
};
